const XLSX = require('xlsx');
const path = require('path');

const data = [
    { testCaseId: 'TC_EDIT_01', testCaseName: 'Verify Edit Job Title', id: '1', action: 'login_to_employer_portal', selector: '', data: '' },
    { testCaseId: 'TC_EDIT_01', testCaseName: 'Verify Edit Job Title', id: '2', action: 'click', selector: 'RECENT_JOBS_LINK', data: '' },
    { testCaseId: 'TC_EDIT_01', testCaseName: 'Verify Edit Job Title', id: '3', action: 'click', selector: 'EDIT_JOB_BTN', data: '' },
    { testCaseId: 'TC_EDIT_01', testCaseName: 'Verify Edit Job Title', id: '4', action: 'type', selector: 'JOB_TITLE_INPUT', data: 'demo job {{TIMESTAMP}} edit' },
    { testCaseId: 'TC_EDIT_01', testCaseName: 'Verify Edit Job Title', id: '5', action: 'click', selector: 'UPDATE_JOB_BTN', data: '' },
    { testCaseId: 'TC_EDIT_01', testCaseName: 'Verify Edit Job Title', id: '6', action: 'click', selector: 'ALERT_OK_BTN', data: '' },
    { testCaseId: 'TC_EDIT_01', testCaseName: 'Verify Edit Job Title', id: '7', action: 'waitfor', selector: 'text=demo job {{TIMESTAMP}} edit', data: '' }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

const filePath = path.join(__dirname, '../data-vault/data/web/edit-job-suite.xlsx');
XLSX.writeFile(wb, filePath);
console.log(`Excel test file created: ${filePath}`);
