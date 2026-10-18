/** Typed application errors. Each carries the HTTP status it should map to. */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
    public readonly code: string = "INTERNAL_ERROR",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Please check the highlighted fields.", fieldErrors?: Record<string, string[]>) {
    super(message, 400, "VALIDATION_ERROR", fieldErrors);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "We could not find that record.") {
    super(message, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "You need to sign in.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have access to this area.") {
    super(message, 403, "FORBIDDEN");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again in a minute.") {
    super(message, 429, "RATE_LIMITED");
  }
}

export class RepositoryError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, "REPOSITORY_ERROR", details);
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, 500, "CONFIGURATION_ERROR");
  }
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
