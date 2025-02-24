import { debugLog, verifyDOMElements } from './utils.js';
import { initializeZipSearch } from './zipSearch.js';
import { initializeSidebar } from './sidebar.js';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    debugLog('DOM Content Loaded');
    
    // Verify all required DOM elements exist
    if (!verifyDOMElements()) {
        console.error('Cannot initialize application due to missing DOM elements');
        return;
    }
    
    // Initialize zip code search functionality
    initializeZipSearch();
    
    // Initialize sidebar functionality
    initializeSidebar();
    
    debugLog('Application initialized successfully');
});
