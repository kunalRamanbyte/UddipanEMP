import * as XLSX from 'xlsx';
import * as path from 'path';

export interface TestCase {
    id: string;
    action: string;
    selector: string;
    data: string;
}

export class DataParser {
    static loadTestCases(filePath: string): TestCase[] {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json<TestCase>(sheet);
    }
}
