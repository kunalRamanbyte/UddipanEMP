import { UniversalDriver, Platform } from '@automation/shared-lib';
import { Page, Browser, chromium } from 'playwright';

export class PlaywrightDriver extends UniversalDriver {
    private page: Page | null = null;
    private browser: Browser | null = null;

    constructor() {
        super({ platform: 'web' });
    }

    async init() {
        const isHeadless = process.env.HEADLESS !== 'false';
        this.browser = await chromium.launch({ headless: isHeadless });
        const context = await this.browser.newContext();
        this.page = await context.newPage();
    }

    async click(selector: string): Promise<void> {
        if (!this.page) throw new Error("Driver not initialized");
        await this.page.click(selector);
    }

    async type(selector: string, text: string): Promise<void> {
        if (!this.page) throw new Error("Driver not initialized");
        await this.page.fill(selector, text);
    }

    async waitFor(selector: string): Promise<void> {
        if (!this.page) throw new Error("Driver not initialized");
        await this.page.waitForSelector(selector);
    }

    async navigate(url: string): Promise<void> {
        if (!this.page) throw new Error("Driver not initialized");
        await this.page.goto(url);
    }

    async getText(selector: string): Promise<string> {
        if (!this.page) throw new Error("Driver not initialized");
        return (await this.page.textContent(selector)) || '';
    }

    async takeScreenshot(): Promise<string | null> {
        if (!this.page) return null;
        const buffer = await this.page.screenshot({ type: 'png' });
        return buffer.toString('base64');
    }

    async close() {
        if (this.browser) await this.browser.close();
    }
}
