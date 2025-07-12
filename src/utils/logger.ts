export class Logger {
  constructor(private context: string) {}

  info(message: string, ...args: unknown[]) {
    console.log(`[${this.context}] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    console.warn(`[${this.context}] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]) {
    console.error(`[${this.context}] ${message}`, ...args);
  }

  debug(message: string, ...args: unknown[]) {
    if (import.meta.env.DEV) {
      console.debug(`[${this.context}] ${message}`, ...args);
    }
  }
}
