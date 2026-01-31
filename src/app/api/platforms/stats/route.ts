import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { getUserStats as getLeetCodeStats } from '@/lib/leetcode';
import { getUserInfo as getCodeforcesInfo } from '@/lib/codeforces';
import { UserPreferences } from '@/types';

// GET /api/platforms/stats - Get platform statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const preferences = (user?.preferences as unknown as UserPreferences) || {};

    const stats: Record<string, unknown> = {};

    // Fetch LeetCode stats
    if (!platform || platform === 'leetcode') {
      if (preferences.leetcodeUsername) {
        const leetcodeStats = await getLeetCodeStats(preferences.leetcodeUsername);
        if (leetcodeStats) {
          stats.leetcode = leetcodeStats;
        } else {
          stats.leetcode = { error: 'Could not fetch LeetCode stats' };
        }
      } else if (platform === 'leetcode') {
        return errorResponse('LeetCode username not configured', 400);
      }
    }

    // Fetch Codeforces stats
    if (!platform || platform === 'codeforces') {
      if (preferences.codeforcesHandle) {
        const codeforcesStats = await getCodeforcesInfo(preferences.codeforcesHandle);
        if (codeforcesStats) {
          stats.codeforces = codeforcesStats;
        } else {
          stats.codeforces = { error: 'Could not fetch Codeforces stats' };
        }
      } else if (platform === 'codeforces') {
        return errorResponse('Codeforces handle not configured', 400);
      }
    }

    return successResponse(stats);
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return serverErrorResponse('Failed to fetch platform stats');
  }
}

// POST /api/platforms/stats - Verify platform credentials
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { platform, username } = body;

    if (!platform || !username) {
      return errorResponse('Platform and username are required', 400);
    }

    let isValid = false;
    let stats = null;

    if (platform === 'leetcode') {
      stats = await getLeetCodeStats(username);
      isValid = stats !== null;
    } else if (platform === 'codeforces') {
      stats = await getCodeforcesInfo(username);
      isValid = stats !== null;
    } else {
      return errorResponse('Invalid platform. Must be leetcode or codeforces', 400);
    }

    if (!isValid) {
      return errorResponse(`Could not find user "${username}" on ${platform}`, 404);
    }

    return successResponse({
      valid: true,
      platform,
      username,
      stats,
    });
  } catch (error) {
    console.error('Error verifying platform credentials:', error);
    return serverErrorResponse('Failed to verify platform credentials');
  }
}
