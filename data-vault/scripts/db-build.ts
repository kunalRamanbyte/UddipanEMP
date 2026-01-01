import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const JSON_DIR = 'data-vault/data/web/json';
const DB_PATH = 'data-vault/data/web/master.db';

// Delete existing DB if it exists
if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
}

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    // Create tables
    db.run(`CREATE TABLE test_cases (
        testCaseId TEXT PRIMARY KEY,
        testCaseName TEXT
    )`);

    db.run(`CREATE TABLE steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        testCaseId TEXT,
        stepId TEXT,
        action TEXT,
        selector TEXT,
        data TEXT,
        FOREIGN KEY(testCaseId) REFERENCES test_cases(testCaseId)
    )`);

    const jsonFiles = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json'));

    const insertTC = db.prepare(`INSERT INTO test_cases (testCaseId, testCaseName) VALUES (?, ?)`);
    const insertStep = db.prepare(`INSERT INTO steps (testCaseId, stepId, action, selector, data) VALUES (?, ?, ?, ?, ?)`);

    jsonFiles.forEach(file => {
        const filePath = path.join(JSON_DIR, file);
        const tc = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        insertTC.run(tc.testCaseId, tc.testCaseName);

        tc.steps.forEach((step: any) => {
            insertStep.run(tc.testCaseId, step.id, step.action, step.selector || '', step.data || '');
        });

        console.log(`  -> Indexed ${tc.testCaseId}`);
    });

    insertTC.finalize();
    insertStep.finalize();
});

db.close(() => {
    console.log(`Database build complete: ${DB_PATH}`);
});
