// Centralized logging utility
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'websocket' | 'notification' | 'chat' | 'auth' | 'api' | 'ui';

interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableTimestamp: boolean;
}

class Logger {
  private config: LogConfig = {
    level: 'info',
    enableConsole: true,
    enableTimestamp: true,
  };

  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    websocket: 1,
    notification: 1,
    chat: 1,
    auth: 1,
    api: 1,
    ui: 1
  };

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = this.config.enableTimestamp ? `[${this.getTimestamp()}]` : '';
    const levelTag = `[${level.toUpperCase()}]`;
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `${timestamp} ${levelTag} ${message}${dataStr}`;
  }

  setConfig(config: Partial<LogConfig>) {
    this.config = { ...this.config, ...config };
  }

  debug(message: string, data?: unknown) {
    if (this.shouldLog('debug') && this.config.enableConsole) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: unknown) {
    if (this.shouldLog('info') && this.config.enableConsole) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: unknown) {
    if (this.shouldLog('warn') && this.config.enableConsole) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  chat(message: string, data?: unknown) {
    if (this.shouldLog('info') && this.config.enableConsole) {
      console.log(this.formatMessage('chat', message, data));
    }
  }

  error(message: string, error?: unknown) {
    if (this.shouldLog('error') && this.config.enableConsole) {
      // Only log WebSocket connection errors in production or if explicitly enabled
      if (message.includes('WebSocket') && process.env.NODE_ENV === 'development') {
        // In development, log WebSocket errors as info to reduce noise
        console.log(this.formatMessage('websocket', message, error));
      } else {
        console.error(this.formatMessage('error', message, error));
      }
    }
  }

  // Specialized logging for common patterns
  websocket(message: string, data?: unknown) {
    // In development, reduce WebSocket logging noise
    if (process.env.NODE_ENV === 'development') {
      // Only log important WebSocket events in development
      if (message.includes('connected') || message.includes('error') || message.includes('closed')) {
        this.info(`🔌 ${message}`, data);
      }
    } else {
      this.info(`🔌 ${message}`, data);
    }
  }

  notification(message: string, data?: unknown) {
    this.info(`📨 ${message}`, data);
  }

  auth(message: string, data?: unknown) {
    this.info(`🔐 ${message}`, data);
  }

  api(message: string, data?: unknown) {
    this.info(`🌐 ${message}`, data);
  }

  ui(message: string, data?: unknown) {
    this.info(`🎨 ${message}`, data);
  }
}

// Create singleton instance
export const logger = new Logger();

// Environment-based configuration
if (process.env.NODE_ENV === 'production') {
  logger.setConfig({ level: 'warn', enableTimestamp: false });
} else {
  logger.setConfig({ level: 'info', enableTimestamp: true });
}

// Convenience functions for common use cases
export const logWebSocket = (message: string, data?: unknown): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔌 [WebSocket] ${message}`, data || '');
  }
};
export const logNotification = (message: string, data?: unknown) => logger.notification(message, data);
export const logChat = (message: string, data?: unknown) => logger.chat(message, data);
export const logAuth = (message: string, data?: unknown) => logger.auth(message, data);
export const logApi = (message: string, data?: unknown) => logger.api(message, data);
export const logUi = (message: string, data?: unknown) => logger.ui(message, data);
export const logError = (message: string, error?: unknown) => logger.error(message, error); 