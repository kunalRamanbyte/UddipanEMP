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
    "DASHBOARD_HEADING": "text=Dashboard"
};
