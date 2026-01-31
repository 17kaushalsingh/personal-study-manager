import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { UserPreferences } from '@/types';

// GET /api/user/preferences - Get user preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        preferences: true,
      },
    });

    const defaultPreferences: UserPreferences = {
      dailyProblems: 2,
      dailyLearningMinutes: 60,
      difficultyPreference: 'balanced',
      focusAreas: [],
      theme: 'system',
      includeDailyChallenge: true,
    };

    return successResponse({
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        image: user?.image,
      },
      preferences: {
        ...defaultPreferences,
        ...(user?.preferences as unknown as UserPreferences || {}),
      },
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return serverErrorResponse('Failed to fetch preferences');
  }
}

// PUT /api/user/preferences - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate preferences
    const {
      leetcodeUsername,
      codeforcesHandle,
      dailyProblems,
      dailyLearningMinutes,
      difficultyPreference,
      focusAreas,
      theme,
      includeDailyChallenge,
    } = body;

    // Validate numeric values
    if (dailyProblems !== undefined && (dailyProblems < 1 || dailyProblems > 10)) {
      return errorResponse('dailyProblems must be between 1 and 10', 400);
    }

    if (dailyLearningMinutes !== undefined && (dailyLearningMinutes < 15 || dailyLearningMinutes > 480)) {
      return errorResponse('dailyLearningMinutes must be between 15 and 480', 400);
    }

    if (difficultyPreference !== undefined &&
        !['easy', 'medium', 'hard', 'balanced'].includes(difficultyPreference)) {
      return errorResponse('Invalid difficultyPreference', 400);
    }

    if (theme !== undefined && !['light', 'dark', 'system'].includes(theme)) {
      return errorResponse('Invalid theme', 400);
    }

    // Get current preferences
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const currentPreferences = (user?.preferences as unknown as UserPreferences) || {};

    // Merge with new preferences
    const updatedPreferences: UserPreferences = {
      ...currentPreferences,
      ...(leetcodeUsername !== undefined && { leetcodeUsername }),
      ...(codeforcesHandle !== undefined && { codeforcesHandle }),
      ...(dailyProblems !== undefined && { dailyProblems }),
      ...(dailyLearningMinutes !== undefined && { dailyLearningMinutes }),
      ...(difficultyPreference !== undefined && { difficultyPreference }),
      ...(focusAreas !== undefined && { focusAreas }),
      ...(theme !== undefined && { theme }),
      ...(includeDailyChallenge !== undefined && { includeDailyChallenge }),
    };

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { preferences: updatedPreferences as object },
    });

    return successResponse(updatedPreferences, 'Preferences updated successfully');
  } catch (error) {
    console.error('Error updating preferences:', error);
    return serverErrorResponse('Failed to update preferences');
  }
}
