function populateSidebar(programs) {
    const programList = document.getElementById('program-list');
    if (!programList) return;
    
    programList.innerHTML = '';
    
    if (!programs || programs.length === 0) {
        const li = document.createElement('li');
        li.className = 'program-item text-white';
        li.innerHTML = '<p>No matching programs found</p>';
        programList.appendChild(li);
        return;
    }
    
    programs.forEach(program => {
        const li = document.createElement('li');
        li.className = 'program-item';
        li.innerHTML = `
            <h4 class="text-white font-semibold">${program.short_description_en}</h4>
            <p class="text-gray-300 text-sm">ID: ${program.id}</p>
        `;
        
        li.addEventListener('mouseover', () => showProgramDetails(program));
        li.addEventListener('mouseout', hideProgramDetails);
        programList.appendChild(li);
    });
}

export function initializeSidebar() {
    const sidebar = document.getElementById('program-sidebar');
    const toggleButton = document.getElementById('sidebar-toggle');
    
    if (sidebar && toggleButton) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
        });
    }
}

export function updateSidebar(results, userResponses) {
    if (!results || !results.programs) return;
    populateSidebar(results.programs);
}

export function showProgramDetails(program) {
    hideProgramDetails(); // Remove any existing details
    
    const detailsDiv = document.createElement('div');
    detailsDiv.id = 'program-details';
    detailsDiv.className = 'fixed bg-white bg-opacity-90 backdrop-blur-lg p-4 rounded-lg shadow-lg';
    detailsDiv.innerHTML = `
        <h4 class="text-lg font-bold mb-2">${program.short_description_en}</h4>
        <p class="mb-1">ID: ${program.id}</p>
        <p>Amount: $${program.amount.toLocaleString()}</p>
    `;
    document.body.appendChild(detailsDiv);
    
    // Position the div near the cursor
    document.addEventListener('mousemove', positionDetailsDiv);
}

export function hideProgramDetails() {
    const detailsDiv = document.getElementById('program-details');
    if (detailsDiv) {
        detailsDiv.remove();
        document.removeEventListener('mousemove', positionDetailsDiv);
    }
}

function positionDetailsDiv(e) {
    const detailsDiv = document.getElementById('program-details');
    if (detailsDiv) {
        const x = e.pageX + 10;
        const y = e.pageY + 10;
        
        // Keep the div within viewport bounds
        const rect = detailsDiv.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        const finalX = Math.min(x, viewportWidth - rect.width - 10);
        const finalY = Math.min(y, viewportHeight - rect.height - 10);
        
        detailsDiv.style.left = `${finalX}px`;
        detailsDiv.style.top = `${finalY}px`;
    }
}
