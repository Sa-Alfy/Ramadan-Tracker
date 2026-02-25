// --- Modal State Management ---
let selectedDayIndex = null; 

// --- Countdown Logic ---
function updateCountdown() {
    const iftarElement = document.getElementById('iftar-time');
    const countdownElement = document.getElementById('countdown');

    if (!iftarElement || !countdownElement) return;

    const iftarText = iftarElement.innerText; 
    const now = new Date();

    const [time, modifier] = iftarText.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

    const iftarDate = new Date();
    iftarDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const diff = iftarDate - now;

    if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        const displayH = String(h).padStart(2, '0');
        const displayM = String(m).padStart(2, '0');
        const displayS = String(s).padStart(2, '0');

        countdownElement.innerText = `Remaining: ${displayH}h ${displayM}m ${displayS}s`;
    } else {
        countdownElement.innerText = "It's Iftar time! Al-Hamdu Lillah.";
    }
}

// --- Fasting Tracker Logic (Updated for Popup) ---
function initTracker() {
    const daysGrid = document.getElementById('days-grid');
    const fastedCountDisp = document.getElementById('count-fasted');
    const makeupCountDisp = document.getElementById('count-qada');
    const progressBar = document.getElementById('progress-bar');
    
    if (!daysGrid) return; 

    let fastData = JSON.parse(localStorage.getItem('ramadanFasts')) || Array(30).fill('none');

    daysGrid.innerHTML = '';
    let fastedCount = 0;
    let makeupCount = 0;

    fastData.forEach((status, index) => {
        const dayBtn = document.createElement('div');
        dayBtn.classList.add('day-circle');
        
        // Apply visual classes
        if (status !== 'none') dayBtn.classList.add(status);
        dayBtn.innerText = index + 1;

        if (status === 'fasted') fastedCount++;
        if (status === 'missed') makeupCount++;

        // Trigger the Popup instead of rotating colors
        dayBtn.onclick = () => openModal(index);
        
        daysGrid.appendChild(dayBtn);
    });

    // Update Dashboard UI
    if (fastedCountDisp) fastedCountDisp.innerText = fastedCount;
    if (makeupCountDisp) makeupCountDisp.innerText = makeupCount;
    if (progressBar) {
        const percentage = (fastedCount / 30) * 100;
        progressBar.style.width = percentage + "%";
    }
}

// --- Modal Control Functions ---
function openModal(index) {
    selectedDayIndex = index;
    const modal = document.getElementById('status-modal');
    const title = document.getElementById('modal-title');
    
    if (modal && title) {
        title.innerText = `Day ${index + 1}`;
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('status-modal');
    if (modal) modal.style.display = 'none';
}

// This function is called by the buttons inside the HTML modal
function setStatus(status) {
    let fastData = JSON.parse(localStorage.getItem('ramadanFasts')) || Array(30).fill('none');
    
    // Update the data
    fastData[selectedDayIndex] = status;
    localStorage.setItem('ramadanFasts', JSON.stringify(fastData));
    
    // Close and Refresh
    closeModal();
    initTracker();
}

// --- Global Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTracker();
    
    // Reset Logic
    const resetBtn = document.getElementById('reset-tracker');
    if (resetBtn) {
        resetBtn.onclick = () => {
            if(confirm("Are you sure you want to clear your entire fasting log?")) {
                localStorage.setItem('ramadanFasts', JSON.stringify(Array(30).fill('none')));
                initTracker();
            }
        };
    }

    // Modal Background Click (Close if user clicks outside the box)
    const modalOverlay = document.getElementById('status-modal');
    if (modalOverlay) {
        modalOverlay.onclick = (e) => {
            if (e.target === modalOverlay) closeModal();
        };
    }

    // Countdown setup
    setInterval(updateCountdown, 1000);
    updateCountdown();
});