export class Logger {
  constructor(private context: string) {}

  info(message: string, ...args: any[]) {
    console.log(`[${this.context}] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[${this.context}] ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(`[${this.context}] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${this.context}] ${message}`, ...args);
    }
  }
}
