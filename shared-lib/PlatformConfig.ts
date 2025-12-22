import { Platform } from './UniversalDriver';

export class PlatformConfig {
    private static instance: PlatformConfig;
    public currentPlatform: Platform = 'web'; // Default to web

    private constructor() { }

    static getInstance(): PlatformConfig {
        if (!PlatformConfig.instance) {
            PlatformConfig.instance = new PlatformConfig();
        }
        return PlatformConfig.instance;
    }

    setPlatform(platform: Platform) {
        this.currentPlatform = platform;
    }
}
