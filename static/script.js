function updateCountdown() {
    const iftarElement = document.getElementById('iftar-time');
    const countdownElement = document.getElementById('countdown');

    if (!iftarElement || !countdownElement) return;

    const iftarText = iftarElement.innerText; // e.g., "06:15 PM"
    const now = new Date();

    // Convert "06:15 PM" into a date object
    const [time, modifier] = iftarText.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }

    const iftarDate = new Date();
    iftarDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const diff = iftarDate - now;

    if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Pad numbers so they look like 05:09:01 instead of 5:9:1
        const displayH = String(h).padStart(2, '0');
        const displayM = String(m).padStart(2, '0');
        const displayS = String(s).padStart(2, '0');

        countdownElement.innerText = `Remaining: ${displayH}h ${displayM}m ${displayS}s`;
    } else {
        countdownElement.innerText = "It's Iftar time! Al-Hamdu Lillah.";
    }
}

// Update every second
setInterval(updateCountdown, 1000);
updateCountdown();