import { ActionRegistry } from './ActionRegistry';

export interface ValidationIssues {
    testCaseId: string;
    stepId: string;
    issue: string;
}

export class SchemaValidator {
    public static validate(testSuite: Record<string, any[]>): ValidationIssues[] {
        const issues: ValidationIssues[] = [];
        const registry = ActionRegistry.getInstance();
        const supportedActions = registry.getSupportedActions();

        for (const [caseId, steps] of Object.entries(testSuite)) {
            steps.forEach((step, index) => {
                const stepId = step.id || `Step-${index + 1}`;

                // 1. Check Action exists
                if (!step.action) {
                    issues.push({ testCaseId: caseId, stepId, issue: "Missing action field" });
                    return;
                }

                if (!supportedActions.includes(step.action.toLowerCase())) {
                    issues.push({
                        testCaseId: caseId,
                        stepId,
                        issue: `Unknown action: '${step.action}'. Supported: [${supportedActions.join(', ')}]`
                    });
                }

                // 2. Structural Requirements based on Action
                const action = step.action.toLowerCase();
                if ((action === 'click' || action === 'type' || action === 'waitfor') && !step.selector) {
                    issues.push({ testCaseId: caseId, stepId, issue: `Action '${action}' requires a selector` });
                }

                if ((action === 'type' || action === 'navigate') && !step.data) {
                    issues.push({ testCaseId: caseId, stepId, issue: `Action '${action}' requires data (URL or Text)` });
                }
            });
        }

        return issues;
    }
}
