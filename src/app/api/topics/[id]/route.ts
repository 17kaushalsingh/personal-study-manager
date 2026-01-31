import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/topics/[id] - Update topic status for a user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
      return errorResponse('Invalid status. Must be TODO, IN_PROGRESS, or DONE', 400);
    }

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: { subject: true },
    });

    if (!topic) {
      return notFoundResponse('Topic');
    }

    // Update or create user subject progress
    const userSubject = await prisma.userSubject.upsert({
      where: {
        userId_subjectId: {
          userId: session.user.id,
          subjectId: topic.subjectId,
        },
      },
      create: {
        userId: session.user.id,
        subjectId: topic.subjectId,
        status: 'IN_PROGRESS',
        progress: 0,
      },
      update: {},
    });

    // Calculate new progress based on completed topics
    const allTopics = await prisma.topic.findMany({
      where: { subjectId: topic.subjectId },
    });

    // For simplicity, we'll track topic completion in the user's preferences
    // In a production app, you'd have a separate UserTopic table
    const completedCount = status === 'DONE' ? 1 : 0;
    const totalTopics = allTopics.length;
    const newProgress = Math.round((completedCount / totalTopics) * 100);

    await prisma.userSubject.update({
      where: { id: userSubject.id },
      data: {
        progress: Math.min(100, userSubject.progress + (status === 'DONE' ? Math.round(100 / totalTopics) : 0)),
        status: newProgress === 100 ? 'DONE' : 'IN_PROGRESS',
      },
    });

    return successResponse({
      topicId: id,
      status,
      message: 'Topic status updated'
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    return serverErrorResponse('Failed to update topic');
  }
}
