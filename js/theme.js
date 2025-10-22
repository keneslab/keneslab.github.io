// Theme Management - Fixed to Dark Mode
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        // Always apply dark theme
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
