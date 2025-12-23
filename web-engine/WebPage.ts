import { ConfigProvider } from '@automation/shared-lib';

export interface LocatorRepo {
    [key: string]: string;
}

const config = ConfigProvider.getInstance().getConfig();

export const WebLocators: LocatorRepo = {
    "HOME_PAGE": config.baseUrl,
    "EMPLOYER_PORTAL_BTN": "a[href*='logType=EMP']",
    "WELCOME_HEADER": ".login-text h1",
    "EMPLOYER_LOGIN_BTN": "button:has-text('Employer Login')",
    "SIGN_IN_WITH_EMAIL_BTN": "button:has-text('Sign in with email')",
    "EMAIL_INPUT": "input[name='email']",
    "NEXT_BTN": "button:has-text('Next')",
    "PASSWORD_INPUT": "input[name='password']",
    "SIGN_IN_SUBMIT_BTN": "button:has-text('Sign In')",
    "DASHBOARD_HEADING": "text=Dashboard",

    // Job Posting Flow
    "MANAGE_POSTINGS_TOGGLE": "button.btn-primary.dropdown-toggle:has-text('Manage Postings')",
    "POST_A_JOB_MENU_LINK": "a[href='/Job/PostJob']",
    "JOB_TITLE_INPUT": "#PostJobRequest_JobTitle",
    "JOB_TYPE_SELECT": "#PostJobRequest_JobType",
    "JOB_CATEGORY_SELECT": "#PostJobRequest_JobCategory",
    "EDUCATION_LEVEL_SELECT": "#PostJobRequest_EducationDetailId",
    "MIN_SALARY_INPUT": "#PostJobRequest_MinSalary",
    "MAX_SALARY_INPUT": "#PostJobRequest_MaxSalary",
    "MIN_EXP_SELECT": "#PostJobRequest_MinExp",
    "MAX_EXP_SELECT": "#PostJobRequest_MaxExp",

    // Select2 Components (Multi-select)
    "CITY_SELECT2_CONTAINER": "select#PostJobRequest_JobCitiesString + .select2-container .select2-selection--multiple",
    "CITY_SELECT2_INPUT": "select#PostJobRequest_JobCitiesString + .select2-container .select2-search__field",
    "SKILLS_SELECT2_CONTAINER": "select#PostJobRequest_JobSkillsString + .select2-container .select2-selection--multiple",
    "SKILLS_SELECT2_INPUT": "select#PostJobRequest_JobSkillsString + .select2-container .select2-search__field",

    "JOB_DESCRIPTION_TEXTAREA": "#jobDescription",
    "POSITIONS_INPUT": "#PostJobRequest_NoofPositions",
    "START_DATE_INPUT": "#PostJobRequest_JobPostedStartDate",
    "END_DATE_INPUT": "#PostJobRequest_JobPostedEndDate",
    "SUBMIT_JOB_BTN": "#BtnPostJob",

    // Verification
    "RECENT_JOBS_LINK": "a[href='/Job/RecentJob']",
    "RECENT_JOBS_SEARCH_INPUT": "#RecentJobRequests_Searchkey",
    "RECENT_JOBS_SEARCH_BTN": "#SearchRecentJob",
    "RECENT_JOBS_ITEM": "a.text-dark"
};
