const XLSX = require('xlsx');
const path = require('path');

const data = [
    // TC001: Verify Employer Portal Navigation
    { testCaseId: 'TC001', testCaseName: 'Verify Employer Portal Navigation', id: '1', action: 'navigate', selector: '', data: 'https://testplacementwebv1.azurewebsites.net/' },
    { testCaseId: 'TC001', testCaseName: 'Verify Employer Portal Navigation', id: '2', action: 'click', selector: 'EMPLOYER_PORTAL_BTN', data: '' },
    { testCaseId: 'TC001', testCaseName: 'Verify Employer Portal Navigation', id: '3', action: 'waitfor', selector: 'WELCOME_HEADER', data: '' },

    // TC003: Empty Login Validation
    { testCaseId: 'TC003', testCaseName: 'Empty Login Validation', id: '1', action: 'navigate', selector: '', data: 'https://testplacementwebv1.azurewebsites.net/' },
    { testCaseId: 'TC003', testCaseName: 'Empty Login Validation', id: '2', action: 'click', selector: 'EMPLOYER_PORTAL_BTN', data: '' },
    { testCaseId: 'TC003', testCaseName: 'Empty Login Validation', id: '3', action: 'click', selector: 'EMPLOYER_LOGIN_BTN', data: '' },
    { testCaseId: 'TC003', testCaseName: 'Empty Login Validation', id: '4', action: 'waitfor', selector: 'text=Invalid', data: '' },

    // TC004: Successful Employer Login
    { testCaseId: 'TC004', testCaseName: 'Successful Employer Login', id: '1', action: 'login_to_employer_portal', selector: '', data: '' },
    { testCaseId: 'TC004', testCaseName: 'Successful Employer Login', id: '2', action: 'waitfor', selector: 'DASHBOARD_HEADING', data: '' },

    // TC005: End-to-End Job Posting
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '1', action: 'login_to_employer_portal', selector: '', data: '' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '2', action: 'click', selector: 'MANAGE_POSTINGS_TOGGLE', data: '' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '3', action: 'click', selector: 'POST_A_JOB_MENU_LINK', data: '' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '4', action: 'type', selector: 'JOB_TITLE_INPUT', data: 'demo job {{TIMESTAMP}}' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '5', action: 'select', selector: 'JOB_TYPE_SELECT', data: 'Full' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '6', action: 'select', selector: 'JOB_CATEGORY_SELECT', data: '1' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '7', action: 'select', selector: 'EDUCATION_LEVEL_SELECT', data: '2' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '8', action: 'type', selector: 'MIN_SALARY_INPUT', data: '100000' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '9', action: 'type', selector: 'MAX_SALARY_INPUT', data: '10000000' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '10', action: 'select', selector: 'MIN_EXP_SELECT', data: '1' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '11', action: 'select', selector: 'MAX_EXP_SELECT', data: '7' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '12', action: 'click', selector: 'CITY_SELECT2_CONTAINER', data: '' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '13', action: 'type', selector: 'CITY_SELECT2_INPUT', data: 'Kolkata' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '14', action: 'click', selector: 'SELECT2_OPTION_KOLKATA', data: '' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '15', action: 'click', selector: 'SKILLS_SELECT2_CONTAINER', data: '' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '16', action: 'type', selector: 'SKILLS_SELECT2_INPUT', data: '2D ANIMATION' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '17', action: 'press', selector: 'SKILLS_SELECT2_INPUT', data: 'Enter' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '18', action: 'js_eval', selector: '', data: "CKEDITOR.instances.jobDescription.setData('This is a comprehensive job description for the demo job posting. It needs to be at least 100 characters long to satisfy the front-end validation requirements.')" },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '19', action: 'type', selector: 'POSITIONS_INPUT', data: '2' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '20', action: 'click', selector: 'START_DATE_INPUT', data: '' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '21', action: 'click', selector: 'CALENDAR_DAY_24', data: '' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '22', action: 'click', selector: 'END_DATE_INPUT', data: '' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '23', action: 'click', selector: 'CALENDAR_DAY_31', data: '' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '24', action: 'click', selector: 'SUBMIT_JOB_BTN', data: '' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '25', action: 'click', selector: 'NO_SHOW_LIST_BTN', data: '' },
    { testCaseId: 'TC005', testCaseName: 'End-to-End Job Posting', id: '26', action: 'waitfor', selector: 'LATEST_JOB_TITLE', data: 'text=demo job {{TIMESTAMP}}' },

    // TC007: End-to-End Internship Posting
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '1', action: 'login_to_employer_portal', selector: '', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '2', action: 'click', selector: 'MANAGE_POSTINGS_TOGGLE', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '3', action: 'click', selector: 'POST_INTERNSHIP_MENU_LINK', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '4', action: 'type', selector: 'INTERNSHIP_TITLE_INPUT', data: 'demo internship {{TIMESTAMP}}' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '5', action: 'select', selector: 'INTERNSHIP_TYPE_SELECT', data: 'Full' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '6', action: 'select', selector: 'INTERNSHIP_CATEGORY_SELECT', data: '1' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '7', action: 'select', selector: 'INTERNSHIP_EDUCATION_SELECT', data: '3' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '8', action: 'type', selector: 'MIN_STIPEND_INPUT', data: '10000' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '9', action: 'type', selector: 'MAX_STIPEND_INPUT', data: '20000' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '10', action: 'select', selector: 'INTERNSHIP_MAX_EXP_SELECT', data: '3' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '11', action: 'click', selector: 'INTERNSHIP_CITY_SELECT2_CONTAINER', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '12', action: 'type', selector: 'INTERNSHIP_CITY_SELECT2_INPUT', data: 'kolkata' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '13', action: 'click', selector: 'SELECT2_OPTION_KOLKATA', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '14', action: 'click', selector: 'INTERNSHIP_SKILLS_SELECT2_CONTAINER', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '15', action: 'type', selector: 'INTERNSHIP_SKILLS_SELECT2_INPUT', data: '2D ANIMATION' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '16', action: 'click', selector: 'SELECT2_OPTION_2D_ANIMATION', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '17', action: 'js_eval', selector: '', data: "CKEDITOR.instances.InternshipDescription.setData('This is a detailed internship description for the demo.')" },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '18', action: 'type', selector: 'INTERNSHIP_POSITIONS_INPUT', data: '5' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '19', action: 'click', selector: 'INTERNSHIP_START_DATE_INPUT', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '20', action: 'click', selector: 'CALENDAR_DAY_24', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '21', action: 'click', selector: 'INTERNSHIP_END_DATE_INPUT', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '22', action: 'click', selector: 'CALENDAR_DAY_31', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '23', action: 'type', selector: 'INTERNSHIP_DURATION_INPUT', data: '7' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '24', action: 'click', selector: 'SUBMIT_INTERNSHIP_BTN', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '24.5', action: 'waitfor', selector: 'NO_SHOW_LIST_BTN', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '25', action: 'click', selector: 'NO_SHOW_LIST_BTN', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '26', action: 'click', selector: 'RECENT_INTERNSHIPS_LINK', data: '' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting', id: '27', action: 'waitfor', selector: 'LATEST_JOB_TITLE', data: 'text=demo internship {{TIMESTAMP}}' },

    // TC008: Verify Edit Job Title
    { testCaseId: 'TC008', testCaseName: 'Verify Edit Job Title', id: '1', action: 'login_to_employer_portal', selector: '', data: '' },
    { testCaseId: 'TC008', testCaseName: 'Verify Edit Job Title', id: '2', action: 'click', selector: 'RECENT_JOBS_LINK', data: '' },
    { testCaseId: 'TC008', testCaseName: 'Verify Edit Job Title', id: '3', action: 'waitfor', selector: 'EDIT_JOB_BTN', data: '' },
    { testCaseId: 'TC008', testCaseName: 'Verify Edit Job Title', id: '4', action: 'click', selector: 'EDIT_JOB_BTN', data: '' },
    { testCaseId: 'TC008', testCaseName: 'Verify Edit Job Title', id: '5', action: 'waitfor', selector: 'JOB_TITLE_INPUT', data: '' },
    { testCaseId: 'TC008', testCaseName: 'Verify Edit Job Title', id: '6', action: 'type', selector: 'JOB_TITLE_INPUT', data: 'demo job {{TIMESTAMP}} edit' },
    { testCaseId: 'TC008', testCaseName: 'Verify Edit Job Title', id: '7', action: 'click', selector: 'UPDATE_JOB_BTN', data: '' },
    { testCaseId: 'TC008', testCaseName: 'Verify Edit Job Title', id: '8', action: 'click', selector: 'ALERT_OK_BTN', data: '' },
    { testCaseId: 'TC008', testCaseName: 'Verify Edit Job Title', id: '9', action: 'verify_text', selector: 'css:body', data: 'demo job {{TIMESTAMP}} edit' },

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
XLSX.utils.book_append_sheet(wb, ws, "Employer Suite");

const filePath = path.join(__dirname, '../data-vault/data/web/employer-suite.xlsx');
XLSX.writeFile(wb, filePath);
console.log(`Consolidated Employer Suite created: ${filePath}`);
