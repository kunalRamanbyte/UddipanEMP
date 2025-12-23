export class LocatorResolver {
    /**
     * Resolves a selector based on priority strategy:
     * 1. If it's a "Plain Word", try resolving as data-testid, then aria-label.
     * 2. If it has a prefix (e.g., 'id:', 'css:', 'xpath:'), follow the prefix.
     * 3. Otherwise, return as is (Standard Playwright/Appium behavior).
     */
    public static resolve(selector: string): string {
        if (!selector) return '';

        // 1. Handle explicit prefixes
        if (selector.includes(':')) {
            const [prefix, value] = selector.split(/:(.+)/);
            switch (prefix.toLowerCase()) {
                case 'testid': return `[data-testid="${value}"]`;
                case 'label': return `[aria-label="${value}"]`;
                case 'role': return `[role="${value}"]`;
                case 'css': return value;
                case 'xpath': return `xpath=${value}`;
                case 'id': return `#${value}`;
            }
        }

        // 2. The "Smart" priority for plain words (No spaces, no specialized CSS chars)
        const isPlainWord = /^[a-zA-Z0-9_-]+$/.test(selector);
        if (isPlainWord) {
            // We return a CSS selector that tries testid first, then aria-label, then falls back to ID
            // Playwright supports: :where([data-testid="..."], [aria-label="..."], #${selector})
            return `:where([data-testid="${selector}"], [aria-label="${selector}"], [role="${selector}"], #${selector})`;
        }

        return selector;
    }
}
