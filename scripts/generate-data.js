const XLSX = require('xlsx');
const path = require('path');

const data = [
    { id: '1', action: 'navigate', selector: '', data: 'https://testplacementwebv1.azurewebsites.net/' },
    { id: '2', action: 'waitFor', selector: 'body', data: '' },
    // { id: '3', action: 'type', selector: '#username', data: 'testuser' },
    // { id: '4', action: 'click', selector: '#submit', data: '' }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Test Cases");

const filePath = path.join(__dirname, '../data-vault/data/test-suite.xlsx');
XLSX.writeFile(wb, filePath);
console.log(`Sample data written to ${filePath}`);
