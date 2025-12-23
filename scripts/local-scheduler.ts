/**
 * Local Test Scheduler (Zero-dependency)
 * 
 * Usage: npx ts-node scripts/local-scheduler.ts <interval_in_minutes>
 * Example: npx ts-node scripts/local-scheduler.ts 1440 (for daily)
 */

import { execSync } from 'child_process';

const intervalMinutes = parseInt(process.argv[2]) || 60; // Default to 1 hour
const intervalMs = intervalMinutes * 60 * 1000;

console.log(`[Scheduler] Starting local test scheduler...`);
console.log(`[Scheduler] Interval: ${intervalMinutes} minutes`);
console.log(`[Scheduler] Press Ctrl+C to stop.`);

function runTests() {
    const timestamp = new Date().toLocaleString();
    console.log(`\n[${timestamp}] [Scheduler] Triggering test run...`);
    try {
        // Build shared-lib first to ensure latest changes
        execSync('npm run build -w shared-lib', { stdio: 'inherit' });
        // Run tests
        execSync('npx ts-node web-engine/run-test.ts', { stdio: 'inherit' });
        console.log(`[Scheduler] Test run completed successfully.`);
    } catch (error) {
        console.error(`[Scheduler] Test run failed.`);
    }
    console.log(`[Scheduler] Next run in ${intervalMinutes} minutes...`);
}

// Run immediately on start
runTests();

// Schedule subsequent runs
setInterval(runTests, intervalMs);
