import { TestResult } from './HtmlReporter';
import { Logger } from './Logger';

export interface QualityGateConfig {
    maxHealingRate: number;    // e.g. 0.10 (10%)
    maxRetryRate: number;      // e.g. 0.20 (20%)
    failOnHealing: boolean;    // Should it fail the build?
    failOnRetries: boolean;    // Should it fail the build?
}

export class QualityGate {
    private logger = Logger.getInstance();

    public analyze(results: TestResult[], config: QualityGateConfig): { success: boolean; message: string } {
        const totalSteps = results.length;
        if (totalSteps === 0) return { success: true, message: 'No steps executed.' };

        const healedSteps = results.filter(r => r.status === 'HEALED').length;
        const retrySteps = results.filter(r => (r.retryCount || 0) > 0).length;

        const healingRate = healedSteps / totalSteps;
        const retryRate = retrySteps / totalSteps;

        let success = true;
        let messages: string[] = [];

        // 1. Check Healing Gate
        if (healingRate > config.maxHealingRate) {
            const msg = `❌ QUALITY GATE FAILED: AI Healing Rate is ${Math.round(healingRate * 100)}% (Threshold: ${config.maxHealingRate * 100}%). Technical Debt Alert!`;
            if (config.failOnHealing) {
                success = false;
                messages.push(msg);
            } else {
                this.logger.warn(msg);
            }
        }

        // 2. Check Retry Gate
        if (retryRate > config.maxRetryRate) {
            const msg = `⚠️ QUALITY GATE WARNING: Retry Rate is ${Math.round(retryRate * 100)}% (Threshold: ${config.maxRetryRate * 100}%). Suite Stability is low.`;
            if (config.failOnRetries) {
                success = false;
                messages.push(msg);
            } else {
                this.logger.warn(msg);
            }
        }

        if (success) {
            this.logger.info(`✅ Quality Gates Passed. (Healing: ${Math.round(healingRate * 100)}%, Retries: ${Math.round(retryRate * 100)}%)`);
            return { success: true, message: 'All quality gates passed.' };
        } else {
            return { success: false, message: messages.join('\n') };
        }
    }
}
