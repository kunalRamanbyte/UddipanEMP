import * as fs from 'fs';
import * as path from 'path';

export interface AppConfig {
    baseUrl: string;
    envName: string;
    capabilities?: Record<string, any>;
    credentials?: Record<string, string>;
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
