import { debugLog } from './utils.js';
import { showQuestion, setupQuestionnaireNavigation } from './questionManager.js';

export function initializeZipSearch() {
    const zipInput = document.getElementById('zipcode');
    const searchButton = document.querySelector('button');
    
    if (!zipInput || !searchButton) {
        console.error('[QUESTIONNAIRE] Required input elements not found');
        return;
    }
    
    debugLog('[QUESTIONNAIRE] Input elements found, setting up event listeners');
    
    // Only allow numbers in zip code input
    zipInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // Handle button click
    searchButton.addEventListener('click', () => handleSearch(zipInput, searchButton));

    // Handle enter key
    zipInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch(zipInput, searchButton);
        }
    });

    debugLog('[QUESTIONNAIRE] Event listeners set up successfully');
}

function handleSearch(zipInput, searchButton) {
    debugLog('[QUESTIONNAIRE] Starting zip code submission process');
    const zip = zipInput.value.trim();
    if (zip.length !== 5) {
        debugLog('[QUESTIONNAIRE] Invalid zip code length');
        zipInput.classList.add('border-red-500', 'shake');
        setTimeout(() => {
            zipInput.classList.remove('shake');
        }, 500);
        return;
    }
    
    debugLog('[QUESTIONNAIRE] Valid zip code entered:', zip);
    
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

    debugLog('[QUESTIONNAIRE] Making API call to Cloud Function');
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
        debugLog('[QUESTIONNAIRE] API response received');
        return response.json();
    })
    .then(data => {
        debugLog('[QUESTIONNAIRE] Map data received, loading image');
        handleMapImageLoad(data.mapImage);
    })
    .catch(error => {
        console.error('[QUESTIONNAIRE] Error:', error);
        debugLog('[QUESTIONNAIRE] Error occurred:', error.message);
        alert('Failed to load map. Please try again.');
    })
    .finally(() => {
        // Reset button state
        searchButton.disabled = false;
        searchButton.textContent = 'Search';
        debugLog('[QUESTIONNAIRE] Search button reset');
    });
}

function handleMapImageLoad(imageUrl) {
    debugLog('[QUESTIONNAIRE] Starting map image load process');
    // Create a temporary image to preload
    const tempImage = new Image();
    tempImage.onload = () => {
        debugLog('[QUESTIONNAIRE] Map image loaded successfully');
        // Once image is loaded, apply it as background with a fade effect
        const style = document.createElement('style');
        style.textContent = `
            body::before {
                background-image: url(${imageUrl});
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
            debugLog('[QUESTIONNAIRE] Map overlay created');
            requestAnimationFrame(() => overlay.style.opacity = '1');
        }

        // Fade out the initial card
        debugLog('[QUESTIONNAIRE] Starting transition to questionnaire');
        const initialCard = document.getElementById('initial-card');
        if (initialCard) {
            initialCard.style.transition = 'opacity 0.3s ease-in-out';
            initialCard.style.opacity = '0';
            
            setTimeout(() => {
                initialCard.style.display = 'none';
                debugLog('[QUESTIONNAIRE] Initial card hidden');
                
                // Show the questionnaire after map is loaded
                const questionnaireContainer = document.getElementById('questionnaire-container');
                if (!questionnaireContainer) {
                    console.error('[QUESTIONNAIRE] Container not found');
                    return;
                }
                
                debugLog('[QUESTIONNAIRE] Preparing questionnaire container');
                questionnaireContainer.classList.remove('hidden');
                questionnaireContainer.style.display = 'flex';
                questionnaireContainer.style.opacity = '0';
                
                // Ensure the question card starts transparent
                const questionCard = document.getElementById('question-card');
                if (questionCard) {
                    questionCard.style.opacity = '0';
                }
                
                // Small delay before fading in the questionnaire
                setTimeout(() => {
                    debugLog('[QUESTIONNAIRE] Fading in questionnaire container');
                    questionnaireContainer.style.transition = 'opacity 0.3s ease-in-out';
                    questionnaireContainer.style.opacity = '1';
                    
                    // Additional delay before showing first question
                    setTimeout(() => {
                        debugLog('[QUESTIONNAIRE] Setting up questionnaire navigation');
                        setupQuestionnaireNavigation();
                        
                        if (questionCard) {
                            debugLog('[QUESTIONNAIRE] Fading in question card');
                            questionCard.style.transition = 'opacity 0.3s ease-in-out';
                            questionCard.style.opacity = '1';
                        }
                        
                        debugLog('[QUESTIONNAIRE] Showing first question');
                        showQuestion(0);
                    }, 200);
                }, 100);
            }, 300);
        } else {
            console.error('[QUESTIONNAIRE] Initial card not found');
        }
    };
    tempImage.src = imageUrl;
}
