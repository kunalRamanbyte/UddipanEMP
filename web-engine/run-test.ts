import { PlaywrightDriver } from './PlaywrightDriver';
import { TestRunner } from '@automation/shared-lib';
import { DataParser } from '@automation/data-vault';
import * as path from 'path';

async function main() {
    // 1. Initialize Driver
    const driver = new PlaywrightDriver();
    await driver.init();

    // 2. Load Data
    const dataPath = path.resolve(__dirname, '../data-vault/data/test-suite.xlsx');
    console.log(`Loading data from: ${dataPath}`);
    // Note: DataParser needs to be compiled or run via ts-node to work if imported from source
    // Assuming simple structure for now or that we are running ts-node
    const testCases = DataParser.loadTestCases(dataPath);

    // 3. Run Tests
    const runner = new TestRunner(driver);
    await runner.runTests(testCases);

    // 4. Cleanup
    // await driver.close(); // Keep open to see the result
}

main().catch(console.error);
