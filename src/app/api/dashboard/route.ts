import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { generateHeatmapData, calculateStreak } from '@/lib/utils';
import { getUserStats as getLeetCodeStats } from '@/lib/leetcode';
import { getUserInfo as getCodeforcesInfo } from '@/lib/codeforces';
import { UserPreferences } from '@/types';

// GET /api/dashboard - Get dashboard data
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's tasks
    const todaysTasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        date: today,
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // Get activity logs for the last 12 weeks
    const twelveWeeksAgo = new Date(today);
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const activityLogs = await prisma.activityLog.findMany({
      where: {
        userId: session.user.id,
        date: { gte: twelveWeeksAgo },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate streak
    const currentStreak = calculateStreak(
      activityLogs.map((log) => ({
        date: log.date,
        tasksCompleted: log.tasksCompleted,
      }))
    );

    // Get longest streak
    const longestStreak = activityLogs.reduce((max, log) => Math.max(max, log.streak), 0);

    // Total problems solved
    const totalProblemsSolved = activityLogs.reduce((sum, log) => sum + log.problemsSolved, 0);

    // Generate heatmap data
    const heatmapData = generateHeatmapData(
      activityLogs.map((log) => ({
        date: log.date,
        tasksCompleted: log.tasksCompleted,
      })),
      12
    );

    // Weekly progress
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyLogs = activityLogs.filter(
      (log) => new Date(log.date) >= oneWeekAgo
    );

    const weeklyProgress = {
      problems: weeklyLogs.reduce((sum, log) => sum + log.problemsSolved, 0),
      learning: weeklyLogs.reduce((sum, log) => sum + log.learningMinutes, 0),
      target: 14, // Default weekly target
    };

    // Get platform stats (if configured)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const preferences = (user?.preferences as unknown as UserPreferences) || {};

    let platformStats = {};

    if (preferences.leetcodeUsername) {
      const leetcodeStats = await getLeetCodeStats(preferences.leetcodeUsername);
      if (leetcodeStats) {
        platformStats = { ...platformStats, leetcode: leetcodeStats };
      }
    }

    if (preferences.codeforcesHandle) {
      const codeforcesStats = await getCodeforcesInfo(preferences.codeforcesHandle);
      if (codeforcesStats) {
        platformStats = { ...platformStats, codeforces: codeforcesStats };
      }
    }

    // Get subject progress
    const subjects = await prisma.subject.findMany({
      orderBy: { order: 'asc' },
      take: 5,
      include: {
        userSubjects: {
          where: { userId: session.user.id },
        },
        _count: { select: { topics: true } },
      },
    });

    const subjectProgress = subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      icon: subject.icon,
      progress: subject.userSubjects[0]?.progress || 0,
      topicCount: subject._count.topics,
    }));

    return successResponse({
      todaysTasks,
      currentStreak,
      longestStreak,
      totalProblemsSolved,
      weeklyProgress,
      heatmapData,
      platformStats,
      subjectProgress,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return serverErrorResponse('Failed to fetch dashboard data');
  }
}
