import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/tasks/[id] - Update task status
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['PENDING', 'COMPLETED', 'SKIPPED'].includes(status)) {
      return errorResponse('Invalid status. Must be PENDING, COMPLETED, or SKIPPED', 400);
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return notFoundResponse('Task');
    }

    if (task.userId !== session.user.id) {
      return forbiddenResponse('You can only update your own tasks');
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    // Update activity log
    if (status === 'COMPLETED') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.activityLog.upsert({
        where: {
          userId_date: {
            userId: session.user.id,
            date: today,
          },
        },
        create: {
          userId: session.user.id,
          date: today,
          tasksCompleted: 1,
          problemsSolved: task.type === 'PROBLEM' ? 1 : 0,
          learningMinutes: task.type === 'LEARNING' ? 30 : 0,
          streak: 1,
        },
        update: {
          tasksCompleted: { increment: 1 },
          problemsSolved: task.type === 'PROBLEM' ? { increment: 1 } : undefined,
          learningMinutes: task.type === 'LEARNING' ? { increment: 30 } : undefined,
        },
      });
    }

    return successResponse(updatedTask, 'Task updated successfully');
  } catch (error) {
    console.error('Error updating task:', error);
    return serverErrorResponse('Failed to update task');
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return notFoundResponse('Task');
    }

    if (task.userId !== session.user.id) {
      return forbiddenResponse('You can only delete your own tasks');
    }

    await prisma.task.delete({
      where: { id },
    });

    return successResponse({ id }, 'Task deleted successfully');
  } catch (error) {
    console.error('Error deleting task:', error);
    return serverErrorResponse('Failed to delete task');
  }
}
