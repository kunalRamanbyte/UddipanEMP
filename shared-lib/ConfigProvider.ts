import * as fs from 'fs';
import * as path from 'path';

import { QualityGateConfig } from './QualityGate';

export interface AppConfig {
    baseUrl: string;
    appUrl?: string;
    envName: string;
    timeout?: number;
    capabilities?: Record<string, any>;
    credentials?: Record<string, string>;
    quality_gate?: QualityGateConfig;
}

export class ConfigProvider {
    private static instance: ConfigProvider;
    private config: AppConfig;

    private constructor() {
        const env = process.env.APP_ENV || 'dev';
        const configPath = path.resolve(__dirname, `../../data-vault/config/${env}.json`);

        if (fs.existsSync(configPath)) {
            const fileContent = fs.readFileSync(configPath, 'utf-8');
            this.config = JSON.parse(fileContent);
        } else {
            console.warn(`Config file not found at ${configPath}, using defaults.`);
            this.config = {
                baseUrl: 'https://testplacementwebv1.azurewebsites.net/',
                envName: 'default'
            };
        }
    }

    public static getInstance(): ConfigProvider {
        if (!ConfigProvider.instance) {
            ConfigProvider.instance = new ConfigProvider();
        }
        return ConfigProvider.instance;
    }

    public getConfig(): AppConfig {
        return this.config;
    }
}
