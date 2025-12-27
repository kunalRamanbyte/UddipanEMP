import { Logger } from './Logger';
import { UniversalDriver } from './UniversalDriver';
import { LocatorResolver } from './LocatorResolver';

export type ActionHandler = (driver: UniversalDriver, logger: Logger, data?: string, selector?: string) => Promise<void>;

export class ActionRegistry {
    private static instance: ActionRegistry;
    private registry: Map<string, ActionHandler> = new Map();

    private constructor() {
        this.registerDefaultActions();
    }

    public static getInstance(): ActionRegistry {
        if (!ActionRegistry.instance) {
            ActionRegistry.instance = new ActionRegistry();
        }
        return ActionRegistry.instance;
    }

    public registerAction(name: string, handler: ActionHandler) {
        this.registry.set(name.toLowerCase(), handler);
    }

    public getAction(name: string): ActionHandler | undefined {
        return this.registry.get(name.toLowerCase());
    }

    public getSupportedActions(): string[] {
        return Array.from(this.registry.keys());
    }

    private registerDefaultActions() {
        this.registerAction('navigate', async (driver, logger, data) => {
            if (!data) throw new Error("URL required for navigate action");
            await driver.navigate(data);
        });

        this.registerAction('click', async (driver, logger, _, selector) => {
            if (!selector) throw new Error("Selector required for click action");
            await driver.click(selector);
        });

        this.registerAction('type', async (driver, logger, data, selector) => {
            if (!selector) throw new Error("Selector required for type action");
            if (!data) throw new Error("Data required for type action");
            await driver.type(selector, data);
        });

        this.registerAction('press', async (driver, logger, data) => {
            if (!data) throw new Error("Key required for press action");
            await (driver as any).press(data);
        });

        this.registerAction('js_eval', async (driver, logger, data) => {
            if (!data) throw new Error("JS source required for js_eval action");
            await (driver as any).evaluate(data);
        });

        this.registerAction('select', async (driver, logger, data, selector) => {
            if (!data) throw new Error("Value required for select action");
            if (!selector) throw new Error("Selector required for select action");
            await driver.select(selector, data);
        });

        this.registerAction('waitfor', async (driver, logger, data, selector) => {
            if (!selector) throw new Error("Selector required for waitFor action");
            if (data) {
                // If data is provided, we assume we want to wait for that text within the selector
                // Or if selector is 'body', just wait for text on page
                const finalSelector = data.startsWith('text=') ? data : `text=${data}`;
                await driver.waitFor(finalSelector);
            } else {
                await driver.waitFor(selector);
            }
        });

        this.registerAction('verify_text', async (driver, logger, data, selector) => {
            if (!data) throw new Error("Data required for verify_text action");
            const targetSelector = selector || 'body';
            const text = await driver.getText(targetSelector);
            if (!text.includes(data)) {
                throw new Error(`Text verification failed. Expected to find "${data}" in "${targetSelector}", but found "${text}"`);
            }
            logger.info(`Verified text "${data}" present in ${targetSelector}`);
        });

        this.registerAction('gettext', async (driver, logger, _, selector) => {
            if (!selector) throw new Error("Selector required for getText action");
            const text = await driver.getText(selector);
            logger.info(`Extracted text: ${text}`);
        });

        // --- COMPOSITE ACTIONS ---
        this.registerAction('login_to_employer_portal', async (driver, logger) => {
            logger.info("🚀 Executing Composite Action: Login to Employer Portal");

            const navigate = (url: string) => driver.navigate(url);
            const click = (sel: string) => driver.click(LocatorResolver.resolve(sel));
            const wait = (sel: string) => driver.waitFor(LocatorResolver.resolve(sel));
            const type = (sel: string, val: string) => driver.type(LocatorResolver.resolve(sel), val);

            await navigate('https://testplacementwebv1.azurewebsites.net/');
            await click("a[href*='logType=EMP']");
            await wait("button:has-text('Employer Login')");
            await click("button:has-text('Employer Login')");
            await click("button:has-text('Sign in with email')");
            await type("input[name='email']", "oracle.tech@yopmail.com");
            await click("button:has-text('Next')");
            await type("input[name='password']", "Pibm@123");
            await click("button:has-text('Sign In')");
            await wait("text=Dashboard");

            logger.info("✅ Composite Action: Login Success!");
        });
    }
}
