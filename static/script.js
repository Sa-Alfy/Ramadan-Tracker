let selectedDayIndex = null; 
let qiblaAngle = 0;

// --- Live Clock & Date Update ---
function updateLiveClock() {
    const now = new Date();
    
    // Update live clock
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = String((hours % 12) === 0 ? 12 : (hours % 12)).padStart(2, '0');
    document.getElementById('live-clock').innerText = `${hours12}:${minutes}:${seconds} ${ampm}`;
    
    // Update day and date (only once on load)
    if (!window.dateInitialized) {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const dayName = daysOfWeek[now.getDay()];
        const monthName = monthsOfYear[now.getMonth()];
        const date = now.getDate();
        const year = now.getFullYear();
        
        document.getElementById('current-day').innerText = dayName;
        document.getElementById('current-date').innerText = `${monthName} ${date}, ${year}`;
        
        window.dateInitialized = true;
    }
}

// --- Search & Mosque Tracker Logic ---
function updateLocation() {
    const input = document.getElementById('location-input').value;
    if (input.trim() !== '') {
        // Update display tag
        document.getElementById('location-display').innerText = input.toUpperCase();
        
        // Update Mosque Button dynamically based on search
        const mosqueBtn = document.getElementById('mosque-btn');
        const encodedLocation = encodeURIComponent(input);
        mosqueBtn.href = `https://www.google.com/maps/search/mosques+in+${encodedLocation}`;
        
        // Reload the page with the new city so server can return prayer times
        // Use location.replace to avoid creating a history entry when searching
        const query = `?city=${encodedLocation}`;
        window.location.href = `/${query}`;
    }
}

// --- Accordion Toggle Logic ---
function toggleSection(sectionId, btnElement) {
    const content = document.getElementById(sectionId);
    content.classList.toggle('active');
    btnElement.classList.toggle('active');

    if (content.classList.contains('active')) {
        setTimeout(() => {
            content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }
}

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

// --- Fasting Tracker Logic ---
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
        if (status !== 'none') dayBtn.classList.add(status);
        dayBtn.innerText = index + 1;

        if (status === 'fasted') fastedCount++;
        if (status === 'missed') makeupCount++;

        dayBtn.onclick = () => openModal(index);
        daysGrid.appendChild(dayBtn);
    });

    if (fastedCountDisp) fastedCountDisp.innerText = fastedCount;
    if (makeupCountDisp) makeupCountDisp.innerText = makeupCount;
    if (progressBar) progressBar.style.width = (fastedCount / 30 * 100) + "%";
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

function setStatus(status) {
    let fastData = JSON.parse(localStorage.getItem('ramadanFasts')) || Array(30).fill('none');
    fastData[selectedDayIndex] = status;
    localStorage.setItem('ramadanFasts', JSON.stringify(fastData));
    closeModal();
    initTracker();
}

// --- Qibla Compass Logic ---
function calculateQibla(lat, lng) {
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;
    const phiK = kaabaLat * (Math.PI / 180);
    const lambdaK = kaabaLng * (Math.PI / 180);
    const phi = lat * (Math.PI / 180);
    const lambda = lng * (Math.PI / 180);

    const psi = Math.atan2(
        Math.sin(lambdaK - lambda),
        Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
    );
    return (psi * 180 / Math.PI + 360) % 360;
}

async function startCompass() {
    const arrow = document.getElementById('qibla-arrow');
    const degreeLabel = document.getElementById('qibla-degrees');

    navigator.geolocation.getCurrentPosition((pos) => {
        qiblaAngle = calculateQibla(pos.coords.latitude, pos.coords.longitude);
        if (degreeLabel) degreeLabel.innerText = `Qibla: ${Math.round(qiblaAngle)}°`;
    }, () => alert("Please enable location to calculate Qibla direction."));

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission !== 'granted') return alert("Permission denied.");
        } catch (error) { console.error(error); }
    }

    const handleOrientation = (e) => {
        let heading = e.webkitCompassHeading || (360 - e.alpha);
        if (heading !== undefined && arrow) {
            const finalRotation = qiblaAngle - heading;
            arrow.style.transform = `rotate(${finalRotation}deg)`;
        }
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
}

// --- Global Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTracker();
    
    const resetBtn = document.getElementById('reset-tracker');
    if (resetBtn) {
        resetBtn.onclick = () => {
            if(confirm("Are you sure you want to clear your entire fasting log?")) {
                localStorage.setItem('ramadanFasts', JSON.stringify(Array(30).fill('none')));
                initTracker();
            }
        };
    }

    const modalOverlay = document.getElementById('status-modal');
    if (modalOverlay) {
        modalOverlay.onclick = (e) => {
            if (e.target === modalOverlay) closeModal();
        };
    }

    const compassBtn = document.getElementById('start-compass');
    if (compassBtn) {
        compassBtn.onclick = () => {
            startCompass();
            compassBtn.style.display = 'none';
        };
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();
    
    // Initialize live clock and date
    updateLiveClock();
    setInterval(updateLiveClock, 1000);
});