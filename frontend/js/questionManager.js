import { debugLog, checkQuestionnaireVisibility, updateOptionStyles, queryIncentives } from './utils.js';
import { questions, conditionalQuestions } from './questions.js';
import { updateSidebar } from './sidebar.js';

// State management
let currentQuestionIndex = 0;
export const userResponses = {};
// Cache for the question sequence
let questionSequence = null;

// Build the complete sequence of questions based on user responses
function buildQuestionSequence() {
    debugLog('[QUESTIONNAIRE] Building question sequence based on user responses');
    
    // Start with base questions
    const sequence = [...questions];
    
    // Find the position to insert conditional questions (after Q3)
    const insertPosition = sequence.findIndex(q => q.id === 'Q3') + 1;
    
    // Track how many conditional questions we've inserted
    let insertedCount = 0;
    
    // Check each conditional question and insert if conditions are met
    Object.values(conditionalQuestions).forEach(condQ => {
        if (condQ.showIf(userResponses)) {
            debugLog(`[QUESTIONNAIRE] Including conditional question ${condQ.id} in sequence`);
            sequence.splice(insertPosition + insertedCount, 0, condQ);
            insertedCount++;
        }
    });
    
    debugLog(`[QUESTIONNAIRE] Final sequence has ${sequence.length} questions`);
    return sequence;
}

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
    
    // Rebuild question sequence if it's not cached or on first call
    if (!questionSequence) {
        questionSequence = buildQuestionSequence();
    }
    
    if (index < 0 || index >= questionSequence.length) {
        debugLog(`[QUESTIONNAIRE] Index ${index} out of bounds for question sequence`);
        return null;
    }
    
    const question = questionSequence[index];
    debugLog(`[QUESTIONNAIRE] Returning question: ${question.id} for index ${index}`);
    return question;
}

export function getQuestionCount() {
    // Rebuild question sequence if it's not cached
    if (!questionSequence) {
        questionSequence = buildQuestionSequence();
    }
    
    const count = questionSequence.length;
    debugLog('[QUESTIONNAIRE] Total question count:', count);
    return count;
}

export function showNextQuestion() {
    debugLog('[QUESTIONNAIRE] Next button clicked. Current index:', currentQuestionIndex);
    
    // Get current question
    const currentQuestion = getCurrentQuestion(currentQuestionIndex);
    if (!currentQuestion) return;
    
    // Check if question has been answered
    const response = userResponses[currentQuestion.id];
    const isAnswered = currentQuestion.type === 'single' ? 
        response !== undefined : 
        Array.isArray(response) && (
            response.length > 0 || 
            (currentQuestion.id === 'Q3' && response.includes('none'))
        );
    
    if (!isAnswered) {
        alert('Please select an option before proceeding.');
        return;
    }
    
    if (currentQuestionIndex < getQuestionCount() - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    } else {
        finishQuestionnaire();
    }
}

export function showPreviousQuestion() {
    debugLog('[QUESTIONNAIRE] Previous button clicked. Current index:', currentQuestionIndex);
    const currentQuestion = getCurrentQuestion(currentQuestionIndex);
    
    if (currentQuestion && currentQuestion.id === 'Q2') {
        // Fade out the questionnaire container
        const questionnaireContainer = document.getElementById('questionnaire-container');
        const resultsSummary = document.getElementById('results-summary');
        
        if (questionnaireContainer) {
            questionnaireContainer.style.transition = 'opacity 0.3s ease-in-out';
            questionnaireContainer.style.opacity = '0';
        }
        if (resultsSummary) {
            resultsSummary.style.transition = 'opacity 0.3s ease-in-out';
            resultsSummary.style.opacity = '0';
        }
        
        // Reload after animation completes
        setTimeout(() => {
            window.location.reload();
        }, 300);
    } else if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    }
}

export function finishQuestionnaire() {
    debugLog('[QUESTIONNAIRE] Completed. User responses:', userResponses);
    showSummaryPage();
}

function showSummaryPage() {
    // Hide questionnaire
    const questionnaireContainer = document.getElementById('questionnaire-container');
    questionnaireContainer.style.display = 'none';

    // Show summary page
    const summaryContainer = document.getElementById('summary-container');
    summaryContainer.style.display = 'flex';

    // Populate summary content
    populateSummaryContent();

    // Trigger confetti effect
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    } else {
        console.error('Confetti function not found');
    }
}

function populateSummaryContent() {
    const summaryContent = document.getElementById('summary-content');
    const programList = document.getElementById('program-list');

    // Clear existing content
    summaryContent.innerHTML = '';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Eligible Programs Summary';
    title.className = 'text-2xl font-bold text-white mb-4';
    summaryContent.appendChild(title);

    // Add program list
    const programs = Array.from(programList.children);
    if (programs.length > 0) {
        const ul = document.createElement('ul');
        ul.className = 'space-y-2';
        programs.forEach(program => {
            const li = document.createElement('li');
            li.textContent = program.textContent;
            li.className = 'text-white';
            ul.appendChild(li);
        });
        summaryContent.appendChild(ul);
    } else {
        const noPrograms = document.createElement('p');
        noPrograms.textContent = 'No eligible programs found.';
        noPrograms.className = 'text-white';
        summaryContent.appendChild(noPrograms);
    }

    // Add a button to view detailed sidebar
    const viewDetailsButton = document.createElement('button');
    viewDetailsButton.textContent = 'View Detailed Programs';
    viewDetailsButton.className = 'mt-4 bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded';
    viewDetailsButton.onclick = () => {
        const sidebar = document.getElementById('program-sidebar');
        sidebar.style.width = '300px';
    };
    summaryContent.appendChild(viewDetailsButton);
}

// Function to animate number change with slot machine effect
export function animateNumberChange(element, newValue, prefix = '') {
    // Create temporary elements for animation
    const oldValue = element.textContent;
    const oldEl = element.cloneNode(true);
    const newEl = element.cloneNode(true);
    newEl.textContent = prefix + newValue;
    
    // Set up animation classes
    oldEl.classList.add('slot-machine-out');
    newEl.classList.add('slot-machine-in');
    newEl.style.position = 'absolute';
    newEl.style.top = '0';
    newEl.style.left = '0';
    newEl.style.width = '100%';
    
    // Clear and set up container
    const container = element.parentElement;
    container.style.position = 'relative';
    container.innerHTML = '';
    container.appendChild(oldEl);
    container.appendChild(newEl);
    
    // Remove elements after animation
    setTimeout(() => {
        element.textContent = prefix + newValue;
        container.innerHTML = '';
        container.appendChild(element);
    }, 300);
}

// Function to update results display
function updateResultsDisplay(data) {
    debugLog('[QUESTIONNAIRE] Updating results display:', data);
    const resultsDiv = document.getElementById('results-summary');
    const opportunitiesCount = document.getElementById('opportunities-count');
    const totalPotential = document.getElementById('total-potential');

    if (data && resultsDiv && opportunitiesCount && totalPotential) {
        resultsDiv.classList.remove('hidden');

        // Animate the number changes
        animateNumberChange(opportunitiesCount, data.opportunities_count);
        animateNumberChange(totalPotential, data.total_potential.toLocaleString(), '$');
    } else {
        if (resultsDiv) resultsDiv.classList.add('hidden');
    }
}

export async function selectOption(question, option) {
    debugLog('[QUESTIONNAIRE] Selecting option:', {
        questionId: question.id,
        optionValue: option.value,
        optionText: option.text,
        questionType: question.type
    });
    
    if (question.type === 'single') {
        userResponses[question.id] = option.value;
        debugLog('[QUESTIONNAIRE] Set single response:', {
            questionId: question.id,
            value: option.value
        });
    } else {
        // Special handling for Q3 and Q10 "All options" behavior
        if (question.id === 'Q3' || question.id === 'Q10') {
            if (!userResponses[question.id]) {
                userResponses[question.id] = [];
            }

            const isQ3 = question.id === 'Q3';
            const allValue = isQ3 ? 'all' : 'h'; // 'h' is "all types" for Q10
            const noneValue = isQ3 ? 'none' : null;

            if (option.value === allValue) {
                // For "All options", select all options except special ones
                const wasSelected = userResponses[question.id].includes(allValue);
                if (wasSelected) {
                    userResponses[question.id] = [];
                } else {
                    // Add all option values including 'all', but excluding 'none'
                    userResponses[question.id] = [allValue, ...question.options
                        .map(opt => opt.value)
                        .filter(val => val !== noneValue && val !== allValue)];
                    // Update all option buttons except 'none'
                    const optionsContainer = document.getElementById('options-container');
                    optionsContainer.querySelectorAll('button').forEach(button => {
                        if (button.dataset.value !== noneValue) {
                            button.classList.add('bg-teal-500');
                            button.classList.remove('bg-white');
                        }
                    });
                }
                debugLog(`[QUESTIONNAIRE] Toggled All options for ${question.id}`, userResponses[question.id]);
            } else if (isQ3 && option.value === noneValue) {
                // For Q3 "None", clear all selections and add 'none'
                userResponses[question.id] = ['none'];
                debugLog('[QUESTIONNAIRE] Selected None - clearing all selections');
                updateOptionStyles(question, userResponses);
            } else {
                // Regular option clicked
                if (userResponses[question.id].includes(allValue)) {
                    // If "All options" was selected, clear all and just select this option
                    userResponses[question.id] = [option.value];
                    debugLog(`[QUESTIONNAIRE] Cleared All options and selected single option for ${question.id}:`, option.value);
                    updateOptionStyles(question, userResponses);
                } else {
                    // Normal multi-select behavior
                    const index = userResponses[question.id].indexOf(option.value);
                    
                    // Remove special values if they were selected
                    userResponses[question.id] = userResponses[question.id]
                        .filter(val => val !== allValue && (!noneValue || val !== noneValue));
                    
                    if (index > -1) {
                        userResponses[question.id].splice(index, 1);
                        debugLog(`[QUESTIONNAIRE] Removed multi response for ${question.id}:`, {
                            value: option.value,
                            remainingValues: userResponses[question.id]
                        });
                    } else {
                        userResponses[question.id].push(option.value);
                        debugLog(`[QUESTIONNAIRE] Added multi response for ${question.id}:`, {
                            value: option.value,
                            allValues: userResponses[question.id]
                        });
                    }
                }
            }
        } else {
            // Normal multi-select behavior for other questions
            if (!userResponses[question.id]) {
                userResponses[question.id] = [];
            }
            
            const index = userResponses[question.id].indexOf(option.value);
            if (index > -1) {
                userResponses[question.id].splice(index, 1);
                debugLog('[QUESTIONNAIRE] Removed multi response:', {
                    questionId: question.id,
                    value: option.value,
                    remainingValues: userResponses[question.id]
                });
            } else {
                userResponses[question.id].push(option.value);
                debugLog('[QUESTIONNAIRE] Added multi response:', {
                    questionId: question.id,
                    value: option.value,
                    allValues: userResponses[question.id]
                });
            }
        }
    }
    
    updateOptionStyles(question, userResponses);
    
    // Important: Reset the question sequence whenever responses change
    // as this might affect which conditional questions should be shown
    questionSequence = null;
    
    // Query incentives with updated responses
    const zipcode = document.getElementById('zipcode').value;
    if (zipcode) {
        // Create a copy of responses for querying
        const queryData = {
            ...userResponses,
            zipcode: zipcode
        };

        // Special handling for Q3 query data
        if (question.id === 'Q3') {
            const allValue = 'all';
            const noneValue = 'none';

            if (queryData[question.id]?.length === question.options.length - 2) {
                // If all options except 'all' and 'none' are selected, treat it as "All options"
                delete queryData[question.id];
            } else if (queryData[question.id]?.includes(noneValue)) {
                // Send empty array for "None"
                queryData[question.id] = [];
            } else if (queryData[question.id]) {
                // Remove special values from responses if present
                queryData[question.id] = queryData[question.id]
                    .filter(val => val !== allValue && val !== noneValue);
            }
        } else if (question.id === 'Q10') {
            // Special handling for Q10
            if (queryData[question.id]) {
                // Ensure 'h' is included if present, along with all other options
                if (queryData[question.id].includes('h')) {
                    queryData[question.id] = ['h', 'a', 'b', 'c', 'd', 'e', 'f', 'g'];
                }
                // If 'h' is not selected, keep only the selected options (no filtering needed)
            }
        }

        const results = await queryIncentives(queryData);
        if (results) {
            updateResultsDisplay(results);
            updateSidebar(results, userResponses);
        }
    }
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

    debugLog('[QUESTIONNAIRE] Current question:', {
        id: currentQuestion.id,
        text: currentQuestion.text,
        type: currentQuestion.type,
        optionsCount: currentQuestion.options.length
    });
    
    // Prepare content while card is invisible
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const prevButton = document.getElementById('prev-question');
    const nextButton = document.getElementById('next-question');
    
    if (!questionText || !optionsContainer || !prevButton || !nextButton) {
        throw new Error('[QUESTIONNAIRE] Required question elements not found');
    }
    
    // Hide all elements first
    questionCard.style.opacity = '0';
    questionText.style.opacity = '0';
    optionsContainer.style.opacity = '0';
    const buttonContainer = document.getElementById('button-container');
    if (buttonContainer) {
        buttonContainer.style.opacity = '0';
    }
    
    // Prepare content
    questionText.textContent = currentQuestion.text;
    optionsContainer.innerHTML = '';
            
    try {
        // Configure layout based on question type
        if (currentQuestion.id === 'Q3' || currentQuestion.id === 'Q10' || currentQuestion.id === 'Q13') {
            // Wide layout with small options for Q3, Q10, and Q13
            questionCard.classList.add('max-w-7xl');
            questionCard.classList.remove('max-w-xl');
            const gridClass = 
                currentQuestion.id === 'Q3' ? 'q3-options-grid' :
                currentQuestion.id === 'Q10' ? 'q10-options-grid' : 'q13-options-grid';
            optionsContainer.classList.add(gridClass);
            optionsContainer.classList.remove('space-y-3');
        } else {
            // Narrow layout with larger options for other questions
            questionCard.classList.add('max-w-xl');
            questionCard.classList.remove('max-w-7xl');
            optionsContainer.classList.add('space-y-3', 'px-2');
            optionsContainer.classList.remove('q3-options-grid');
        }
        
        // Add specific question classes for Q2 and Q10
        questionCard.classList.remove('q2-card', 'q10-card');
        if (currentQuestion.id === 'Q2') {
            questionCard.classList.add('q2-card');
        } else if (currentQuestion.id === 'Q10') {
            questionCard.classList.add('q10-card');
        }
        
        currentQuestion.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.dataset.value = option.value;
            
            // Add base classes
            const baseClasses = [
                'text-left',
                'transition-all',
                'duration-300',
                'ease-in-out',
                'mt-4'  // Added explicit margin-top
            ];
            
            if (currentQuestion.id === 'Q3' || currentQuestion.id === 'Q10' || currentQuestion.id === 'Q13') {
                baseClasses.push(
                    currentQuestion.id === 'Q3' ? 'q3-option-button' :
                    currentQuestion.id === 'Q10' ? 'q10-option-button' : 'q13-option-button',
                    'text-sm',
                    'font-medium',
                    'break-words',
                    'bg-white',
                    'bg-opacity-20',
                    'text-white'
                );
            } else {
                baseClasses.push(
                    'px-4',
                    'py-3',
                    'text-base',
                    'min-h-[3rem]',
                    'w-full',
                    'flex',
                    'items-center',
                    'bg-white',
                    'bg-opacity-20',
                    'hover:bg-opacity-30',
                    'text-white',
                    'rounded-lg'
                );
            }
            
            button.classList.add(...baseClasses);
            
            // Add selected state if option is already chosen
            const responses = userResponses[currentQuestion.id] || [];
            if (currentQuestion.type === 'single' && responses === option.value) {
                button.classList.add('bg-teal-500');
                button.classList.remove('bg-white');
            } else if (currentQuestion.type === 'multi') {
                if (currentQuestion.id === 'Q3' || currentQuestion.id === 'Q10') {
                    const isQ3 = currentQuestion.id === 'Q3';
                    const allValue = isQ3 ? 'all' : 'h';
                    const noneValue = isQ3 ? 'none' : null;

                    if (option.value === allValue) {
                        // "All options" is selected if marker is in responses
                        if (responses.includes(allValue)) {
                            button.classList.add('bg-teal-500');
                            button.classList.remove('bg-white');
                        }
                    } else if (isQ3 && option.value === noneValue) {
                        // "None" is selected if marker is in responses (Q3 only)
                        if (responses.includes(noneValue)) {
                            button.classList.add('bg-teal-500');
                            button.classList.remove('bg-white');
                        }
                    } else if (responses.includes(allValue)) {
                        // All regular options are selected when "All options" is selected
                        button.classList.add('bg-teal-500');
                        button.classList.remove('bg-white');
                    } else if (responses.includes(option.value)) {
                        // Show option as selected if it's in responses
                        button.classList.add('bg-teal-500');
                        button.classList.remove('bg-white');
                    }
                } else if (responses.includes(option.value)) {
                    button.classList.add('bg-teal-500');
                    button.classList.remove('bg-white');
                }
            }
            
            button.addEventListener('click', () => selectOption(currentQuestion, option));
            optionsContainer.appendChild(button);
        });
        
        // Update navigation buttons
        prevButton.classList.toggle('hidden', index === 0 && currentQuestion.id !== 'Q2');
        nextButton.textContent = index === getQuestionCount() - 1 ? 'Finish' : 'Next';
        
        // Fade everything in together
        setTimeout(() => {
            questionCard.style.transition = 'opacity 0.3s ease-in-out';
            questionText.style.transition = 'opacity 0.3s ease-in-out';
            optionsContainer.style.transition = 'opacity 0.3s ease-in-out';
            
            questionCard.style.opacity = '1';
            questionText.style.opacity = '1';
            optionsContainer.style.opacity = '1';
            if (buttonContainer) {
                buttonContainer.style.opacity = '1';
            }
            
            debugLog('[QUESTIONNAIRE] Question displayed successfully');
            
            // Check visibility after elements are visible
            setTimeout(() => {
                debugLog('[QUESTIONNAIRE] Checking final visibility');
                checkQuestionnaireVisibility();
            }, 300);
        }, 300);
    } catch (error) {
        console.error('[QUESTIONNAIRE] Error displaying question:', error);
    }
}