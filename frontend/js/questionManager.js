import { debugLog, checkQuestionnaireVisibility, updateOptionStyles } from './utils.js';
import { questions, conditionalQuestions } from './questions.js';

// State management
let currentQuestionIndex = 0;
export const userResponses = {};

// Question management functions
export function setupQuestionnaireNavigation() {
    debugLog('[QUESTIONNAIRE] Setting up navigation');
    const nextButton = document.getElementById('next-question');
    const prevButton = document.getElementById('prev-question');
    
    if (nextButton && prevButton) {
        nextButton.addEventListener('click', showNextQuestion);
        prevButton.addEventListener('click', showPreviousQuestion);
        debugLog('[QUESTIONNAIRE] Navigation buttons set up successfully');
    } else {
        console.error('[QUESTIONNAIRE] Navigation buttons not found during setup');
    }
}

export function getCurrentQuestion(index) {
    debugLog(`[QUESTIONNAIRE] Getting question for index: ${index}`);
    const baseQuestion = questions[index];
    if (!baseQuestion) {
        debugLog('[QUESTIONNAIRE] No base question found for index:', index);
        return null;
    }
    
    // Check for conditional questions that should be inserted
    for (const [key, conditionalQ] of Object.entries(conditionalQuestions)) {
        if (conditionalQ.showIf(userResponses) && 
            index > questions.findIndex(q => q.id === 'Q3')) {
            debugLog('[QUESTIONNAIRE] Found conditional question:', key);
            return conditionalQ;
        }
    }
    
    debugLog('[QUESTIONNAIRE] Returning base question:', baseQuestion.id);
    return baseQuestion;
}

export function getQuestionCount() {
    let count = questions.length;
    // Add conditional questions if they should be shown
    for (const [key, conditionalQ] of Object.entries(conditionalQuestions)) {
        if (conditionalQ.showIf(userResponses)) {
            count++;
        }
    }
    debugLog('[QUESTIONNAIRE] Total question count:', count);
    return count;
}

export function showNextQuestion() {
    debugLog('[QUESTIONNAIRE] Next button clicked. Current index:', currentQuestionIndex);
    if (currentQuestionIndex < getQuestionCount() - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    } else {
        finishQuestionnaire();
    }
}

export function showPreviousQuestion() {
    debugLog('[QUESTIONNAIRE] Previous button clicked. Current index:', currentQuestionIndex);
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    }
}

export function finishQuestionnaire() {
    debugLog('[QUESTIONNAIRE] Completed. User responses:', userResponses);
    alert('Questionnaire completed! Check console for responses.');
}

export function selectOption(question, option) {
    debugLog(`[QUESTIONNAIRE] Selecting option for question ${question.id}:`, option);
    if (question.type === 'single') {
        userResponses[question.id] = option.value;
    } else {
        userResponses[question.id] = userResponses[question.id] || [];
        const index = userResponses[question.id].indexOf(option.value);
        if (index > -1) {
            userResponses[question.id].splice(index, 1);
        } else {
            userResponses[question.id].push(option.value);
        }
    }
    
    updateOptionStyles(question, userResponses);
    debugLog('[QUESTIONNAIRE] Updated user responses:', userResponses);
}

export function showQuestion(index) {
    debugLog(`[QUESTIONNAIRE] Attempting to show question at index: ${index}`);
    const questionCard = document.getElementById('question-card');
    const questionnaireContainer = document.getElementById('questionnaire-container');
    
    if (!questionCard || !questionnaireContainer) {
        console.error('[QUESTIONNAIRE] Required elements not found:', {
            questionCard: !!questionCard,
            questionnaireContainer: !!questionnaireContainer
        });
        return;
    }

    const currentQuestion = getCurrentQuestion(index);
    if (!currentQuestion) {
        console.error('[QUESTIONNAIRE] No question found for index:', index);
        return;
    }

    debugLog('[QUESTIONNAIRE] Current question:', currentQuestion);
    debugLog('[QUESTIONNAIRE] Container display:', getComputedStyle(questionnaireContainer).display);
    debugLog('[QUESTIONNAIRE] Card display:', getComputedStyle(questionCard).display);
    
    // Fade out
    questionCard.style.opacity = '0';
    
    setTimeout(() => {
        try {
            const questionText = document.getElementById('question-text');
            const optionsContainer = document.getElementById('options-container');
            
            if (!questionText || !optionsContainer) {
                throw new Error('[QUESTIONNAIRE] Required question elements not found');
            }
            
            questionText.textContent = currentQuestion.text;
            optionsContainer.innerHTML = '';
            
            currentQuestion.options.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option.text;
                button.classList.add(
                    'w-full', 'text-left', 'bg-white', 'bg-opacity-20',
                    'hover:bg-opacity-30', 'text-white', 'p-4', 'rounded-lg',
                    'transition-all', 'duration-300', 'ease-in-out'
                );
                
                // Add selected state if option is already chosen
                const responses = userResponses[currentQuestion.id] || [];
                if (currentQuestion.type === 'single' && responses === option.value) {
                    button.classList.add('bg-teal-500');
                } else if (currentQuestion.type === 'multi' && responses.includes(option.value)) {
                    button.classList.add('bg-teal-500');
                }
                
                button.addEventListener('click', () => selectOption(currentQuestion, option));
                optionsContainer.appendChild(button);
            });
            
            // Update navigation buttons
            const prevButton = document.getElementById('prev-question');
            const nextButton = document.getElementById('next-question');
            
            if (prevButton) {
                prevButton.classList.toggle('hidden', index === 0);
            }
            
            if (nextButton) {
                nextButton.textContent = index === getQuestionCount() - 1 ? 'Finish' : 'Next';
            }
            
            // Fade in
            questionCard.style.opacity = '1';
            debugLog('[QUESTIONNAIRE] Question displayed successfully');
            
            // Check visibility after a short delay
            setTimeout(() => {
                debugLog('[QUESTIONNAIRE] Checking final visibility');
                checkQuestionnaireVisibility();
            }, 100);
            
        } catch (error) {
            console.error('[QUESTIONNAIRE] Error displaying question:', error);
        }
    }, 300);
}
