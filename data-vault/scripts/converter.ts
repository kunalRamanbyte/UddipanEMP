import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = 'data-vault/data/web';
const EXPORT_DIR = 'data-vault/data/web/json';

if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

function convertExcelToJson(filePath: string) {
    console.log(`Converting ${filePath}...`);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data: any[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Group by testCaseId
    const testCases = new Map<string, any>();

    data.forEach(row => {
        const { testCaseId, testCaseName, ...step } = row;
        if (!testCaseId) return;

        if (!testCases.has(testCaseId)) {
            testCases.set(testCaseId, {
                testCaseId,
                testCaseName,
                steps: []
            });
        }
        testCases.get(testCaseId).steps.push(step);
    });

    testCases.forEach((tc, id) => {
        const fileName = `${id.toLowerCase()}.json`;
        const outputPath = path.join(EXPORT_DIR, fileName);
        fs.writeFileSync(outputPath, JSON.stringify(tc, null, 2));
        console.log(`  -> Created ${fileName}`);
    });
}

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.xlsx'));
files.forEach(file => {
    convertExcelToJson(path.join(DATA_DIR, file));
});

console.log('Conversion complete!');
