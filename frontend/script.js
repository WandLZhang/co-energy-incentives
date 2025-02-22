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
                document.body.style.transition = 'background-image 0.5s ease-in-out';
                document.body.style.backgroundImage = `url(${data.mapImage})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundAttachment = 'fixed';
                
                // Add or update the overlay
                let overlay = document.getElementById('map-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'map-overlay';
                    overlay.className = 'fixed inset-0 bg-white bg-opacity-80 -z-10 transition-opacity duration-500';
                    document.body.appendChild(overlay);
                    // Small delay to ensure smooth fade in
                    requestAnimationFrame(() => overlay.style.opacity = '1');
                }
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
});
