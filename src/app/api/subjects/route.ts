import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/subjects - List all subjects with user progress
export async function GET() {
  try {
    const session = await auth();

    const subjects = await prisma.subject.findMany({
      orderBy: { order: 'asc' },
      include: {
        topics: {
          orderBy: { order: 'asc' },
        },
        ...(session?.user?.id && {
          userSubjects: {
            where: { userId: session.user.id },
          },
        }),
      },
    });

    // Calculate progress for each subject
    const subjectsWithProgress = subjects.map((subject) => {
      const userSubject = subject.userSubjects?.[0];
      return {
        id: subject.id,
        name: subject.name,
        description: subject.description,
        icon: subject.icon,
        order: subject.order,
        topicCount: subject.topics.length,
        progress: userSubject?.progress || 0,
        status: userSubject?.status || 'TODO',
      };
    });

    return successResponse(subjectsWithProgress);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return serverErrorResponse('Failed to fetch subjects');
  }
}

// POST /api/subjects - Create a new custom subject (authenticated)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { name, description, icon } = body;

    if (!name) {
      return errorResponse('Subject name is required', 400);
    }

    // Check if subject already exists
    const existing = await prisma.subject.findUnique({
      where: { name },
    });

    if (existing) {
      return errorResponse('Subject with this name already exists', 409);
    }

    // Get max order
    const maxOrder = await prisma.subject.aggregate({
      _max: { order: true },
    });

    const subject = await prisma.subject.create({
      data: {
        name,
        description: description || '',
        icon: icon || '📚',
        order: (maxOrder._max.order || 0) + 1,
        isDefault: false,
      },
    });

    return successResponse(subject, 'Subject created successfully');
  } catch (error) {
    console.error('Error creating subject:', error);
    return serverErrorResponse('Failed to create subject');
  }
}
