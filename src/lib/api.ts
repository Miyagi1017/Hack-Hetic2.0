import type { Response } from "express";
import { ZodError } from "zod";

export function apiSuccess<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function apiError(res: Response, message: string, status = 400, details?: unknown) {
  return res.status(status).json({ success: false, error: message, details });
}

export function handleApiError(res: Response, error: unknown) {
  if (error instanceof ZodError) return apiError(res, "Validation error", 422, error.issues);
  if (error instanceof Error) {
    if (error.message === "Unauthorized") return apiError(res, "Unauthorized", 401);
    if (error.message === "Not found") return apiError(res, "Not found", 404);
    if (error.message === "Forbidden") return apiError(res, "Forbidden", 403);
    console.error("[API Error]", error);
    return apiError(res, error.message, 500);
  }
  return apiError(res, "Internal server error", 500);
}

export function paginate(query: Record<string, string | undefined>) {
  const page = Math.max(1, parseInt(query.page ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "20")));
  return { skip: (page - 1) * limit, take: limit };
}
