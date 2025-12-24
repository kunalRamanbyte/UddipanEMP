const XLSX = require('xlsx');
const path = require('path');

const data = [
    // Test Case 1: Employer Portal Flow (Hybrid Approach)
    { testCaseId: 'TC001', testCaseName: 'Verify Employer Portal Navigation', id: '1', action: 'navigate', selector: '', data: 'HOME_PAGE' },
    { testCaseId: 'TC001', testCaseName: 'Verify Employer Portal Navigation', id: '2', action: 'click', selector: 'EMPLOYER_PORTAL_BTN', data: '' },
    { testCaseId: 'TC001', testCaseName: 'Verify Employer Portal Navigation', id: '3', action: 'waitFor', selector: 'WELCOME_HEADER', data: '' },

    // Test Case 2: Direct URL navigation (Still supported)
    { testCaseId: 'TC002', testCaseName: 'External Site Navigation', id: '1', action: 'navigate', selector: '', data: 'https://google.com' },
    { testCaseId: 'TC002', testCaseName: 'External Site Navigation', id: '2', action: 'waitFor', selector: 'body', data: '' },

    // Test Case 3: Employer Portal Login Attempt (Expect failure/UI validation)
    { testCaseId: 'TC003', testCaseName: 'Empty Login Validation', id: '1', action: 'navigate', selector: '', data: 'HOME_PAGE' },
    { testCaseId: 'TC003', testCaseName: 'Empty Login Validation', id: '2', action: 'click', selector: 'EMPLOYER_PORTAL_BTN', data: '' },
    { testCaseId: 'TC003', testCaseName: 'Empty Login Validation', id: '3', action: 'click', selector: 'EMPLOYER_LOGIN_BTN', data: '' },
    { testCaseId: 'TC003', testCaseName: 'Empty Login Validation', id: '4', action: 'waitFor', selector: 'text=Invalid', data: '' },

    // Test Case 4: Full Employer Login Flow (Success - Direct Steps)
    { testCaseId: 'TC004', testCaseName: 'Successful Employer Login', id: '1', action: 'navigate', selector: '', data: 'https://testplacementwebv1.azurewebsites.net/' },
    { testCaseId: 'TC004', testCaseName: 'Successful Employer Login', id: '2', action: 'click', selector: "css:a[href*='logType=EMP']", data: '' },
    { testCaseId: 'TC004', testCaseName: 'Successful Employer Login', id: '3', action: 'waitFor', selector: "css:button:has-text('Employer Login')", data: '' },
    { testCaseId: 'TC004', testCaseName: 'Successful Employer Login', id: '4', action: 'click', selector: "css:button:has-text('Employer Login')", data: '' },
    { testCaseId: 'TC004', testCaseName: 'Successful Employer Login', id: '5', action: 'click', selector: "css:button:has-text('Sign in with email')", data: '' },
    { testCaseId: 'TC004', testCaseName: 'Successful Employer Login', id: '6', action: 'type', selector: "css:input[name='email']", data: 'oracle.tech@yopmail.com' },
    { testCaseId: 'TC004', testCaseName: 'Successful Employer Login', id: '7', action: 'click', selector: "css:button:has-text('Next')", data: '' },
    { testCaseId: 'TC004', testCaseName: 'Successful Employer Login', id: '8', action: 'type', selector: "css:input[name='password']", data: 'Pibm@123' },
    { testCaseId: 'TC004', testCaseName: 'Successful Employer Login', id: '9', action: 'click', selector: "css:button:has-text('Sign In')", data: '' },
    { testCaseId: 'TC004', testCaseName: 'Successful Employer Login', id: '10', action: 'waitFor', selector: 'text=Dashboard', data: '' }
];

// Test Case 5: Complex Job Posting Flow (New from user recording)
const dynamicJobTitle = 'demo job {{TIMESTAMP}}';
const tc005Name = 'End-to-End Job Posting (Kolkata)';
data.push(
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '1', action: 'navigate', selector: '', data: 'https://testplacementwebv1.azurewebsites.net/' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '2', action: 'click', selector: 'EMPLOYER_PORTAL_BTN', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '3', action: 'click', selector: 'SIGN_IN_WITH_EMAIL_BTN', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '4', action: 'type', selector: 'EMAIL_INPUT', data: 'oracle.tech@yopmail.com' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '5', action: 'click', selector: 'NEXT_BTN', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '6', action: 'type', selector: 'PASSWORD_INPUT', data: 'Pibm@123' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '7', action: 'click', selector: 'SIGN_IN_SUBMIT_BTN', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '8', action: 'waitFor', selector: 'DASHBOARD_HEADING', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '9', action: 'click', selector: 'MANAGE_POSTINGS_TOGGLE', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '10', action: 'click', selector: 'POST_A_JOB_MENU_LINK', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '11', action: 'type', selector: 'JOB_TITLE_INPUT', data: dynamicJobTitle },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '12', action: 'select', selector: 'JOB_TYPE_SELECT', data: 'Full' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '13', action: 'select', selector: 'JOB_CATEGORY_SELECT', data: '1' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '14', action: 'select', selector: 'EDUCATION_LEVEL_SELECT', data: '2' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '15', action: 'type', selector: 'MIN_SALARY_INPUT', data: '100000' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '16', action: 'type', selector: 'MAX_SALARY_INPUT', data: '10000000' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '17', action: 'select', selector: 'MIN_EXP_SELECT', data: '1' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '18', action: 'select', selector: 'MAX_EXP_SELECT', data: '7' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '19', action: 'click', selector: 'CITY_SELECT2_CONTAINER', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '20', action: 'type', selector: 'CITY_SELECT2_INPUT', data: 'Kolkata' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '21', action: 'click', selector: 'SELECT2_OPTION_KOLKATA', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '22', action: 'click', selector: 'SKILLS_SELECT2_CONTAINER', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '23', action: 'type', selector: 'SKILLS_SELECT2_INPUT', data: '2D ANIMATION' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '24', action: 'press', selector: 'SKILLS_SELECT2_INPUT', data: 'Enter' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '25', action: 'js_eval', selector: '', data: "CKEDITOR.instances.jobDescription.setData('This is a comprehensive job description for the demo job posting. It needs to be at least 100 characters long to satisfy the front-end validation requirements of the application. We are looking for talented individuals to join our growing team and contribute to exciting projects in the tech industry. Apply now to be part of our success story!')" },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '26', action: 'type', selector: 'POSITIONS_INPUT', data: '2' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '27', action: 'click', selector: 'START_DATE_INPUT', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '28', action: 'click', selector: 'CALENDAR_DAY_24', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '29', action: 'click', selector: 'END_DATE_INPUT', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '30', action: 'click', selector: 'CALENDAR_DAY_31', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '31', action: 'click', selector: 'SUBMIT_JOB_BTN', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '32', action: 'click', selector: 'NO_SHOW_LIST_BTN', data: '' },
    { testCaseId: 'TC005', testCaseName: tc005Name, id: '33', action: 'waitFor', selector: 'LATEST_JOB_TITLE', data: 'text=' + dynamicJobTitle }
);

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Test Cases");

const filePath = path.join(__dirname, '../data-vault/data/test-suite.xlsx');
XLSX.writeFile(wb, filePath);
console.log(`Sample data written to ${filePath}`);
