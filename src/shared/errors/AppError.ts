export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly title: string | undefined;

  constructor(message: string, title?: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = "AppError";
    this.title = title;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function badRequest(message = "Requisição inválida", title?: string): AppError {
  return new AppError(message, title, 400);
}

export function unauthorized(message = "Não autorizado", title?: string): AppError {
  return new AppError(message, title, 401);
}

export function forbidden(message = "Não autorizado", title?: string): AppError {
  return new AppError(message, title, 403);
}

export function notFound(message = "Não encontrado", title?: string): AppError {
  return new AppError(message, title, 404);
}

export function conflict(message: string, title?: string): AppError {
  return new AppError(message, title, 409);
}

export function internalError(
  message = "Erro interno do servidor",
  title = "Aguarde alguns instantes e tente novamente."
): AppError {
  return new AppError(message, title, 500, false);
}
