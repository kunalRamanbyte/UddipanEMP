const XLSX = require('xlsx');
const path = require('path');

const data = [
    // Test Case 7: Post Internship (New from user recording)
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '1', action: 'navigate', selector: '', data: 'https://testplacementwebv1.azurewebsites.net/' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '2', action: 'click', selector: 'EMPLOYER_PORTAL_BTN' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '3', action: 'click', selector: 'SIGN_IN_WITH_EMAIL_BTN' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '4', action: 'type', selector: 'EMAIL_INPUT', data: 'oracle.tech@yopmail.com' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '5', action: 'click', selector: 'NEXT_BTN' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '6', action: 'type', selector: 'PASSWORD_INPUT', data: 'Pibm@123' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '7', action: 'click', selector: 'SIGN_IN_SUBMIT_BTN' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '8', action: 'waitFor', selector: 'DASHBOARD_HEADING' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '9', action: 'click', selector: 'MANAGE_POSTINGS_TOGGLE' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '10', action: 'click', selector: 'POST_INTERNSHIP_MENU_LINK' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '11', action: 'type', selector: 'INTERNSHIP_TITLE_INPUT', data: 'demo internship {{TIMESTAMP}}' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '12', action: 'select', selector: 'INTERNSHIP_TYPE_SELECT', data: 'Full' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '13', action: 'select', selector: 'INTERNSHIP_CATEGORY_SELECT', data: '1' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '14', action: 'select', selector: 'INTERNSHIP_EDUCATION_SELECT', data: '3' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '15', action: 'type', selector: 'MIN_STIPEND_INPUT', data: '10000' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '16', action: 'type', selector: 'MAX_STIPEND_INPUT', data: '20000' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '17', action: 'select', selector: 'INTERNSHIP_MAX_EXP_SELECT', data: '3' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '18', action: 'click', selector: 'INTERNSHIP_CITY_SELECT2_CONTAINER' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '19', action: 'type', selector: 'INTERNSHIP_CITY_SELECT2_INPUT', data: 'kolkata' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '20', action: 'click', selector: 'SELECT2_OPTION_KOLKATA' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '21', action: 'click', selector: 'INTERNSHIP_SKILLS_SELECT2_CONTAINER' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '22', action: 'type', selector: 'INTERNSHIP_SKILLS_SELECT2_INPUT', data: '2D ANIMATION' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '23', action: 'click', selector: 'SELECT2_OPTION_2D_ANIMATION' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '24', action: 'js_eval', data: "CKEDITOR.instances.InternshipDescription.setData('This is a detailed and professional internship description created for the automation demo. We are looking for energetic interns who are eager to learn and grow in a fast-paced environment. The ideal candidate should have strong communication skills and a passion for technology. Join us to build the future together and gain valuable industry experience in Kolkata!')" },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '25', action: 'type', selector: 'INTERNSHIP_POSITIONS_INPUT', data: '5' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '26', action: 'click', selector: 'INTERNSHIP_START_DATE_INPUT' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '27', action: 'click', selector: 'CALENDAR_DAY_24' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '28', action: 'click', selector: 'INTERNSHIP_END_DATE_INPUT' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '29', action: 'click', selector: 'CALENDAR_DAY_31' },
    // Duration must match date range (24th to 31st = 7 days) to pass validation
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '30', action: 'type', selector: 'INTERNSHIP_DURATION_INPUT', data: '7' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '31', action: 'click', selector: 'SUBMIT_INTERNSHIP_BTN' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '32', action: 'click', selector: 'NO_SHOW_LIST_BTN' },
    // Verification using the Recent Internships link and LATEST_JOB_TITLE locator (reusing locator as it targets the same list structure)
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '33', action: 'click', selector: 'RECENT_INTERNSHIPS_LINK' },
    { testCaseId: 'TC007', testCaseName: 'End-to-End Internship Posting (Kolkata)', id: '34', action: 'waitFor', selector: 'LATEST_JOB_TITLE', data: 'text=demo internship {{TIMESTAMP}}' }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Test Cases");

const filePath = path.join(__dirname, '../data-vault/data/web/internship-suite.xlsx');
XLSX.writeFile(wb, filePath);
console.log(`Internship test suite written to ${filePath}`);
