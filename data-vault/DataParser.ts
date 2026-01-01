import * as sqlite3 from 'sqlite3';
import * as path from 'path';

export interface TestCase {
    testCaseId: string;
    testCaseName?: string;
    id: string;
    action: string;
    selector: string;
    data: string;
}

export class DataParser {
    static async loadTestCases(targetPath: string): Promise<Record<string, TestCase[]>> {
        // Use the master.db which is expected to be in a specific location
        // or derived from targetPath. For this framework, we use master.db
        const dbPath = path.join(targetPath, 'web/master.db');
        const grouped: Record<string, TestCase[]> = {};

        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
                if (err) return reject(err);
            });

            const query = `
                SELECT tc.testCaseId, tc.testCaseName, s.stepId as id, s.action, s.selector, s.data
                FROM test_cases tc
                JOIN steps s ON tc.testCaseId = s.testCaseId
                ORDER BY tc.testCaseId, s.id
            `;

            db.all(query, [], (err, rows: any[]) => {
                if (err) {
                    db.close();
                    return reject(err);
                }

                rows.forEach(row => {
                    if (!grouped[row.testCaseId]) {
                        grouped[row.testCaseId] = [];
                    }
                    grouped[row.testCaseId].push(row);
                });

                db.close();
                resolve(grouped);
            });
        });
    }
}
