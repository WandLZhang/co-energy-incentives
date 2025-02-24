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

    if (container && questionCard) {
        const containerStyles = getComputedStyle(container);
        const cardStyles = getComputedStyle(questionCard);
        
        debugLog('[QUESTIONNAIRE] Container styles:', {
            display: containerStyles.display,
            visibility: containerStyles.visibility,
            opacity: containerStyles.opacity,
            position: containerStyles.position,
            zIndex: containerStyles.zIndex
        });
        
        debugLog('[QUESTIONNAIRE] Question card styles:', {
            display: cardStyles.display,
            visibility: cardStyles.visibility,
            opacity: cardStyles.opacity
        });
        
        if (questionText) {
            debugLog('[QUESTIONNAIRE] Question text content:', questionText.textContent);
        }
        
        if (optionsContainer) {
            debugLog('[QUESTIONNAIRE] Options container:', {
                childCount: optionsContainer.children.length,
                display: getComputedStyle(optionsContainer).display
            });
        }
    } else {
        console.error('[QUESTIONNAIRE] Required elements not found during visibility check:', {
            container: !!container,
            questionCard: !!questionCard
        });
    }
}

// Function to query incentives based on user responses
export async function queryIncentives(responses) {
    debugLog('[API] Querying incentives with responses:', responses);
    try {
        const response = await fetch('https://co-energy-query-firestore-934163632848.us-central1.run.app', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(responses)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        debugLog('[API] Received incentives data:', data);
        return data;
    } catch (error) {
        console.error('[API] Error querying incentives:', error);
        return null;
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

    const currentResponse = userResponses[question.id];
    debugLog('[QUESTIONNAIRE] Current response:', {
        questionId: question.id,
        response: currentResponse,
        type: question.type
    });

    const buttons = optionsContainer.querySelectorAll('button');
    buttons.forEach(button => {
        const optionValue = button.dataset.value;
        debugLog('[QUESTIONNAIRE] Processing button:', {
            value: optionValue,
            text: button.textContent,
            currentClasses: button.className
        });
        
        let isSelected = false;
        if (question.type === 'single') {
            isSelected = currentResponse === optionValue;
        } else {
            isSelected = Array.isArray(currentResponse) && currentResponse.includes(optionValue);
        }
        
        debugLog('[QUESTIONNAIRE] Button selection state:', {
            value: optionValue,
            isSelected: isSelected,
            type: question.type
        });

        if (isSelected) {
            button.classList.add('bg-teal-500');
            button.classList.remove('bg-white');
        } else {
            button.classList.remove('bg-teal-500');
            button.classList.add('bg-white');
        }
    });
}
