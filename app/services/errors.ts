import { data } from "react-router";

// Typed domain errors (SPEC §13). Services throw these to signal intent; route
// loaders/actions convert them into route error Responses with `toErrorResponse`
// so status + payload survive serialization to the error boundary. React Router
// strips custom fields (and, in production, messages) from thrown Error
// instances, so anything the UI must see has to travel as a Response.

export type ErrorKind =
  | "NotFound"
  | "Unauthorized"
  | "Forbidden"
  | "ValidationError"
  | "RenderError"
  | "Internal";

const STATUS: Record<ErrorKind, number> = {
  NotFound: 404,
  Unauthorized: 401,
  Forbidden: 403,
  ValidationError: 400,
  RenderError: 500,
  Internal: 500,
};

export interface ErrorPayload {
  kind: ErrorKind;
  message: string;
  details?: unknown;
}

export class AppError extends Error {
  readonly kind: ErrorKind;
  readonly status: number;
  readonly details?: unknown;

  constructor(kind: ErrorKind, message: string, details?: unknown) {
    super(message);
    this.name = `${kind}Error`;
    this.kind = kind;
    this.status = STATUS[kind];
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", details?: unknown) {
    super("NotFound", message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "You must be signed in to do that", details?: unknown) {
    super("Unauthorized", message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message = "You do not have access to this resource",
    details?: unknown,
  ) {
    super("Forbidden", message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input", details?: unknown) {
    super("ValidationError", message, details);
  }
}

export class RenderError extends AppError {
  constructor(message = "Failed to render widget", details?: unknown) {
    super("RenderError", message, details);
  }
}

/** Normalize any thrown value into a route error Response. */
export function toErrorResponse(error: unknown) {
  if (error instanceof Response) return error;

  if (error instanceof AppError) {
    return data<ErrorPayload>(
      { kind: error.kind, message: error.message, details: error.details },
      { status: error.status },
    );
  }

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";
  return data<ErrorPayload>({ kind: "Internal", message }, { status: 500 });
}

export const notFound = (message?: string, details?: unknown) =>
  toErrorResponse(new NotFoundError(message, details));
export const unauthorized = (message?: string, details?: unknown) =>
  toErrorResponse(new UnauthorizedError(message, details));
export const forbidden = (message?: string, details?: unknown) =>
  toErrorResponse(new ForbiddenError(message, details));
export const badRequest = (message?: string, details?: unknown) =>
  toErrorResponse(new ValidationError(message, details));
