import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/subjects/[id]/topics - Get topics for a subject
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        topics: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!subject) {
      return notFoundResponse('Subject');
    }

    return successResponse({
      subject: {
        id: subject.id,
        name: subject.name,
        description: subject.description,
        icon: subject.icon,
      },
      topics: subject.topics,
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return serverErrorResponse('Failed to fetch topics');
  }
}
