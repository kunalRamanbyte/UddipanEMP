import { PlaywrightDriver } from './PlaywrightDriver';
import { TestRunner } from '../shared-lib/TestRunner';
import { DataParser } from '../data-vault/DataParser';
import { WebLocators } from './WebPage';
import * as path from 'path';

async function main() {
    // 2. Load Data (Discovery Mode)
    const dataPath = path.resolve(__dirname, '../data-vault/data');
    console.log(`Searching for test data in: ${dataPath}`);
    const testCases = await DataParser.loadTestCases(dataPath);

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
    const success = await runner.runSuite(suiteToRun);

    if (!success) {
        process.exit(1);
    }
}

main().catch(console.error);
