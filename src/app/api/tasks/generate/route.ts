import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { getDailyChallenge, getProblems } from '@/lib/leetcode';
import { UserPreferences } from '@/types';

// POST /api/tasks/generate - Generate daily tasks
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const preferences = (user?.preferences as unknown as UserPreferences) || {
      dailyProblems: 2,
      dailyLearningMinutes: 60,
      difficultyPreference: 'balanced',
      focusAreas: [],
      includeDailyChallenge: true,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if tasks already exist for today
    const existingTasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        date: today,
      },
    });

    if (existingTasks.length > 0) {
      return successResponse({
        message: 'Tasks already generated for today',
        tasks: existingTasks,
      });
    }

    const tasksToCreate = [];

    // Add LeetCode daily challenge if enabled
    if (preferences.includeDailyChallenge) {
      const dailyChallenge = await getDailyChallenge();
      if (dailyChallenge) {
        tasksToCreate.push({
          userId: session.user.id,
          date: today,
          type: 'PROBLEM' as const,
          title: `Daily Challenge: ${dailyChallenge.question.title}`,
          description: `LeetCode Daily Challenge - ${dailyChallenge.question.difficulty}`,
          referenceLink: `https://leetcode.com/problems/${dailyChallenge.question.titleSlug}/`,
          platform: 'LEETCODE' as const,
          difficulty: dailyChallenge.question.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD',
          tags: dailyChallenge.question.topicTags.map((t) => t.name),
          status: 'PENDING' as const,
        });
      }
    }

    // Add additional problems based on preferences
    const problemsNeeded = preferences.dailyProblems - (preferences.includeDailyChallenge ? 1 : 0);
    if (problemsNeeded > 0) {
      const difficulty = preferences.difficultyPreference === 'balanced'
        ? undefined
        : preferences.difficultyPreference.toUpperCase();

      const problems = await getProblems(undefined, difficulty, problemsNeeded);

      for (const problem of problems) {
        tasksToCreate.push({
          userId: session.user.id,
          date: today,
          type: 'PROBLEM' as const,
          title: problem.title,
          description: `Practice problem - ${problem.difficulty}`,
          referenceLink: `https://leetcode.com/problems/${problem.titleSlug}/`,
          platform: 'LEETCODE' as const,
          difficulty: problem.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD',
          tags: problem.topicTags.map((t) => t.name),
          status: 'PENDING' as const,
        });
      }
    }

    // Add learning tasks based on focus areas
    const subjects = await prisma.subject.findMany({
      where: preferences.focusAreas.length > 0
        ? { name: { in: preferences.focusAreas } }
        : {},
      include: { topics: { take: 1 } },
      take: 2,
    });

    for (const subject of subjects) {
      if (subject.topics.length > 0) {
        tasksToCreate.push({
          userId: session.user.id,
          date: today,
          type: 'LEARNING' as const,
          title: `Study: ${subject.name} - ${subject.topics[0].name}`,
          description: subject.topics[0].description || `Learn about ${subject.topics[0].name}`,
          referenceLink: null,
          platform: null,
          difficulty: null,
          tags: [subject.name],
          status: 'PENDING' as const,
        });
      }
    }

    // Create all tasks
    const createdTasks = await prisma.task.createManyAndReturn({
      data: tasksToCreate,
    });

    return successResponse({
      message: `Generated ${createdTasks.length} tasks for today`,
      tasks: createdTasks,
    });
  } catch (error) {
    console.error('Error generating tasks:', error);
    return serverErrorResponse('Failed to generate tasks');
  }
}
