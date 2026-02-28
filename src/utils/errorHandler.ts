/**
 * Centralized error handling utilities
 */

import { logger } from './logger';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown, context?: string): string => {
  const contextPrefix = context ? `[${context}] ` : '';

  if (error instanceof AppError) {
    logger.error(`${contextPrefix}${error.message}`, { code: error.code });
    return error.message;
  }

  if (error instanceof Error) {
    logger.error(`${contextPrefix}${error.message}`, error);
    return error.message;
  }

  const message = 'An unexpected error occurred';
  logger.error(`${contextPrefix}${message}`, error);
  return message;
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout')
    );
  }
  return false;
};
