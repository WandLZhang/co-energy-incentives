import { debugLog, queryIncentives } from './utils.js';
import { showQuestion, setupQuestionnaireNavigation, userResponses } from './questionManager.js';

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

    debugLog('[QUESTIONNAIRE] Making API calls');
    
    // Query incentives with zipcode
    const queryData = {
        ...userResponses,
        zipcode: zip
    };
    
    // Make both API calls in parallel
    Promise.all([
        // Map image API call
        fetch('https://us-central1-gemini-med-lit-review.cloudfunctions.net/getMapImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ zipcode: zip })
        }).then(response => {
            if (!response.ok) throw new Error('Map API response was not ok');
            return response.json();
        }),
        // Incentives API call
        queryIncentives(queryData)
    ])
    .then(([mapData, incentivesData]) => {
        debugLog('[QUESTIONNAIRE] Both API calls successful', { mapData, incentivesData });
        handleMapImageLoad(mapData.mapImage, incentivesData);
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

async function handleMapImageLoad(imageUrl, incentivesData) {
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
                
                debugLog('[QUESTIONNAIRE] Preparing all elements before display');
                
                // Keep questionnaire container hidden while preparing
                questionnaireContainer.classList.remove('hidden');
                questionnaireContainer.style.display = 'flex';
                questionnaireContainer.style.opacity = '0';
                
                // Prepare question card
                const questionCard = document.getElementById('question-card');
                if (questionCard) {
                    questionCard.style.opacity = '0';
                }
                
                // Prepare results summary
                const resultsDiv = document.getElementById('results-summary');
                const opportunitiesCount = document.getElementById('opportunities-count');
                const totalPotential = document.getElementById('total-potential');
                
                if (incentivesData && resultsDiv && opportunitiesCount && totalPotential) {
                    // Set initial values
                    opportunitiesCount.textContent = '0';
                    totalPotential.textContent = '$0';
                    resultsDiv.classList.remove('hidden');
                    resultsDiv.style.opacity = '0';
                }
                
                // Setup navigation before animation
                debugLog('[QUESTIONNAIRE] Setting up questionnaire navigation');
                setupQuestionnaireNavigation();
                
                // Prepare first question
                showQuestion(0);
                
                // Synchronize all animations
                setTimeout(() => {
                    debugLog('[QUESTIONNAIRE] Fading in all elements together');
                    
                    // Set transitions
                    questionnaireContainer.style.transition = 'opacity 0.5s ease-in-out';
                    if (questionCard) {
                        questionCard.style.transition = 'opacity 0.5s ease-in-out';
                    }
                    if (resultsDiv) {
                        resultsDiv.style.transition = 'opacity 0.5s ease-in-out';
                    }
                    
                    // Fade in all elements
                    questionnaireContainer.style.opacity = '1';
                    if (questionCard) {
                        questionCard.style.opacity = '1';
                    }
                    if (resultsDiv) {
                        resultsDiv.style.opacity = '1';
                    }
                    
                    // Animate numbers after elements are visible
                    setTimeout(async () => {
                        if (incentivesData && opportunitiesCount && totalPotential) {
                            const { animateNumberChange } = await import('./questionManager.js');
                            animateNumberChange(opportunitiesCount, incentivesData.opportunities_count);
                            animateNumberChange(totalPotential, incentivesData.total_potential.toLocaleString(), '$');
                        }
                    }, 500);
                }, 100);
            }, 300);
        } else {
            console.error('[QUESTIONNAIRE] Initial card not found');
        }
    };
    tempImage.src = imageUrl;
}
