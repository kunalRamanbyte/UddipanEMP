import { PlaywrightDriver } from './PlaywrightDriver';
import { TestRunner } from '@automation/shared-lib';
import { DataParser } from '@automation/data-vault';
import { WebLocators } from './WebPage';
import * as path from 'path';

async function main() {
    // 2. Load Data
    const dataPath = path.resolve(__dirname, '../data-vault/data/test-suite.xlsx');
    console.log(`Loading data from: ${dataPath}`);
    const testCases = DataParser.loadTestCases(dataPath);

    // Filter if arg provided
    const args = process.argv.slice(2);
    let suiteToRun = testCases;

    if (args.includes('--test')) {
        const idx = args.indexOf('--test');
        if (idx !== -1 && args[idx + 1]) {
            const filterId = args[idx + 1];
            console.log(`Filtering for Test Case: ${filterId}`);
            if (testCases[filterId]) {
                suiteToRun = { [filterId]: testCases[filterId] };
            } else {
                console.warn(`Test Case ${filterId} not found!`);
                suiteToRun = {};
            }
        }
    }

    // 3. Run Tests
    const runner = new TestRunner(PlaywrightDriver, WebLocators);
    await runner.runSuite(suiteToRun);
}

main().catch(console.error);
