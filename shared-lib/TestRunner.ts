import { UniversalDriver } from './UniversalDriver';
import { Healer } from './Healer';
import { PlatformConfig } from './PlatformConfig';
import { HtmlReporter, TestResult } from './HtmlReporter';
import { Logger } from './Logger';
import { ActionRegistry } from './ActionRegistry';
import { SchemaValidator } from './SchemaValidator';

// Define the interface for a Test Case (matching DataParser)
export interface TestCase {
    testCaseId: string;
    id: string;
    action: string;
    selector: string;
    data?: string;
}

export class TestRunner {
    private driverClass: new () => UniversalDriver;
    private healer: Healer;
    private reporter: HtmlReporter;
    private locatorRepo: Record<string, string>;
    private registry: ActionRegistry;

    constructor(driverClass: new () => UniversalDriver, locatorRepo: Record<string, string> = {}) {
        this.driverClass = driverClass;
        this.healer = new Healer();
        this.reporter = new HtmlReporter();
        this.locatorRepo = locatorRepo;
        this.registry = ActionRegistry.getInstance();
    }

    async runSuite(testSuite: Record<string, TestCase[]>, parallel: boolean = true) {
        const platform = PlatformConfig.getInstance().currentPlatform;
        Logger.suiteInfo(`Starting Suite execution on ${platform} (Parallel: ${parallel})`);

        // 1. DSL Validation Layer
        Logger.suiteInfo("🔍 Running Pre-run Validation...");
        const validatonIssues = SchemaValidator.validate(testSuite);
        if (validatonIssues.length > 0) {
            Logger.suiteError("❌ Validation Failed! Fix the following issues in your test data:");
            validatonIssues.forEach(i => console.error(`   - [${i.testCaseId}][${i.stepId}] ${i.issue}`));
            throw new Error(`Execution aborted: ${validatonIssues.length} validation errors found.`);
        }
        Logger.suiteInfo("✅ Validation Passed. Proceeding to execution...");

        if (parallel) {
            const tasks = Object.entries(testSuite).map(([caseId, steps]) =>
                this.runTestCase(caseId, steps, platform)
            );
            await Promise.all(tasks);
        } else {
            for (const [caseId, steps] of Object.entries(testSuite)) {
                await this.runTestCase(caseId, steps, platform);
            }
        }

        const reportPath = this.reporter.generateReport('./report.html');
        Logger.suiteInfo(`All tests completed. Report generated at: ${reportPath}`);
    }

    private async runTestCase(caseId: string, steps: TestCase[], platform: string) {
        const logger = new Logger();
        logger.info(`=== Starting Test Case: ${caseId} ===`);

        const driver = new this.driverClass();
        await driver.init();

        try {
            for (const step of steps) {
                await this.runStep(caseId, step, platform, driver, logger);
            }
        } catch (error) {
            logger.error(`Test Case ${caseId} failed unexpectedly`, error);
        } finally {
            await driver.close();
        }
    }

    private async runStep(caseId: string, step: TestCase, platform: string, driver: UniversalDriver, logger: Logger) {
        const startTime = Date.now();
        logger.info(`Executing ${caseId} | Step ${step.id}: ${step.action}`);

        const result: TestResult = {
            testCaseId: caseId,
            stepId: step.id,
            action: step.action,
            selector: step.selector,
            status: 'PASS',
            timestamp: new Date(),
            duration: 0,
            logs: []
        };

        try {
            await this.executeStep(step, driver, logger);
        } catch (error: any) {
            logger.error(`Step execution failed`, error);

            // Healing logic
            try {
                const screenshot = await driver.takeScreenshot() || "base64_placeholder";
                const healing = await this.healer.healLocator(screenshot, step.selector, platform as any);

                result.confidence = healing.confidence;
                result.healingReason = healing.reason;

                if (healing.confidence >= 0.8) {
                    logger.info(`Healer found fix with high confidence (${Math.round(healing.confidence * 100)}%): ${healing.newSelector}`);
                    step.selector = healing.newSelector;
                    await this.executeStep(step, driver, logger);
                    result.status = 'HEALED';
                    result.selector = `${step.selector} (Healed)`;
                } else {
                    logger.warn(`Healer found fix but confidence was too low (${Math.round(healing.confidence * 100)}%). Failing for safety.`);
                    throw new Error(`Healing failed: Confidence too low (${healing.confidence}). AI Logic: ${healing.reason}`);
                }
            } catch (healError: any) {
                result.status = 'FAIL';
                result.errorMessage = healError.message || String(error);
                logger.error(`Healer could not resolve the issue safely.`);
            }
        } finally {
            result.duration = Date.now() - startTime;
            result.logs = logger.getLogs();

            // Capture screenshot on failure or healing
            if (result.status !== 'PASS') {
                try {
                    const screenshot = await driver.takeScreenshot();
                    if (screenshot) result.screenshot = screenshot;
                } catch (err) {
                    logger.error('Failed to capture screenshot', err);
                }
            }

            this.reporter.logResult(result);
        }
    }

    private async executeStep(test: TestCase, driver: UniversalDriver, logger: Logger) {
        // Resolve dynamic data and selectors from repo
        const actualSelector = this.locatorRepo[test.selector] || test.selector;
        const actualData = this.locatorRepo[test.data || ''] || test.data;

        if (this.locatorRepo[test.selector]) {
            logger.info(`Resolved named locator: ${test.selector} -> ${actualSelector}`);
        }
        if (test.data && this.locatorRepo[test.data]) {
            logger.info(`Resolved named data: ${test.data} -> ${actualData}`);
        }

        const handler = this.registry.getAction(test.action);
        if (handler) {
            await handler(driver, logger, actualData, actualSelector);
        } else {
            throw new Error(`Unknown action found during execution: ${test.action}`);
        }
    }
}
