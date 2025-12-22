import { UniversalDriver } from './UniversalDriver';
import { Healer } from './Healer';
import { PlatformConfig } from './PlatformConfig';

// Define the interface for a Test Case (matching DataParser)
export interface TestCase {
    id: string;
    action: string;
    selector: string;
    data?: string;
}

export class TestRunner {
    private driver: UniversalDriver;
    private healer: Healer;

    constructor(driver: UniversalDriver) {
        this.driver = driver;
        this.healer = new Healer();
    }

    async runTests(testCases: TestCase[]) {
        const platform = PlatformConfig.getInstance().currentPlatform;
        console.log(`[TestRunner] Starting execution on ${platform}...`);

        for (const test of testCases) {
            console.log(`[Step ${test.id}] ${test.action} on ${test.selector}`);

            try {
                await this.executeStep(test);
            } catch (error) {
                console.error(`[Step ${test.id}] Failed: ${error}`);
                console.log(`[Healer] Activating self-healing...`);

                // Mock screenshot capture
                const screenshot = "base64_placeholder";
                const newSelector = await this.healer.healLocator(screenshot, test.selector, platform);

                if (newSelector !== test.selector) {
                    console.log(`[Healer] Fixed selector! Retrying with: ${newSelector}`);
                    test.selector = newSelector;
                    await this.executeStep(test);
                } else {
                    console.error(`[Healer] Could not fix selector.`);
                    throw error;
                }
            }
        }
        console.log("[TestRunner] All tests completed.");
    }

    private async executeStep(test: TestCase) {
        switch (test.action.toLowerCase()) {
            case 'click':
                await this.driver.click(test.selector);
                break;
            case 'type':
                if (!test.data) throw new Error("Data required for type action");
                await this.driver.type(test.selector, test.data);
                break;
            case 'waitfor':
                await this.driver.waitFor(test.selector);
                break;
            case 'navigate':
                if (!test.data) throw new Error("URL required for navigate action");
                await this.driver.navigate(test.data);
                break;
            default:
                console.warn(`Unknown action: ${test.action}`);
        }
    }
}
