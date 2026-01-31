import { CodeforcesStats, CodeforcesProblem, CodeforcesUser } from '@/types';

const CODEFORCES_API_URL = 'https://codeforces.com/api';

interface CFApiResponse<T> {
  status: string;
  result: T;
  comment?: string;
}

/**
 * Fetch user info from Codeforces
 */
export async function getUserInfo(handle: string): Promise<CodeforcesStats | null> {
  try {
    const response = await fetch(`${CODEFORCES_API_URL}/user.info?handles=${handle}`);

    if (!response.ok) {
      return null;
    }

    const data: CFApiResponse<CodeforcesUser[]> = await response.json();

    if (data.status !== 'OK' || !data.result || data.result.length === 0) {
      return null;
    }

    const user = data.result[0];

    // Get submission count for problems solved
    const submissionsResponse = await fetch(
      `${CODEFORCES_API_URL}/user.status?handle=${handle}&from=1&count=10000`
    );

    let problemsSolved = 0;
    if (submissionsResponse.ok) {
      const submissionsData = await submissionsResponse.json();
      if (submissionsData.status === 'OK') {
        const solvedSet = new Set<string>();
        for (const submission of submissionsData.result || []) {
          if (submission.verdict === 'OK') {
            const problemKey = `${submission.problem.contestId}-${submission.problem.index}`;
            solvedSet.add(problemKey);
          }
        }
        problemsSolved = solvedSet.size;
      }
    }

    return {
      handle: user.handle,
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || 'newbie',
      maxRank: user.maxRank || 'newbie',
      problemsSolved,
    };
  } catch (error) {
    console.error('Error fetching Codeforces user info:', error);
    return null;
  }
}

/**
 * Fetch problems from Codeforces with optional filters
 */
export async function getProblems(
  rating?: number,
  tags?: string[],
  limit: number = 50
): Promise<CodeforcesProblem[]> {
  try {
    let url = `${CODEFORCES_API_URL}/problemset.problems`;
    const params: string[] = [];

    if (tags && tags.length > 0) {
      params.push(`tags=${tags.join(';')}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      return [];
    }

    const data: CFApiResponse<{ problems: CodeforcesProblem[] }> = await response.json();

    if (data.status !== 'OK' || !data.result?.problems) {
      return [];
    }

    let problems = data.result.problems;

    // Filter by rating if specified
    if (rating) {
      const ratingRange = 200; // +/- 200 from target rating
      problems = problems.filter(
        (p) => p.rating && p.rating >= rating - ratingRange && p.rating <= rating + ratingRange
      );
    }

    // Return limited results
    return problems.slice(0, limit).map((p) => ({
      contestId: p.contestId,
      index: p.index,
      name: p.name,
      rating: p.rating,
      tags: p.tags,
    }));
  } catch (error) {
    console.error('Error fetching Codeforces problems:', error);
    return [];
  }
}

/**
 * Fetch user submissions from Codeforces
 */
export async function getUserSubmissions(
  handle: string,
  count: number = 100
): Promise<{ problem: CodeforcesProblem; verdict: string }[]> {
  try {
    const response = await fetch(
      `${CODEFORCES_API_URL}/user.status?handle=${handle}&from=1&count=${count}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.result) {
      return [];
    }

    return data.result.map((submission: { problem: CodeforcesProblem; verdict: string }) => ({
      problem: {
        contestId: submission.problem.contestId,
        index: submission.problem.index,
        name: submission.problem.name,
        rating: submission.problem.rating,
        tags: submission.problem.tags,
      },
      verdict: submission.verdict,
    }));
  } catch (error) {
    console.error('Error fetching Codeforces submissions:', error);
    return [];
  }
}

/**
 * Get the Codeforces problem link
 */
export function getProblemLink(contestId: number, index: string): string {
  return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
}

/**
 * Convert Codeforces rating to difficulty level
 */
export function ratingToDifficulty(rating: number | undefined): 'easy' | 'medium' | 'hard' {
  if (!rating) return 'medium';
  if (rating <= 1200) return 'easy';
  if (rating <= 1800) return 'medium';
  return 'hard';
}

/**
 * Get rank color based on Codeforces rank
 */
export function getRankColor(rank: string): string {
  const rankColors: Record<string, string> = {
    newbie: '#808080',
    pupil: '#008000',
    specialist: '#03a89e',
    expert: '#0000ff',
    'candidate master': '#aa00aa',
    master: '#ff8c00',
    'international master': '#ff8c00',
    grandmaster: '#ff0000',
    'international grandmaster': '#ff0000',
    'legendary grandmaster': '#ff0000',
  };
  return rankColors[rank.toLowerCase()] || '#808080';
}
