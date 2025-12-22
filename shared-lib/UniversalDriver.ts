export type Platform = 'web' | 'android';

export interface DriverOptions {
    platform: Platform;
}

export abstract class UniversalDriver {
    protected platform: Platform;

    constructor(options: DriverOptions) {
        this.platform = options.platform;
    }

    abstract click(selector: string): Promise<void>;
    abstract type(selector: string, text: string): Promise<void>;
    abstract waitFor(selector: string): Promise<void>;
    abstract navigate(url: string): Promise<void>;
    abstract getText(selector: string): Promise<string>;
}
