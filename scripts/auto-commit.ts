import { execSync } from 'child_process';

const run = (cmd: string) => {
    try {
        execSync(cmd, { stdio: 'inherit' });
    } catch (e) {
        console.error(`Failed to run: ${cmd}`);
        process.exit(1);
    }
};

const commitMsg = process.argv[2] || "Auto-commit: updates";

console.log("Adding files...");
run('git add .');

console.log(`Committing with message: "${commitMsg}"...`);
run(`git commit -m "${commitMsg}"`);

console.log("Pushing...");
run('git push');
