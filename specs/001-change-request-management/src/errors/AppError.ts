export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const ERRORS = {
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden - insufficient permissions',
  SELF_APPROVAL: 'Self-approval is not allowed',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',
  VALIDATION_ERROR: 'Validation failed',
  CONCURRENT_UPDATE: 'Concurrent update detected - please retry',
} as const;
