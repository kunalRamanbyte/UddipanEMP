const XLSX = require('xlsx');
const path = require('path');

const data = [
    // Test Case 1: Employer Portal Flow (Hybrid Approach)
    { testCaseId: 'TC001', id: '1', action: 'navigate', selector: '', data: 'HOME_PAGE' },
    { testCaseId: 'TC001', id: '2', action: 'click', selector: 'EMPLOYER_PORTAL_BTN', data: '' },
    { testCaseId: 'TC001', id: '3', action: 'waitFor', selector: 'WELCOME_HEADER', data: '' },

    // Test Case 2: Direct URL navigation (Still supported)
    { testCaseId: 'TC002', id: '1', action: 'navigate', selector: '', data: 'https://google.com' },
    { testCaseId: 'TC002', id: '2', action: 'waitFor', selector: 'body', data: '' },

    // Test Case 3: Employer Portal Login Attempt (Expect failure/UI validation)
    { testCaseId: 'TC003', id: '1', action: 'navigate', selector: '', data: 'HOME_PAGE' },
    { testCaseId: 'TC003', id: '2', action: 'click', selector: 'EMPLOYER_PORTAL_BTN', data: '' },
    { testCaseId: 'TC003', id: '3', action: 'click', selector: 'EMPLOYER_LOGIN_BTN', data: '' },
    { testCaseId: 'TC003', id: '4', action: 'waitFor', selector: 'text=Invalid', data: '' },

    // Test Case 4: Full Employer Login Flow (Success via Composite Action)
    { testCaseId: 'TC004', id: '1', action: 'LOGIN_TO_EMPLOYER_PORTAL', selector: '', data: '' }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Test Cases");

const filePath = path.join(__dirname, '../data-vault/data/test-suite.xlsx');
XLSX.writeFile(wb, filePath);
console.log(`Sample data written to ${filePath}`);
