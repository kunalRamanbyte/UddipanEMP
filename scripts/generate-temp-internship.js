const XLSX = require('xlsx');
const path = require('path');

const data = [
    // TC009: Verify Edit Internship Title
    { testCaseId: 'TC009', testCaseName: 'Verify Edit Internship Title', id: '1', action: 'login_to_employer_portal', selector: '', data: '' },
    { testCaseId: 'TC009', testCaseName: 'Verify Edit Internship Title', id: '2', action: 'click', selector: 'RECENT_INTERNSHIPS_LINK', data: '' },
    { testCaseId: 'TC009', testCaseName: 'Verify Edit Internship Title', id: '3', action: 'waitfor', selector: 'EDIT_JOB_BTN', data: '' },
    { testCaseId: 'TC009', testCaseName: 'Verify Edit Internship Title', id: '4', action: 'click', selector: 'EDIT_JOB_BTN', data: '' },
    { testCaseId: 'TC009', testCaseName: 'Verify Edit Internship Title', id: '5', action: 'waitfor', selector: 'INTERNSHIP_TITLE_INPUT', data: '' },
    { testCaseId: 'TC009', testCaseName: 'Verify Edit Internship Title', id: '6', action: 'type', selector: 'INTERNSHIP_TITLE_INPUT', data: 'demo internship {{TIMESTAMP}} edit' },
    { testCaseId: 'TC009', testCaseName: 'Verify Edit Internship Title', id: '7', action: 'click', selector: 'UPDATE_INTERNSHIP_BTN', data: '' },
    { testCaseId: 'TC009', testCaseName: 'Verify Edit Internship Title', id: '8', action: 'click', selector: 'ALERT_OK_BTN', data: '' },
    { testCaseId: 'TC009', testCaseName: 'Verify Edit Internship Title', id: '9', action: 'verify_text', selector: 'css:body', data: 'demo internship {{TIMESTAMP}} edit' }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Temp Suite");

const filePath = path.join(__dirname, '../data-vault/data/web/temp-internship.xlsx');
XLSX.writeFile(wb, filePath);
console.log(`Temp Internship Suite created: ${filePath}`);
