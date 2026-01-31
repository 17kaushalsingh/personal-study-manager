import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

export function errorResponse(error: string, status: number = 400): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function notFoundResponse(resource: string = 'Resource'): NextResponse<ApiResponse<never>> {
  return errorResponse(`${resource} not found`, 404);
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse<never>> {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse<never>> {
  return errorResponse(message, 403);
}

export function serverErrorResponse(message: string = 'Internal server error'): NextResponse<ApiResponse<never>> {
  return errorResponse(message, 500);
}

export function validationErrorResponse(errors: Record<string, string>): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      errors,
    },
    { status: 400 }
  );
}
