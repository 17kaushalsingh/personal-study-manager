import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/tasks - Get today's tasks for the authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        date: today,
      },
      orderBy: [
        { status: 'asc' },
        { type: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'COMPLETED').length,
      pending: tasks.filter((t) => t.status === 'PENDING').length,
      skipped: tasks.filter((t) => t.status === 'SKIPPED').length,
    };

    return successResponse({
      date: today.toISOString().split('T')[0],
      tasks,
      stats: taskStats,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return serverErrorResponse('Failed to fetch tasks');
  }
}
