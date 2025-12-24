import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

export interface TestCase {
    testCaseId: string;
    testCaseName?: string;
    id: string;
    action: string;
    selector: string;
    data: string;
}

export class DataParser {
    static loadTestCases(targetPath: string): Record<string, TestCase[]> {
        const grouped: Record<string, TestCase[]> = {};

        const processPath = (currentPath: string) => {
            const stats = fs.statSync(currentPath);

            if (stats.isDirectory()) {
                const files = fs.readdirSync(currentPath);
                for (const file of files) {
                    processPath(path.join(currentPath, file));
                }
            } else if (currentPath.endsWith('.xlsx')) {
                const fileData = this.loadFile(currentPath);
                for (const [caseId, steps] of Object.entries(fileData)) {
                    if (!grouped[caseId]) {
                        grouped[caseId] = steps;
                    } else {
                        grouped[caseId].push(...steps);
                    }
                }
            }
        };

        processPath(targetPath);
        return grouped;
    }

    private static loadFile(filePath: string): Record<string, TestCase[]> {
        const workbook = XLSX.readFile(filePath);
        const grouped: Record<string, TestCase[]> = {};

        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json<TestCase>(sheet);

            for (const row of rawData) {
                const id = row.testCaseId || 'DEFAULT';
                if (!grouped[id]) grouped[id] = [];
                grouped[id].push(row);
            }
        }
        return grouped;
    }
}
