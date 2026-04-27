import { ERROR_CODES } from '@/lib/constants/errorCodes';

type ApiError = {
  status: number;
  message?: string;
};

const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' && error !== null && 'status' in error;

export class BusinessErrorHandler {
  handle(error: unknown): string {
    if (isApiError(error)) {
      if (error.status === 401) return ERROR_CODES.UNAUTHORIZED;
      if (error.status === 403) return ERROR_CODES.FORBIDDEN;
      if (error.status === 404) return ERROR_CODES.NOT_FOUND;
      return error.message ?? ERROR_CODES.INTERNAL_SERVER_ERROR;
    }
    if (error instanceof Error) return error.message;
    return ERROR_CODES.UNKNOWN_ERROR;
  }
}

export const createErrorHandler = () => new BusinessErrorHandler();
