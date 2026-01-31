import { LeetCodeStats, LeetCodeProblem, LeetCodeDailyChallenge } from '@/types';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

/**
 * Fetch user profile stats from LeetCode
 */
export async function getUserStats(username: string): Promise<LeetCodeStats | null> {
  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        profile {
          ranking
        }
      }
    }
  `;

  try {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const user = data.data?.matchedUser;

    if (!user) {
      return null;
    }

    const submissions = user.submitStats?.acSubmissionNum || [];
    const getCount = (difficulty: string) =>
      submissions.find((s: { difficulty: string; count: number }) => s.difficulty === difficulty)?.count || 0;

    const totalSolved = getCount('All');
    const easySolved = getCount('Easy');
    const mediumSolved = getCount('Medium');
    const hardSolved = getCount('Hard');

    return {
      username: user.username,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      ranking: user.profile?.ranking || 0,
      acceptanceRate: totalSolved > 0 ? Math.round((totalSolved / (totalSolved + 10)) * 100) : 0,
    };
  } catch (error) {
    console.error('Error fetching LeetCode user stats:', error);
    return null;
  }
}

/**
 * Fetch the daily challenge from LeetCode
 */
export async function getDailyChallenge(): Promise<LeetCodeDailyChallenge | null> {
  const query = `
    query questionOfToday {
      activeDailyCodingChallengeQuestion {
        date
        question {
          questionId
          title
          titleSlug
          difficulty
          topicTags {
            name
          }
          acRate
        }
      }
    }
  `;

  try {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const challenge = data.data?.activeDailyCodingChallengeQuestion;

    if (!challenge) {
      return null;
    }

    return {
      date: challenge.date,
      question: {
        questionId: challenge.question.questionId,
        title: challenge.question.title,
        titleSlug: challenge.question.titleSlug,
        difficulty: challenge.question.difficulty,
        topicTags: challenge.question.topicTags,
        acRate: challenge.question.acRate,
      },
    };
  } catch (error) {
    console.error('Error fetching daily challenge:', error);
    return null;
  }
}

/**
 * Fetch problems from LeetCode with optional filters
 */
export async function getProblems(
  tags?: string[],
  difficulty?: string,
  limit: number = 50
): Promise<LeetCodeProblem[]> {
  const query = `
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
      ) {
        questions: data {
          questionId
          title
          titleSlug
          difficulty
          topicTags {
            name
          }
          acRate
        }
      }
    }
  `;

  const filters: { tags?: string[]; difficulty?: string } = {};
  if (tags && tags.length > 0) {
    filters.tags = tags;
  }
  if (difficulty) {
    filters.difficulty = difficulty.toUpperCase();
  }

  try {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query,
        variables: {
          categorySlug: '',
          limit,
          skip: 0,
          filters,
        },
      }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const questions = data.data?.problemsetQuestionList?.questions || [];

    return questions.map((q: LeetCodeProblem) => ({
      questionId: q.questionId,
      title: q.title,
      titleSlug: q.titleSlug,
      difficulty: q.difficulty,
      topicTags: q.topicTags,
      acRate: q.acRate,
    }));
  } catch (error) {
    console.error('Error fetching problems:', error);
    return [];
  }
}

/**
 * Get the LeetCode problem link
 */
export function getProblemLink(titleSlug: string): string {
  return `https://leetcode.com/problems/${titleSlug}/`;
}

/**
 * Convert LeetCode difficulty to our standard format
 */
export function normalizeDifficulty(difficulty: string): 'easy' | 'medium' | 'hard' {
  const normalized = difficulty.toLowerCase();
  if (normalized === 'easy') return 'easy';
  if (normalized === 'medium') return 'medium';
  return 'hard';
}
