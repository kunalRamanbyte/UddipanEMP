const XLSX = require('xlsx');
const path = require('path');

const data = [
    { testCaseId: 'TC006', testCaseName: 'Tester A: Footer Branding Check', id: '1', action: 'navigate', selector: '', data: 'https://testplacementwebv1.azurewebsites.net/' },
    { testCaseId: 'TC006', testCaseName: 'Tester A: Footer Branding Check', id: '2', action: 'waitFor', selector: 'text=Privacy Policy', data: '' },
    { testCaseId: 'TC006', testCaseName: 'Tester A: Footer Branding Check', id: '3', action: 'waitFor', selector: 'text=Terms & Conditions', data: '' }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

const filePath = path.join(__dirname, '../data-vault/data/web/tester-features.xlsx');
XLSX.writeFile(wb, filePath);
console.log(`Independent test file created: ${filePath}`);
