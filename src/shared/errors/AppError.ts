export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function badRequest(message: string): AppError {
  return new AppError(message, 400);
}

export function unauthorized(message = "Unauthorized"): AppError {
  return new AppError(message, 401);
}

export function forbidden(message = "Forbidden"): AppError {
  return new AppError(message, 403);
}

export function notFound(message = "Resource not found"): AppError {
  return new AppError(message, 404);
}

export function conflict(message: string): AppError {
  return new AppError(message, 409);
}

export function internalError(message = "Internal server error"): AppError {
  return new AppError(message, 500, false);
}
