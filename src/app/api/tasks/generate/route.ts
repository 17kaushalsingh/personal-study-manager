import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { generateDailyTasks } from '@/lib/taskGenerator';
import { UserPreferences } from '@/types';

const DEFAULT_PREFERENCES: UserPreferences = {
  dailyProblems: 2,
  dailyLearningMinutes: 60,
  difficultyPreference: 'balanced',
  focusAreas: [],
  theme: 'system',
  includeDailyChallenge: true,
};

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

    const preferences: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      ...(user?.preferences as unknown as Partial<UserPreferences>),
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
        generated: false,
      });
    }

    // Generate tasks using the smart task generator
    const generatedTasks = await generateDailyTasks({
      userId: session.user.id,
      preferences,
      date: today,
    });

    if (generatedTasks.length === 0) {
      return successResponse({
        message: 'No tasks to generate',
        tasks: [],
        generated: false,
      });
    }

    // Create all tasks in database
    const createdTasks = await prisma.task.createManyAndReturn({
      data: generatedTasks,
    });

    // Update activity log
    await prisma.activityLog.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        date: today,
        tasksCompleted: 0,
        problemsSolved: 0,
        learningMinutes: 0,
        streak: 0,
      },
    });

    return successResponse({
      message: `Generated ${createdTasks.length} tasks for today`,
      tasks: createdTasks,
      generated: true,
      breakdown: {
        problems: createdTasks.filter((t) => t.type === 'PROBLEM').length,
        learning: createdTasks.filter((t) => t.type === 'LEARNING').length,
        review: createdTasks.filter((t) => t.type === 'REVIEW').length,
      },
    });
  } catch (error) {
    console.error('Error generating tasks:', error);
    return serverErrorResponse('Failed to generate tasks');
  }
}
