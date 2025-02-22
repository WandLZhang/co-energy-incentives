// Questions array
const questions = [
    {
        id: 'Q2',
        text: 'Do you own or rent your home?',
        type: 'single',
        options: [
            { value: 'a', text: 'I own my home' },
            { value: 'b', text: 'I rent my home' },
            { value: 'c', text: 'Other (e.g., landlord, property manager)' },
            { value: 'd', text: 'Not applicable (e.g., interested in EV incentives only)' }
        ]
    },
    {
        id: 'Q3',
        text: 'Which of the following energy upgrades are you interested in? (Select all that apply)',
        type: 'multi',
        options: [
            { value: 'a', text: 'Attic, roof, or ceiling insulation' },
            { value: 'b', text: 'Wall insulation' },
            { value: 'c', text: 'Floor, basement, or crawlspace insulation' },
            { value: 'd', text: 'Rim/Band Joist Insulation' },
            { value: 'e', text: 'Air sealing (around windows, doors, etc.)' },
            { value: 'f', text: 'Duct sealing' },
            { value: 'g', text: 'Window replacement' },
            { value: 'h', text: 'Door replacement' },
            { value: 'i', text: 'Heat pump water heater' },
            { value: 'j', text: 'Non-heat pump (electric resistance) water heater' },
            { value: 'k', text: 'Ducted air source heat pump (central system)' },
            { value: 'l', text: 'Ductless air source heat pump (mini-split)' },
            { value: 'm', text: 'Air-to-water heat pump' },
            { value: 'n', text: 'Geothermal (ground source) heat pump' },
            { value: 'o', text: 'Electric stove or cooktop (induction)' },
            { value: 'p', text: 'Heat pump clothes dryer' },
            { value: 'q', text: 'Non-heat pump (electric resistance) clothes dryer' },
            { value: 'r', text: 'Smart thermostat' },
            { value: 's', text: 'Whole house fan' },
            { value: 't', text: 'Evaporative cooler (swamp cooler)' },
            { value: 'u', text: 'Electric vehicle charger (Level 2)' },
            { value: 'v', text: 'Electric vehicle charger (DC Fast Charger)' },
            { value: 'w', text: 'Electric vehicle (New)' },
            { value: 'x', text: 'Electric vehicle (Used)' },
            { value: 'y', text: 'E-bike or E-cargo bike' },
            { value: 'z', text: 'Electric outdoor equipment' },
            { value: 'aa', text: 'Battery storage installation' },
            { value: 'bb', text: 'Electric thermal storage (ETS) units or slab heating' },
            { value: 'cc', text: 'Energy Audit' },
            { value: 'dd', text: 'Electric panel upgrade' },
            { value: 'ee', text: 'Electric wiring upgrade' },
            { value: 'ff', text: 'Other electric service upgrades' },
            { value: 'gg', text: 'Adaptive e-bike' },
            { value: 'hh', text: 'Other weatherization (insulated shades etc.)' },
            { value: 'ii', text: 'Other' }
        ]
    },
    {
        id: 'Q4',
        text: 'Are you interested in rebates offered as point-of-sale discounts (instant rebates at the time of purchase)?',
        type: 'single',
        options: [
            { value: 'a', text: 'Yes' },
            { value: 'b', text: 'No' },
            { value: 'c', text: 'Maybe' }
        ]
    },
    {
        id: 'Q5',
        text: 'Are you interested in rebates you apply for after purchase (mail-in or online rebates)?',
        type: 'single',
        options: [
            { value: 'a', text: 'Yes' },
            { value: 'b', text: 'No' },
            { value: 'c', text: 'Maybe' }
        ]
    },
    {
        id: 'Q6',
        text: 'Are you interested in incentives applied as credits to your utility bill?',
        type: 'single',
        options: [
            { value: 'a', text: 'Yes' },
            { value: 'b', text: 'No' },
            { value: 'c', text: 'Maybe' }
        ]
    },
    {
        id: 'Q7',
        text: 'Are you comfortable with receiving incentives as tax credits on your state income taxes?',
        type: 'single',
        options: [
            { value: 'a', text: 'Yes' },
            { value: 'b', text: 'No' },
            { value: 'c', text: 'Maybe' }
        ]
    },
    {
        id: 'Q8',
        text: 'Are you interested in programs that offer free or heavily subsidized energy upgrades for income-qualified households?',
        type: 'single',
        options: [
            { value: 'a', text: 'Yes' },
            { value: 'b', text: 'No' },
            { value: 'c', text: 'Maybe' }
        ]
    },
    {
        id: 'Q9',
        text: 'Do you consider your household income to be low-to-moderate income for your area?',
        type: 'single',
        options: [
            { value: 'a', text: 'Yes' },
            { value: 'b', text: 'No' },
            { value: 'c', text: 'Unsure' }
        ]
    }
];

// Conditional questions
const conditionalQuestions = {
    heat_pump: {
        id: 'Q10',
        text: 'What type of heat pump are you primarily interested in?',
        type: 'multi',
        options: [
            { value: 'a', text: 'Ducted (central system)' },
            { value: 'b', text: 'Ductless (mini-split)' },
            { value: 'c', text: 'Air-to-water heat pump' },
            { value: 'd', text: 'Geothermal (ground source) heat pump' },
            { value: 'e', text: 'Heat pump water heater' },
            { value: 'f', text: 'Heat pump clothes dryer' },
            { value: 'g', text: 'Other heat pump type' },
            { value: 'h', text: "I'm interested in all types of heat pumps" }
        ],
        showIf: (responses) => {
            const upgrades = responses.Q3 || [];
            return upgrades.some(upgrade => ['k', 'l', 'm', 'n', 'i', 'p'].includes(upgrade));
        }
    },
    ev_charger: {
        id: 'Q11',
        text: 'What type of EV charger are you considering?',
        type: 'single',
        options: [
            { value: 'a', text: 'Level 2 Charger (240V)' },
            { value: 'b', text: 'DC Fast Charger' },
            { value: 'c', text: 'Vehicle-to-Building (V2B) Charger' },
            { value: 'd', text: 'Unsure' }
        ],
        showIf: (responses) => {
            const upgrades = responses.Q3 || [];
            return upgrades.some(upgrade => ['u', 'v'].includes(upgrade));
        }
    },
    ebike: {
        id: 'Q12',
        text: 'What type of e-bike are you considering?',
        type: 'single',
        options: [
            { value: 'a', text: 'Standard E-bike' },
            { value: 'b', text: 'E-cargo bike' },
            { value: 'c', text: 'Adaptive E-bike' },
            { value: 'd', text: 'Electric Motorcycle/Moped/UTV' },
            { value: 'e', text: 'Unsure' }
        ],
        showIf: (responses) => {
            const upgrades = responses.Q3 || [];
            return upgrades.some(upgrade => ['y', 'gg'].includes(upgrade));
        }
    },
    outdoor_equipment: {
        id: 'Q13',
        text: 'What type of electric outdoor equipment are you interested in? (Select all that apply)',
        type: 'multi',
        options: [
            { value: 'a', text: 'Riding Lawn Mower' },
            { value: 'b', text: 'Walk-behind Lawn Mower' },
            { value: 'c', text: 'Single-stage Snow Blower' },
            { value: 'd', text: 'Two-stage Snow Blower' },
            { value: 'e', text: 'Chainsaw' },
            { value: 'f', text: 'Leaf Blower' },
            { value: 'g', text: 'Trimmer/Pruner' },
            { value: 'h', text: 'Power Washer' },
            { value: 'i', text: 'Additional Batteries for equipment' },
            { value: 'j', text: 'Other electric outdoor equipment' }
        ],
        showIf: (responses) => {
            const upgrades = responses.Q3 || [];
            return upgrades.includes('z');
        }
    }
};

// State management
let currentQuestionIndex = 0;
const userResponses = {};

// Question management functions
function showQuestion(index) {
    console.log('Showing question for index:', index);
    const questionCard = document.getElementById('question-card');
    if (!questionCard) {
        console.error('Question card element not found');
        return;
    }

    const currentQuestion = getCurrentQuestion(index);
    if (!currentQuestion) {
        console.error('No question found for index:', index);
        return;
    }

    console.log('Current question:', currentQuestion);
    
    // Fade out
    questionCard.style.opacity = '0';
    
    setTimeout(() => {
        document.getElementById('question-text').textContent = currentQuestion.text;
        const optionsContainer = document.getElementById('options-container');
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
    }, 300);
}

function getCurrentQuestion(index) {
    const baseQuestion = questions[index];
    if (!baseQuestion) return null;
    
    // Check for conditional questions that should be inserted
    for (const [key, conditionalQ] of Object.entries(conditionalQuestions)) {
        if (conditionalQ.showIf(userResponses) && 
            index > questions.findIndex(q => q.id === 'Q3')) {
            return conditionalQ;
        }
    }
    
    return baseQuestion;
}

function getQuestionCount() {
    let count = questions.length;
    // Add conditional questions if they should be shown
    for (const [key, conditionalQ] of Object.entries(conditionalQuestions)) {
        if (conditionalQ.showIf(userResponses)) {
            count++;
        }
    }
    return count;
}

function selectOption(question, option) {
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
    
    updateOptionStyles(question);
}

function updateOptionStyles(question) {
    const buttons = document.querySelectorAll('#options-container button');
    buttons.forEach((button, index) => {
        const option = question.options[index];
        const responses = userResponses[question.id] || [];
        const isSelected = question.type === 'single' 
            ? responses === option.value
            : responses.includes(option.value);
        button.classList.toggle('bg-teal-500', isSelected);
    });
}

function showNextQuestion() {
    console.log('Next button clicked. Current index:', currentQuestionIndex);
    console.log('Total questions:', getQuestionCount());
    if (currentQuestionIndex < getQuestionCount() - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    } else {
        finishQuestionnaire();
    }
}

function showPreviousQuestion() {
    console.log('Previous button clicked. Current index:', currentQuestionIndex);
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    }
}

function finishQuestionnaire() {
    console.log('User responses:', userResponses);
    // We'll implement the Firebase integration later
    alert('Questionnaire completed! Check console for responses.');
}

function setupQuestionnaireNavigation() {
    console.log('Setting up questionnaire navigation');
    const nextButton = document.getElementById('next-question');
    const prevButton = document.getElementById('prev-question');
    
    if (nextButton && prevButton) {
        nextButton.addEventListener('click', showNextQuestion);
        prevButton.addEventListener('click', showPreviousQuestion);
        console.log('Navigation buttons set up successfully');
    } else {
        console.error('Navigation buttons not found during setup');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const zipInput = document.getElementById('zipcode');
    const searchButton = document.querySelector('button');

    // Only allow numbers in zip code input
    zipInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // Handle zip code submission
    const handleSearch = () => {
        const zip = zipInput.value.trim();
        if (zip.length !== 5) {
            zipInput.classList.add('border-red-500', 'shake');
            setTimeout(() => {
                zipInput.classList.remove('shake');
            }, 500);
            return;
        }
        
        // Remove error styling if present
        zipInput.classList.remove('border-red-500');
        
        // Add loading state
        searchButton.disabled = true;
        searchButton.innerHTML = `
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        `;

        // Make API call to Cloud Function
        fetch('https://us-central1-gemini-med-lit-review.cloudfunctions.net/getMapImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ zipcode: zip })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Create a temporary image to preload
            const tempImage = new Image();
            tempImage.onload = () => {
                // Once image is loaded, apply it as background with a fade effect
                // Set background image on the pseudo-element
                const style = document.createElement('style');
                style.textContent = `
                    body::before {
                        background-image: url(${data.mapImage});
                        transition: opacity 0.5s ease-in-out;
                        opacity: 1;
                    }
                `;
                document.head.appendChild(style);
                
                // Add or update the overlay
                let overlay = document.getElementById('map-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'map-overlay';
                    overlay.className = 'fixed inset-0 bg-white bg-opacity-80 z-10 transition-opacity duration-500';
                    document.body.appendChild(overlay);
                    // Small delay to ensure smooth fade in
                    requestAnimationFrame(() => overlay.style.opacity = '1');
                }

                // Fade out the initial card
                const initialCard = document.querySelector('.bg-white.bg-opacity-10');
                initialCard.style.transition = 'opacity 0.3s ease-in-out';
                initialCard.style.opacity = '0';
                
                setTimeout(() => {
                    initialCard.style.display = 'none';
                    // Show the questionnaire after map is loaded
                    const questionnaireContainer = document.getElementById('questionnaire-container');
                    questionnaireContainer.classList.remove('hidden');
                    questionnaireContainer.style.opacity = '0';
                    
                    // Small delay before fading in the questionnaire
                    setTimeout(() => {
                        questionnaireContainer.style.transition = 'opacity 0.3s ease-in-out';
                        questionnaireContainer.style.opacity = '1';
                        showQuestion(0);
                        setupQuestionnaireNavigation(); // Set up navigation after questionnaire is shown
                    }, 100);
                }, 300);
            };
            tempImage.src = data.mapImage;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load map. Please try again.');
        })
        .finally(() => {
            // Reset button state
            searchButton.disabled = false;
            searchButton.textContent = 'Search';
        });
    };

    // Handle button click
    searchButton.addEventListener('click', handleSearch);

    // Handle enter key
    zipInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Add shake animation style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
        }
        .shake {
            animation: shake 0.3s ease-in-out;
        }
    `;
    document.head.appendChild(style);

    // Add transition styles for questionnaire
    const transitionStyle = document.createElement('style');
    transitionStyle.textContent = `
        #question-card {
            transition: opacity 0.3s ease-in-out;
        }
        .option-button {
            transition: background-color 0.3s ease-in-out;
        }
    `;
    document.head.appendChild(transitionStyle);
});
