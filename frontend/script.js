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

        // TODO: Add API call here
        // For now, just simulate a delay
        setTimeout(() => {
            searchButton.disabled = false;
            searchButton.textContent = 'Search';
        }, 1000);
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
