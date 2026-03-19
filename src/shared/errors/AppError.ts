export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly title: string | undefined;
  public readonly code: string | undefined;

  constructor(
    message: string,
    title?: string,
    statusCode = 500,
    code?: string,
    isOperational = true
  ) {
    super(message);
    this.name = "AppError";
    this.title = title;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function badRequest(
  message = "Requisição inválida",
  title?: string,
  code?: string
): AppError {
  return new AppError(message, title, 400, code);
}

export function unauthorized(message = "Não autorizado", title?: string, code?: string): AppError {
  return new AppError(message, title, 401, code);
}

export function forbidden(message = "Não autorizado", title?: string, code?: string): AppError {
  return new AppError(message, title, 403, code);
}

export function notFound(message = "Não encontrado", title?: string, code?: string): AppError {
  return new AppError(message, title, 404, code);
}

export function conflict(message: string, title?: string, code?: string): AppError {
  return new AppError(message, title, 409, code);
}

export function internalError(
  message = "Erro interno do servidor",
  title = "Aguarde alguns instantes e tente novamente."
): AppError {
  return new AppError(message, title, 500, undefined, false);
}
