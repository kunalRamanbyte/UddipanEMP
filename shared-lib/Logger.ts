export class Logger {
    private logs: string[] = [];

    info(message: string) {
        const formatted = `[INFO] ${new Date().toLocaleTimeString()}: ${message}`;
        console.log(formatted);
        this.logs.push(formatted);
    }

    error(message: string, error?: any) {
        const formatted = `[ERROR] ${new Date().toLocaleTimeString()}: ${message}${error ? ` - ${error.message || error}` : ''}`;
        console.error(formatted);
        this.logs.push(formatted);
    }

    getLogs(): string[] {
        return [...this.logs];
    }

    warn(message: string) {
        const formatted = `[WARN] ${new Date().toLocaleTimeString()}: ${message}`;
        console.warn(formatted);
        this.logs.push(formatted);
    }

    clear() {
        this.logs = [];
    }

    // Static helper for global/suite-level logging
    static suiteInfo(message: string) {
        console.log(`[SUITE-INFO] ${new Date().toLocaleTimeString()}: ${message}`);
    }

    static suiteWarn(message: string) {
        console.warn(`[SUITE-WARN] ${new Date().toLocaleTimeString()}: ${message}`);
    }

    static suiteError(message: string, error?: any) {
        console.error(`[SUITE-ERROR] ${new Date().toLocaleTimeString()}: ${message}${error ? ` - ${error.message || error}` : ''}`);
    }
}
