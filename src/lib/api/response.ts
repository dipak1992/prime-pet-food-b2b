import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as ApiResponse<T>,
    { status }
  );
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiResponse,
    { status }
  );
}

export function notFoundResponse(resource = "Resource") {
  return errorResponse(`${resource} not found`, 404);
}

export function unauthorizedResponse() {
  return errorResponse("Unauthorized", 401);
}

export function forbiddenResponse() {
  return errorResponse("Forbidden", 403);
}

export function validationErrorResponse(errors: Record<string, string>) {
  return NextResponse.json(
    {
      success: false,
      error: "Validation failed",
      data: errors,
    },
    { status: 400 }
  );
}
