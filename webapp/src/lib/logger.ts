/**
 * Log levels supported by the structured logger.
 */
export type LogLevel = "info" | "warn" | "error" | "debug";

/**
 * Structured log entry payload.
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Formats and outputs structured JSON logs.
 *
 * @param level - Log severity level
 * @param message - Human-readable description
 * @param context - Additional contextual metadata
 */
function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };
  const serialized = JSON.stringify(entry);
  if (level === "error") {
    process.stderr.write(`${serialized}\n`);
  } else {
    process.stdout.write(`${serialized}\n`);
  }
}

/**
 * Structured application logger.
 */
export const logger = {
  /**
   * Logs an informational message.
   *
   * @param message - Informational message
   * @param context - Additional metadata
   */
  info: (message: string, context?: Record<string, unknown>): void => {
    log("info", message, context);
  },

  /**
   * Logs a warning message.
   *
   * @param message - Warning message
   * @param context - Additional metadata
   */
  warn: (message: string, context?: Record<string, unknown>): void => {
    log("warn", message, context);
  },

  /**
   * Logs an error message.
   *
   * @param message - Error message
   * @param context - Additional metadata
   */
  error: (message: string, context?: Record<string, unknown>): void => {
    log("error", message, context);
  },

  /**
   * Logs a debug message.
   *
   * @param message - Debug message
   * @param context - Additional metadata
   */
  debug: (message: string, context?: Record<string, unknown>): void => {
    log("debug", message, context);
  },
};

