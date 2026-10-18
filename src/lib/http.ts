import { NextResponse } from "next/server";
import { AppError, ValidationError } from "@/core/domain/errors";
import { InMemoryRateLimiter } from "./rate-limit";

export function jsonOk(data: Record<string, unknown> = {}, status = 200): NextResponse {
  return NextResponse.json({ ok: true, ...data }, { status });
}

/** Maps any thrown value to a safe JSON response. Server-side details are logged, never returned. */
export function jsonError(error: unknown): NextResponse {
  if (error instanceof AppError && error.status < 500) {
    const fields = error instanceof ValidationError ? error.details : undefined;
    return NextResponse.json(
      { ok: false, error: { code: error.code, message: error.message, fields } },
      { status: error.status },
    );
  }

  console.error("[api]", error);
  return NextResponse.json(
    { ok: false, error: { code: "INTERNAL_ERROR", message: "We could not complete that right now. Please try again shortly." } },
    { status: 500 },
  );
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body as Record<string, unknown>;
  } catch {
    // fall through
  }
  throw new ValidationError("The request body must be valid JSON.");
}

interface PostHandlerOptions {
  limit: number;
  windowMs: number;
  run: (body: Record<string, unknown>) => Promise<void>;
  successStatus?: number;
}

/** Builds a rate-limited, honeypot-protected POST handler for visitor submissions. */
export function createPostHandler({ limit, windowMs, run, successStatus = 201 }: PostHandlerOptions) {
  const limiter = new InMemoryRateLimiter(limit, windowMs);

  return async function POST(request: Request): Promise<NextResponse> {
    try {
      limiter.consume(clientIp(request));
      const body = await readJson(request);

      // Honeypot: real visitors never fill the hidden "website" field. Pretend success to bots.
      if (typeof body.website === "string" && body.website.trim() !== "") return jsonOk({}, successStatus);

      await run(body);
      return jsonOk({}, successStatus);
    } catch (error) {
      return jsonError(error);
    }
  };
}
