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
    debugLog('[QUESTIONNAIRE] Verifying DOM elements...');
    const elements = ['zipcode', 'questionnaire-container', 'question-card', 'question-text', 'options-container', 'prev-question', 'next-question'];
    const missingElements = [];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            missingElements.push(id);
            console.error(`[QUESTIONNAIRE] Element with id '${id}' not found in the DOM`);
        }
    });
    
    if (missingElements.length > 0) {
        debugLog('[QUESTIONNAIRE] Missing elements:', missingElements);
        return false;
    }
    
    debugLog('[QUESTIONNAIRE] All required DOM elements found');
    return true;
}

// Check questionnaire visibility
export function checkQuestionnaireVisibility() {
    debugLog('[QUESTIONNAIRE] Checking visibility state');
    const container = document.getElementById('questionnaire-container');
    const questionCard = document.getElementById('question-card');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const initialCard = document.getElementById('initial-card');

    if (container && questionCard) {
        const containerStyles = getComputedStyle(container);
        const cardStyles = getComputedStyle(questionCard);
        const containerRect = container.getBoundingClientRect();
        
        debugLog('[QUESTIONNAIRE] Container styles:', {
            display: containerStyles.display,
            visibility: containerStyles.visibility,
            opacity: containerStyles.opacity,
            position: containerStyles.position,
            zIndex: containerStyles.zIndex,
            transform: containerStyles.transform,
            classes: container.className
        });
        
        debugLog('[QUESTIONNAIRE] Container position:', {
            top: containerRect.top,
            left: containerRect.left,
            width: containerRect.width,
            height: containerRect.height,
            inViewport: (
                containerRect.top >= 0 &&
                containerRect.left >= 0 &&
                containerRect.bottom <= window.innerHeight &&
                containerRect.right <= window.innerWidth
            )
        });
        
        debugLog('[QUESTIONNAIRE] Question card styles:', {
            display: cardStyles.display,
            visibility: cardStyles.visibility,
            opacity: cardStyles.opacity,
            transform: cardStyles.transform,
            classes: questionCard.className
        });
        
        if (questionText) {
            debugLog('[QUESTIONNAIRE] Question text content:', {
                text: questionText.textContent,
                display: getComputedStyle(questionText).display,
                visibility: getComputedStyle(questionText).visibility
            });
        }
        
        if (optionsContainer) {
            debugLog('[QUESTIONNAIRE] Options container:', {
                childCount: optionsContainer.children.length,
                display: getComputedStyle(optionsContainer).display,
                visibility: getComputedStyle(optionsContainer).visibility
            });
        }

        if (initialCard) {
            debugLog('[QUESTIONNAIRE] Initial card state:', {
                display: getComputedStyle(initialCard).display,
                opacity: getComputedStyle(initialCard).opacity,
                visibility: getComputedStyle(initialCard).visibility
            });
        }
    } else {
        console.error('[QUESTIONNAIRE] Required elements not found during visibility check:', {
            container: !!container,
            questionCard: !!questionCard
        });
    }
}

// Helper function for updating option styles
export function updateOptionStyles(question, userResponses) {
    debugLog('[QUESTIONNAIRE] Updating option styles for question:', question.id);
    const optionsContainer = document.getElementById('options-container');
    if (!optionsContainer) {
        console.error('[QUESTIONNAIRE] Options container not found');
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
