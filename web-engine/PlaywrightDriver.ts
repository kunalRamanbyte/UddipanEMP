import { UniversalDriver, Platform } from '../shared-lib/UniversalDriver';
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
        try {
            // First attempt: Standard click with 10s timeout
            await this.page.click(selector, { timeout: 10000 });
        } catch (error) {
            // Fallback: Direct JS click for hidden/obscured elements
            await this.page.$eval(selector, (el: any) => el.click()).catch(() => {
                // If even JS click fails, throw the original error
                throw error;
            });
        }
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

    async select(selector: string, value: string) {
        if (!this.page) throw new Error("Driver not initialized");
        // Try selecting by value first, then label
        await this.page.selectOption(selector, value).catch(() =>
            this.page!.selectOption(selector, { label: value })
        );
    }

    async close() {
        if (this.browser) await this.browser.close();
    }

    async press(key: string) {
        if (!this.page) throw new Error("Driver not initialized");
        await this.page.keyboard.press(key);
    }

    async evaluate(js: string) {
        if (!this.page) throw new Error("Driver not initialized");
        return await this.page.evaluate(js);
    }
}
