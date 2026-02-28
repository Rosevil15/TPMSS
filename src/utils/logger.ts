/**
 * Centralized logging utility
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };
  }

  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      const entry = this.formatMessage('debug', message, data);
      console.debug(`[${entry.timestamp}] DEBUG:`, entry.message, data || '');
    }
  }

  info(message: string, data?: unknown): void {
    const entry = this.formatMessage('info', message, data);
    console.info(`[${entry.timestamp}] INFO:`, entry.message, data || '');
  }

  warn(message: string, data?: unknown): void {
    const entry = this.formatMessage('warn', message, data);
    console.warn(`[${entry.timestamp}] WARN:`, entry.message, data || '');
  }

  error(message: string, error?: unknown): void {
    const entry = this.formatMessage('error', message, error);
    console.error(`[${entry.timestamp}] ERROR:`, entry.message, error || '');
  }
}

export const logger = new Logger();
