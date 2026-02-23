import { Response } from 'express';

/**
 * Standard API Response Types
 */
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Error codes enum
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
}

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  res.status(statusCode).json(response);
};

/**
 * Send paginated success response
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): void => {
  const totalPages = Math.ceil(total / limit);
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    ...(message && { message }),
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
  res.status(200).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  code: ErrorCode,
  message: string,
  statusCode: number = 400,
  details?: Record<string, unknown>
): void => {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
  res.status(statusCode).json(response);
};

/**
 * Common error responses
 */
export const errorResponses = {
  notFound: (res: Response, resource: string) =>
    sendError(res, ErrorCode.NOT_FOUND, `${resource} not found`, 404),

  unauthorized: (res: Response, message: string = 'Unauthorized access') =>
    sendError(res, ErrorCode.UNAUTHORIZED, message, 401),

  forbidden: (res: Response, message: string = 'Access denied') =>
    sendError(res, ErrorCode.FORBIDDEN, message, 403),

  validationError: (res: Response, details: Record<string, unknown>) =>
    sendError(res, ErrorCode.VALIDATION_ERROR, 'Validation failed', 400, details),

  conflict: (res: Response, message: string) =>
    sendError(res, ErrorCode.CONFLICT, message, 409),

  badRequest: (res: Response, message: string) =>
    sendError(res, ErrorCode.BAD_REQUEST, message, 400),

  internalError: (res: Response, message: string = 'Internal server error') =>
    sendError(res, ErrorCode.INTERNAL_ERROR, message, 500),
};
