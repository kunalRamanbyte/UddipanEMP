import { UniversalDriver } from './UniversalDriver';
import { Healer } from './Healer';
import { PlatformConfig } from './PlatformConfig';
import { HtmlReporter, TestResult } from './HtmlReporter';
import { Logger } from './Logger';
import { ActionRegistry } from './ActionRegistry';
import { SchemaValidator } from './SchemaValidator';
import { LocatorResolver } from './LocatorResolver';
import { QualityGate } from './QualityGate';
import { ConfigProvider } from './ConfigProvider';

// Define the interface for a Test Case (matching DataParser)
export interface TestCase {
    testCaseId: string;
    testCaseName?: string;
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
    private validator: SchemaValidator;
    private sessionContext: Record<string, string> = {};

    constructor(driverClass: new () => UniversalDriver, locatorRepo: Record<string, string> = {}) {
        this.driverClass = driverClass;
        this.healer = new Healer();
        this.reporter = new HtmlReporter();
        this.locatorRepo = locatorRepo;
        this.registry = ActionRegistry.getInstance();
        this.validator = new SchemaValidator();
    }

    public async runSuite(testCases: Record<string, TestCase[]>): Promise<boolean> {
        const logger = new Logger();
        const platform = process.env.PLATFORM || 'web';
        logger.suiteWarn(`Starting Suite execution on ${platform} (Parallel: true)`);

        const suiteStartTime = new Date();

        // 1. Pre-Run Validation
        logger.suiteWarn(`🔍 Running Pre-run Validation...`);
        const validation = SchemaValidator.validate(testCases);
        if (validation.length > 0) {
            logger.error(`❌ Validation Failed: \n${validation.map((e: any) => `   - [${e.testCaseId}][${e.stepId}] ${e.issue}`).join('\n')}`);
            return false;
        }
        logger.suiteWarn(`✅ Validation Passed. Proceeding to execution...`);

        const caseIds = Object.keys(testCases);

        // Execute sequentially
        for (const caseId of caseIds) {
            const steps = testCases[caseId];
            const driver = new this.driverClass();
            await driver.init();
            await this.runTestCase(caseId, steps, platform, driver);
            await driver.close();
        }

        const suiteEndTime = new Date();
        const reportPath = this.reporter.generateReport('./report.html', suiteStartTime, suiteEndTime);
        logger.suiteWarn(`All tests completed. Report generated at: ${reportPath}`);

        // 2. CI Quality Gate Enforcement
        const gate = new QualityGate();
        const config = ConfigProvider.getInstance().getConfig();
        const gateResult = gate.analyze(this.reporter['results'], config.quality_gate || {
            maxHealingRate: 0.1,
            maxRetryRate: 0.2,
            failOnHealing: true,
            failOnRetries: false
        });

        if (!gateResult.success) {
            logger.error(gateResult.message);
        }

        return gateResult.success;
    }

    private async runTestCase(caseId: string, steps: TestCase[], platform: string, driver: UniversalDriver) {
        const logger = new Logger();
        logger.info(`=== Starting Test Case: ${caseId} ===`);
        this.sessionContext = {}; // Reset context for each test case run

        try {
            for (const step of steps) {
                const status = await this.runStep(caseId, step, platform, driver, logger);
                if (status === 'FAIL') {
                    logger.error(`Stopping test case ${caseId} due to critical step failure.`);
                    break;
                }
            }
        } catch (error) {
            logger.error(`Test Case ${caseId} failed unexpectedly`, error);
        }
    }

    private async runStep(caseId: string, step: TestCase, platform: string, driver: UniversalDriver, logger: Logger): Promise<'PASS' | 'FAIL' | 'HEALED'> {
        const startTime = Date.now();
        logger.info(`Executing ${caseId} | Step ${step.id}: ${step.action}`);

        const result: TestResult = {
            testCaseId: caseId,
            testCaseName: step.testCaseName,
            stepId: step.id,
            action: step.action,
            selector: step.selector,
            status: 'PASS',
            timestamp: new Date(),
            duration: 0,
            logs: [],
            retryCount: 0
        };

        const config = ConfigProvider.getInstance().getConfig();
        const isStrict = config.strictMode || process.env.STRICT_MODE === 'true';
        const healingEnabled = config.enableHealing !== false && process.env.ENABLE_HEALING !== 'false';

        let attempt = 0;
        const maxAttempts = isStrict ? 1 : 2; // 1 in strict mode, 2 otherwise

        try {
            while (attempt < maxAttempts) {
                try {
                    if (attempt > 0) logger.warn(`Retrying step (Attempt ${attempt + 1})...`);
                    await this.executeStep(step, driver, logger);
                    result.status = 'PASS';
                    result.retryCount = attempt;
                    break;
                } catch (error: any) {
                    attempt++;
                    if (attempt >= maxAttempts) {
                        logger.error(`Step execution failed after ${maxAttempts} attempts`, error);
                        result.retryCount = attempt - 1;

                        // Healing logic
                        if (healingEnabled && !isStrict) {
                            try {
                                logger.info(`Attempting AI Self-Healing...`);
                                const screenshot = await driver.takeScreenshot() || "base64_placeholder";
                                const healing = await this.healer.healLocator(screenshot, step.selector, platform as any);

                                result.confidence = healing.confidence;
                                result.healingReason = healing.reason;

                                if (healing.confidence >= 0.8) {
                                    logger.info(`Healer found fix with high confidence (${Math.round(healing.confidence * 100)}%): ${healing.newSelector}`);
                                    step.selector = healing.newSelector;
                                    await this.executeStep(step, driver, logger);
                                    result.status = 'HEALED';
                                    result.isHealed = true;
                                    result.selector = `${step.selector} (Healed)`;
                                } else {
                                    logger.warn(`Healer found fix but confidence was too low. Failing for safety.`);
                                    throw new Error(`Healing failed: Confidence too low. AI Logic: ${healing.reason}`);
                                }
                            } catch (healError: any) {
                                result.status = 'FAIL';
                                result.errorMessage = healError.message || String(error);
                                logger.error(`Healer could not resolve the issue safely.`);
                            }
                        } else {
                            // No healing allowed - Mark as FAIL
                            result.status = 'FAIL';
                            result.errorMessage = String(error);
                            if (isStrict) logger.error(`Strict Mode: Healing skipped.`);
                        }
                    } else {
                        await new Promise(r => setTimeout(r, 1000));
                    }
                }
            }
        } finally {
            result.duration = Date.now() - startTime;
            result.logs = logger.getLogs();

            if (result.status !== 'PASS') {
                try {
                    const screenshot = await driver.takeScreenshot();
                    if (screenshot) result.screenshot = screenshot;
                } catch (err) {
                    logger.error('Failed to capture screenshot', err);
                }
            }
            this.reporter.logResult(result);
            return result.status;
        }
    }

    private async executeStep(test: TestCase, driver: UniversalDriver, logger: Logger) {
        // Resolve dynamic data and selectors from repo
        const rawRepoSelector = this.locatorRepo[test.selector] || test.selector;
        const rawActualData = this.locatorRepo[test.data || ''] || test.data;

        // Resolve dynamic placeholders in both selector and data
        const repoSelector = this.resolveDynamicData(rawRepoSelector);
        const resolvedData = this.resolveDynamicData(rawActualData);

        // Apply Priority Strategy Policy
        const actualSelector = LocatorResolver.resolve(repoSelector);

        if (this.locatorRepo[test.selector]) {
            logger.info(`Resolved named locator: ${test.selector} -> ${repoSelector}`);
        }

        if (actualSelector !== repoSelector) {
            logger.info(`Policy Applied: '${repoSelector}' -> '${actualSelector}'`);
        }
        if (test.data && this.locatorRepo[test.data]) {
            logger.info(`Resolved named data: ${test.data} -> ${resolvedData}`);
        }

        const handler = this.registry.getAction(test.action);
        if (handler) {
            if (resolvedData !== rawActualData) {
                logger.info(`Dynamic Resolution: '${rawActualData}' -> '${resolvedData}'`);
            }
            await handler(driver, logger, resolvedData, actualSelector);
        } else {
            throw new Error(`Unknown action found during execution: ${test.action}`);
        }
    }

    private resolveDynamicData(data: string | undefined): string {
        if (!data) return '';
        let resolved = data;

        // Built-in: {{TIMESTAMP}} - generated once per test case run
        if (resolved.includes('{{TIMESTAMP}}')) {
            if (!this.sessionContext['TIMESTAMP']) {
                this.sessionContext['TIMESTAMP'] = Date.now().toString();
            }
            resolved = resolved.replace(/{{TIMESTAMP}}/g, this.sessionContext['TIMESTAMP']);
        }

        // Built-in: {{CURRENT_DAY}}
        if (resolved.includes('{{CURRENT_DAY}}')) {
            resolved = resolved.replace(/{{CURRENT_DAY}}/g, new Date().getDate().toString());
        }

        return resolved;
    }
}
