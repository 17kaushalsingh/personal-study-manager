import prisma from '@/lib/db';
import { getDailyChallenge, getProblems as getLeetCodeProblems } from '@/lib/leetcode';
import { getProblems as getCodeforcesProblems } from '@/lib/codeforces';
import { UserPreferences, Difficulty } from '@/types';

interface TaskGeneratorInput {
  userId: string;
  preferences: UserPreferences;
  date: Date;
}

interface GeneratedTask {
  userId: string;
  date: Date;
  type: 'PROBLEM' | 'LEARNING' | 'REVIEW';
  title: string;
  description: string | null;
  referenceLink: string | null;
  platform: 'LEETCODE' | 'CODEFORCES' | null;
  difficulty: Difficulty | null;
  tags: string[];
  status: 'PENDING';
}

// Difficulty distribution for balanced preference
const BALANCED_DISTRIBUTION = {
  EASY: 0.3,
  MEDIUM: 0.5,
  HARD: 0.2,
};

// Days until a topic should be reviewed (spaced repetition)
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

export async function generateDailyTasks(input: TaskGeneratorInput): Promise<GeneratedTask[]> {
  const { userId, preferences, date } = input;
  const tasks: GeneratedTask[] = [];

  // Get user's history for smart recommendations
  const [completedTasks, userSubjects] = await Promise.all([
    getCompletedTasksHistory(userId),
    getUserSubjectsWithProgress(userId, preferences.focusAreas),
  ]);

  // 1. Add LeetCode Daily Challenge if enabled
  if (preferences.includeDailyChallenge) {
    const dailyChallengeTask = await generateDailyChallengeTask(userId, date);
    if (dailyChallengeTask) {
      tasks.push(dailyChallengeTask);
    }
  }

  // 2. Add problem-solving tasks
  const problemsNeeded = preferences.dailyProblems - (preferences.includeDailyChallenge ? 1 : 0);
  if (problemsNeeded > 0) {
    const problemTasks = await generateProblemTasks(
      userId,
      date,
      problemsNeeded,
      preferences,
      completedTasks
    );
    tasks.push(...problemTasks);
  }

  // 3. Add learning tasks based on curriculum progress
  const learningTasks = await generateLearningTasks(userId, date, userSubjects, preferences);
  tasks.push(...learningTasks);

  // 4. Add review tasks based on spaced repetition
  const reviewTasks = await generateReviewTasks(userId, date, completedTasks);
  tasks.push(...reviewTasks);

  return tasks;
}

async function generateDailyChallengeTask(
  userId: string,
  date: Date
): Promise<GeneratedTask | null> {
  try {
    const dailyChallenge = await getDailyChallenge();
    if (!dailyChallenge) return null;

    return {
      userId,
      date,
      type: 'PROBLEM',
      title: `Daily Challenge: ${dailyChallenge.question.title}`,
      description: `LeetCode Daily Challenge - ${dailyChallenge.question.difficulty}`,
      referenceLink: `https://leetcode.com/problems/${dailyChallenge.question.titleSlug}/`,
      platform: 'LEETCODE',
      difficulty: dailyChallenge.question.difficulty.toUpperCase() as Difficulty,
      tags: dailyChallenge.question.topicTags.map((t) => t.name),
      status: 'PENDING',
    };
  } catch (error) {
    console.error('Error fetching daily challenge:', error);
    return null;
  }
}

async function generateProblemTasks(
  userId: string,
  date: Date,
  count: number,
  preferences: UserPreferences,
  completedTasks: CompletedTaskHistory
): Promise<GeneratedTask[]> {
  const tasks: GeneratedTask[] = [];
  const completedProblemTitles = new Set(
    completedTasks.problems.map((p) => p.title.toLowerCase())
  );

  // Determine difficulty distribution
  const difficultyDistribution = getDifficultyDistribution(preferences.difficultyPreference, count);

  // Fetch problems from LeetCode
  const leetcodeProblems = await fetchLeetCodeProblems(
    difficultyDistribution,
    preferences.focusAreas,
    completedProblemTitles
  );

  for (const problem of leetcodeProblems.slice(0, count)) {
    tasks.push({
      userId,
      date,
      type: 'PROBLEM',
      title: problem.title,
      description: `Practice problem - ${problem.difficulty}`,
      referenceLink: `https://leetcode.com/problems/${problem.titleSlug}/`,
      platform: 'LEETCODE',
      difficulty: problem.difficulty.toUpperCase() as Difficulty,
      tags: problem.topicTags.map((t: { name: string }) => t.name),
      status: 'PENDING',
    });
  }

  // If we need more problems and user has Codeforces handle, add from there
  if (tasks.length < count && preferences.codeforcesHandle) {
    const codeforcesProblems = await fetchCodeforcesProblems(
      difficultyDistribution,
      completedProblemTitles,
      count - tasks.length
    );

    for (const problem of codeforcesProblems) {
      tasks.push({
        userId,
        date,
        type: 'PROBLEM',
        title: problem.name,
        description: `Codeforces problem - Rating: ${problem.rating || 'Unrated'}`,
        referenceLink: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
        platform: 'CODEFORCES',
        difficulty: ratingToDifficulty(problem.rating),
        tags: problem.tags,
        status: 'PENDING',
      });
    }
  }

  return tasks;
}

async function generateLearningTasks(
  userId: string,
  date: Date,
  userSubjects: SubjectWithProgress[],
  preferences: UserPreferences
): Promise<GeneratedTask[]> {
  const tasks: GeneratedTask[] = [];
  const targetMinutes = preferences.dailyLearningMinutes;

  // Prioritize subjects: in-progress > not started > completed
  const sortedSubjects = [...userSubjects].sort((a, b) => {
    const priorityA = getSubjectPriority(a);
    const priorityB = getSubjectPriority(b);
    return priorityA - priorityB;
  });

  // Calculate how many learning tasks to create (roughly 30 min per task)
  const learningTaskCount = Math.ceil(targetMinutes / 30);
  let addedCount = 0;

  for (const subject of sortedSubjects) {
    if (addedCount >= learningTaskCount) break;

    // Skip completed subjects
    if (subject.status === 'DONE' || subject.progress >= 100) continue;

    // Get the next topic based on progress
    const nextTopic = subject.topics[subject.currentTopicIndex];

    if (nextTopic) {
      tasks.push({
        userId,
        date,
        type: 'LEARNING',
        title: `Study: ${subject.name} - ${nextTopic.name}`,
        description: nextTopic.description || `Learn about ${nextTopic.name} in ${subject.name}`,
        referenceLink: null,
        platform: null,
        difficulty: null,
        tags: [subject.name, nextTopic.name],
        status: 'PENDING',
      });
      addedCount++;
    }
  }

  return tasks;
}

async function generateReviewTasks(
  userId: string,
  date: Date,
  completedTasks: CompletedTaskHistory
): Promise<GeneratedTask[]> {
  const tasks: GeneratedTask[] = [];
  const today = date.getTime();

  // Check for topics that need review based on spaced repetition
  for (const topic of completedTasks.learning) {
    const completedDate = new Date(topic.completedAt).getTime();
    const daysSinceCompletion = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));

    // Check if it's time for review
    const shouldReview = REVIEW_INTERVALS.some(
      (interval) => daysSinceCompletion === interval
    );

    if (shouldReview) {
      tasks.push({
        userId,
        date,
        type: 'REVIEW',
        title: `Review: ${topic.title}`,
        description: `Spaced repetition review - ${daysSinceCompletion} days since completion`,
        referenceLink: null,
        platform: null,
        difficulty: null,
        tags: topic.tags,
        status: 'PENDING',
      });
    }
  }

  // Limit review tasks to 2 per day
  return tasks.slice(0, 2);
}

// Helper functions

interface CompletedTaskHistory {
  problems: { title: string; platform: string; completedAt: Date }[];
  learning: { title: string; tags: string[]; completedAt: Date }[];
}

async function getCompletedTasksHistory(userId: string): Promise<CompletedTaskHistory> {
  const completedTasks = await prisma.task.findMany({
    where: {
      userId,
      status: 'COMPLETED',
    },
    select: {
      title: true,
      type: true,
      platform: true,
      tags: true,
      completedAt: true,
    },
    orderBy: {
      completedAt: 'desc',
    },
    take: 100,
  });

  return {
    problems: completedTasks
      .filter((t) => t.type === 'PROBLEM')
      .map((t) => ({
        title: t.title,
        platform: t.platform || 'LEETCODE',
        completedAt: t.completedAt || new Date(),
      })),
    learning: completedTasks
      .filter((t) => t.type === 'LEARNING')
      .map((t) => ({
        title: t.title,
        tags: t.tags,
        completedAt: t.completedAt || new Date(),
      })),
  };
}

interface SubjectWithProgress {
  id: string;
  name: string;
  status: string;
  topics: {
    id: string;
    name: string;
    description: string | null;
    order: number;
  }[];
  progress: number;
  currentTopicIndex: number;
}

async function getUserSubjectsWithProgress(
  userId: string,
  focusAreas: string[]
): Promise<SubjectWithProgress[]> {
  const subjects = await prisma.subject.findMany({
    where: focusAreas.length > 0 ? { name: { in: focusAreas } } : {},
    include: {
      topics: {
        orderBy: { order: 'asc' },
      },
      userSubjects: {
        where: { userId },
      },
    },
    orderBy: { order: 'asc' },
  });

  return subjects.map((subject) => {
    const userSubject = subject.userSubjects[0];
    const progress = userSubject?.progress || 0;
    const status = userSubject?.status || 'TODO';

    // Calculate current topic index based on progress
    const totalTopics = subject.topics.length;
    const currentTopicIndex = totalTopics > 0
      ? Math.floor((progress / 100) * totalTopics)
      : 0;

    return {
      id: subject.id,
      name: subject.name,
      status,
      topics: subject.topics.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        order: t.order,
      })),
      progress,
      currentTopicIndex: Math.min(currentTopicIndex, totalTopics - 1),
    };
  });
}

function getSubjectPriority(subject: SubjectWithProgress): number {
  // Prioritize: in-progress > not started > completed
  if (subject.status === 'IN_PROGRESS') return 1;
  if (subject.status === 'TODO') return 2;
  return 3; // DONE
}

function getDifficultyDistribution(
  preference: string,
  count: number
): { EASY: number; MEDIUM: number; HARD: number } {
  if (preference === 'balanced') {
    return {
      EASY: Math.round(count * BALANCED_DISTRIBUTION.EASY),
      MEDIUM: Math.round(count * BALANCED_DISTRIBUTION.MEDIUM),
      HARD: Math.round(count * BALANCED_DISTRIBUTION.HARD),
    };
  }

  const distribution = { EASY: 0, MEDIUM: 0, HARD: 0 };
  distribution[preference.toUpperCase() as keyof typeof distribution] = count;
  return distribution;
}

async function fetchLeetCodeProblems(
  distribution: { EASY: number; MEDIUM: number; HARD: number },
  focusAreas: string[],
  completedTitles: Set<string>
) {
  const problems: Array<{
    title: string;
    titleSlug: string;
    difficulty: string;
    topicTags: { name: string }[];
  }> = [];

  // Map focus areas to LeetCode tags
  const tagMap: Record<string, string[]> = {
    DSA: ['array', 'string', 'hash-table', 'tree', 'graph'],
    'Competitive Programming': ['dynamic-programming', 'greedy', 'binary-search'],
    DBMS: ['database'],
  };

  const tags = focusAreas.flatMap((area) => tagMap[area] || []);

  // Fetch problems for each difficulty
  for (const [difficulty, count] of Object.entries(distribution)) {
    if (count === 0) continue;

    try {
      const fetchedProblems = await getLeetCodeProblems(
        tags.length > 0 ? tags : undefined,
        difficulty,
        count * 3 // Fetch extra to filter out completed
      );

      const filtered = fetchedProblems.filter(
        (p) => !completedTitles.has(p.title.toLowerCase())
      );

      problems.push(...filtered.slice(0, count));
    } catch (error) {
      console.error(`Error fetching ${difficulty} problems:`, error);
    }
  }

  return problems;
}

async function fetchCodeforcesProblems(
  distribution: { EASY: number; MEDIUM: number; HARD: number },
  completedTitles: Set<string>,
  count: number
) {
  try {
    // Map difficulty to Codeforces rating ranges
    const ratingRanges = {
      EASY: { min: 800, max: 1200 },
      MEDIUM: { min: 1200, max: 1600 },
      HARD: { min: 1600, max: 2200 },
    };

    // Determine which rating range to use
    const targetDifficulty = Object.entries(distribution)
      .filter(([, c]) => c > 0)
      .map(([d]) => d)[0] as keyof typeof ratingRanges || 'MEDIUM';

    const range = ratingRanges[targetDifficulty];
    const problems = await getCodeforcesProblems(range.min, undefined, count * 2);

    return problems
      .filter((p) => !completedTitles.has(p.name.toLowerCase()))
      .filter((p) => p.rating && p.rating >= range.min && p.rating <= range.max)
      .slice(0, count);
  } catch (error) {
    console.error('Error fetching Codeforces problems:', error);
    return [];
  }
}

function ratingToDifficulty(rating?: number): Difficulty {
  if (!rating) return 'MEDIUM';
  if (rating < 1200) return 'EASY';
  if (rating < 1600) return 'MEDIUM';
  return 'HARD';
}

export async function checkAndGenerateTasks(userId: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if tasks already exist for today
  const existingTasks = await prisma.task.count({
    where: {
      userId,
      date: today,
    },
  });

  return existingTasks === 0;
}
