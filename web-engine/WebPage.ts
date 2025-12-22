import { UniversalDriver } from '@automation/shared-lib';

export class WebPage {
    private driver: UniversalDriver;

    constructor(driver: UniversalDriver) {
        this.driver = driver;
    }

    // Placeholders for scanned elements
    // async login(username: string) { ... }
}
