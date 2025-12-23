import * as XLSX from 'xlsx';
import * as path from 'path';

export interface TestCase {
    testCaseId: string;
    id: string;
    action: string;
    selector: string;
    data: string;
}

export class DataParser {
    static loadTestCases(filePath: string): Record<string, TestCase[]> {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json<TestCase>(sheet);

        // Group by TestCaseID
        const grouped: Record<string, TestCase[]> = {};
        for (const row of rawData) {
            const id = row.testCaseId || 'DEFAULT';
            if (!grouped[id]) grouped[id] = [];
            grouped[id].push(row);
        }
        return grouped;
    }
}
