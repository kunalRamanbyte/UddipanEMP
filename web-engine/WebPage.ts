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
    "SELECT2_OPTION_DHAKA": "xpath=//li[contains(@class, 'select2-results__option') and text()='Dhaka']",
    "SELECT2_OPTION_KOLKATA": "xpath=//li[contains(@class, 'select2-results__option') and text()='Kolkata']",
    "SKILLS_SELECT2_CONTAINER": "select#PostJobRequest_JobSkillsString + .select2-container .select2-selection--multiple",
    "SKILLS_SELECT2_INPUT": "select#PostJobRequest_JobSkillsString + .select2-container .select2-search__field",

    "JOB_DESCRIPTION_TEXTAREA": "#jobDescription",
    "POSITIONS_INPUT": "#PostJobRequest_NoofPositions",
    "START_DATE_INPUT": "#PostJobRequest_JobPostedStartDate",
    "END_DATE_INPUT": "#PostJobRequest_JobPostedEndDate",
    "CALENDAR_DAY_24": "xpath=//td[text()='{{CURRENT_DAY}}']",
    "CALENDAR_DAY_31": "xpath=//td[text()='{{CURRENT_DAY}}']",
    "SUBMIT_JOB_BTN": "#BtnPostJob",

    // Internship Posting Flow
    "POST_INTERNSHIP_MENU_LINK": "a[href='/Internship/PostInternship']",
    "INTERNSHIP_TITLE_INPUT": "#PostInternshipRequest_InternshipTitle",
    "INTERNSHIP_TYPE_SELECT": "#PostInternshipRequest_InternshipType",
    "INTERNSHIP_CATEGORY_SELECT": "#PostInternshipRequest_InternshipCategory",
    "INTERNSHIP_EDUCATION_SELECT": "#PostInternshipRequest_EducationLevel",
    "MIN_STIPEND_INPUT": "#PostInternshipRequest_MinStipend",
    "MAX_STIPEND_INPUT": "#PostInternshipRequest_MaxStipend",
    "INTERNSHIP_MAX_EXP_SELECT": "#PostInternshipRequest_MaxExp",
    "INTERNSHIP_CITY_SELECT2_CONTAINER": "select#PostInternshipRequest_InternshipCitiesString + .select2-container .select2-selection--multiple",
    "INTERNSHIP_CITY_SELECT2_INPUT": "select#PostInternshipRequest_InternshipCitiesString + .select2-container .select2-search__field",
    "INTERNSHIP_POSITIONS_INPUT": "#PostInternshipRequest_NoofPositions",
    "INTERNSHIP_START_DATE_INPUT": "#PostInternshipRequest_InternshipStartDate",
    "INTERNSHIP_END_DATE_INPUT": "#PostInternshipRequest_InternshipEndDate",
    "INTERNSHIP_DURATION_INPUT": "#PostInternshipRequest_TotalDuration",
    "INTERNSHIP_SKILLS_SELECT2_CONTAINER": "select#PostInternshipRequest_InternshipSkillsString + .select2-container .select2-selection--multiple",
    "INTERNSHIP_SKILLS_SELECT2_INPUT": "select#PostInternshipRequest_InternshipSkillsString + .select2-container .select2-search__field",
    "SELECT2_OPTION_2D_ANIMATION": "xpath=//li[contains(@class, 'select2-results__option') and text()='2D ANIMATION']",
    "SUBMIT_INTERNSHIP_BTN": "#BtnPostInternship",

    // Verification
    "RECENT_JOBS_LINK": "a[href='/Job/RecentJob']",
    "RECENT_INTERNSHIPS_LINK": "a[href='/Internship/RecentInternship']",
    "RECENT_JOBS_SEARCH_INPUT": "#RecentJobRequests_Searchkey",
    "RECENT_JOBS_SEARCH_BTN": "#SearchRecentJob",
    "RECENT_JOBS_ITEM": "a.text-dark",
    "LATEST_JOB_TITLE": ".job-list-desc h6.mb-2:first-of-type a.text-dark",
    "NO_SHOW_LIST_BTN": "button:has-text('No, show list!')",
    "EDIT_JOB_BTN": "a.btn-primary:has-text('Edit')",
    "UPDATE_JOB_BTN": "button:has-text('Update Job')",
    "UPDATE_INTERNSHIP_BTN": "button:has-text('Update Internship')",
    "ALERT_OK_BTN": "button:has-text('OK')"
};
