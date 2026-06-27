import { NextResponse } from "next/server";
export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: string; code?: string };
export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> { return NextResponse.json({ success: true, data }, { status }); }
export function created<T>(data: T): NextResponse<ApiSuccess<T>> { return ok(data, 201); }
export function fail(error: string, status = 400, code?: string): NextResponse<ApiError> { return NextResponse.json({ success: false, error, code }, { status }); }
export function unauthorized(message = "Not authenticated"): NextResponse<ApiError> { return fail(message, 401, "UNAUTHORIZED"); }
export function forbidden(message = "Not authorized"): NextResponse<ApiError> { return fail(message, 403, "FORBIDDEN"); }
export function notFound(message = "Not found"): NextResponse<ApiError> { return fail(message, 404, "NOT_FOUND"); }
export function serverError(message = "Internal server error"): NextResponse<ApiError> { return fail(message, 500, "SERVER_ERROR"); }
