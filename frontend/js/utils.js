// Debug logging function
export function debugLog(message, data = null) {
    const timestamp = new Date().toISOString();
    if (data) {
        console.log(`[${timestamp}] ${message}`, data);
    } else {
        console.log(`[${timestamp}] ${message}`);
    }
}

// DOM element verification
export function verifyDOMElements() {
    debugLog('Verifying DOM elements...');
    const elements = ['zipcode', 'questionnaire-container', 'question-card', 'question-text', 'options-container', 'prev-question', 'next-question'];
    const missingElements = [];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            missingElements.push(id);
            console.error(`Element with id '${id}' not found in the DOM`);
        }
    });
    
    if (missingElements.length > 0) {
        debugLog('Missing elements:', missingElements);
        return false;
    }
    
    debugLog('All required DOM elements found');
    return true;
}

// Check questionnaire visibility
export function checkQuestionnaireVisibility() {
    debugLog('Checking questionnaire visibility');
    const container = document.getElementById('questionnaire-container');
    if (container) {
        const styles = getComputedStyle(container);
        debugLog('Questionnaire container styles:', {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            position: styles.position,
            zIndex: styles.zIndex
        });
    } else {
        console.error('Questionnaire container not found during visibility check');
    }
}

// Helper function for updating option styles
export function updateOptionStyles(question, userResponses) {
    debugLog('Updating option styles for question:', question.id);
    const optionsContainer = document.getElementById('options-container');
    if (!optionsContainer) {
        console.error('Options container not found');
        return;
    }

    const buttons = optionsContainer.querySelectorAll('button');
    buttons.forEach(button => {
        const optionValue = button.textContent;
        const responses = userResponses[question.id] || [];
        
        if (question.type === 'single') {
            button.classList.toggle('bg-teal-500', responses === optionValue);
        } else {
            button.classList.toggle('bg-teal-500', responses.includes(optionValue));
        }
    });
}
