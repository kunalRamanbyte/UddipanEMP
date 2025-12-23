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

    // Test Case 4: Full Employer Login Flow (Success - Direct Steps)
    { testCaseId: 'TC004', id: '1', action: 'navigate', selector: '', data: 'https://testplacementwebv1.azurewebsites.net/' },
    { testCaseId: 'TC004', id: '2', action: 'click', selector: "css:a[href*='logType=EMP']", data: '' },
    { testCaseId: 'TC004', id: '3', action: 'waitFor', selector: "css:button:has-text('Employer Login')", data: '' },
    { testCaseId: 'TC004', id: '4', action: 'click', selector: "css:button:has-text('Employer Login')", data: '' },
    { testCaseId: 'TC004', id: '5', action: 'click', selector: "css:button:has-text('Sign in with email')", data: '' },
    { testCaseId: 'TC004', id: '6', action: 'type', selector: "css:input[name='email']", data: 'oracle.tech@yopmail.com' },
    { testCaseId: 'TC004', id: '7', action: 'click', selector: "css:button:has-text('Next')", data: '' },
    { testCaseId: 'TC004', id: '8', action: 'type', selector: "css:input[name='password']", data: 'Pibm@123' },
    { testCaseId: 'TC004', id: '9', action: 'click', selector: "css:button:has-text('Sign In')", data: '' },
    { testCaseId: 'TC004', id: '10', action: 'waitFor', selector: 'text=Dashboard', data: '' }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Test Cases");

const filePath = path.join(__dirname, '../data-vault/data/test-suite.xlsx');
XLSX.writeFile(wb, filePath);
console.log(`Sample data written to ${filePath}`);
