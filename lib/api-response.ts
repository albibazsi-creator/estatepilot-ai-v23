import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export type ApiSuccess<T> = { ok: true; data: T; meta?: Record<string, unknown> };
export type ApiFailure = { ok: false; error: string; details?: unknown };

export function ok<T>(data: T, init?: ResponseInit & { meta?: Record<string, unknown> }) {
  const { meta, ...responseInit } = init ?? {};
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data, ...(meta ? { meta } : {}) }, responseInit);
}

export function fail(error: string, status = 400, details?: unknown) {
  return NextResponse.json<ApiFailure>({ ok: false, error, ...(details ? { details } : {}) }, { status });
}

export async function parseJson<T>(req: Request, schema: ZodSchema<T>) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return { data: null, error: fail("Érvénytelen kérés", 422, parsed.error.flatten()) } as const;
    }
    return { data: parsed.data, error: null } as const;
  } catch {
    return { data: null, error: fail("A kérés body-ja nem érvényes JSON", 400) } as const;
  }
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) return fail("Érvénytelen adat", 422, error.flatten());
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("forbidden")) return fail(error.message, 403);
    if (error.message.toLowerCase().includes("not found")) return fail(error.message, 404);
    return fail(error.message, 500);
  }
  return fail("Ismeretlen szerverhiba", 500);
}

export async function guarded<T>(handler: () => Promise<T>) {
  try {
    const result = await handler();
    if (result instanceof Response) return result;
    return ok(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
