document.addEventListener("DOMContentLoaded", () => {
    initDashboard();
});

function initDashboard() {
    setDynamicGreeting();
    initSystemTicker();
    initGamification();
    loadDashboardAPOD();
}

// ==========================================
// 1. SMART INTERACTION: DYNAMIC GREETING
// ==========================================
function setDynamicGreeting() {
    const titleEl = document.getElementById("dynamic-greeting");
    
    if (!titleEl) return;

    const hour = new Date().getHours();
    let greeting = "Welcome to Mission Control";

    if (hour >= 5 && hour < 12) {
        greeting = "Good Morning, Commander";
    } else if (hour >= 12 && hour < 18) {
        greeting = "Good Afternoon, Commander";
    } else if (hour >= 18 && hour < 22) {
        greeting = "Good Evening, Commander";
    } else {
        greeting = "Late Night, Commander";
    }

    titleEl.textContent = greeting;
}

// ==========================================
// 2. SMART INTERACTION: SYSTEM MESSAGES
// ==========================================
function initSystemTicker() {
    const ticker = document.getElementById("system-ticker");
    if (!ticker) return;

    const messages = [
        '<i class="fa-solid fa-satellite"></i> 🛰 ISS Tracker online. Monitoring orbital speeds.',
        '<i class="fa-solid fa-meteor"></i> ☄️ Scanning near-Earth objects via NeoWs...',
        '<i class="fa-solid fa-camera-retro"></i> 📸 Rover cameras active (Curiosity, Perseverance).',
        '<i class="fa-solid fa-tower-broadcast"></i> 📡 Incoming telemetry from deep space...',
        '<i class="fa-solid fa-database"></i> 📊 Planetary databases synchronized.'
    ];

    let currentIndex = 0;

    ticker.innerHTML = `<li>${messages[currentIndex]}</li>`;

    setInterval(() => {
        // Fade out
        ticker.style.opacity = 0;
        
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % messages.length;
            ticker.innerHTML = `<li>${messages[currentIndex]}</li>`;
            // Fade in
            ticker.style.opacity = 1;
        }, 500); // 500ms allows the CSS transition to happen
        
    }, 6000); // Change message every 6 seconds
}

// ==========================================
// 3. TODAY IN SPACE (APOD PREVIEW)
// ==========================================
async function loadDashboardAPOD() {
    const container = document.getElementById("today-apod-preview");
    if (!container) return;

    const cacheKey = "apod_cache_today";
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        try {
            renderDashboardAPOD(JSON.parse(cachedData), container);
            return;
        } catch(e) {}
    }

    const apiKey = window.API_KEY || "DEMO_KEY";
    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&thumbs=true`;

    try {
        const data = await window.nasaFetch(url);
        localStorage.setItem(cacheKey, JSON.stringify(data));
        renderDashboardAPOD(data, container);
    } catch(err) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 1rem;">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Telemetry offline. Could not fetch APOD.</p>
            </div>
        `;
    }
}

function renderDashboardAPOD(data, container) {
    let mediaHtml = "";
    
    // For APOD preview, we use thumbnail if video, otherwise image
    const sourceUrl = data.thumbnail_url || data.url;

    mediaHtml = `<img src="${sourceUrl}" alt="${data.title}" class="preview-img" />`;

    // Trucate description for preview
    const shortDesc = data.explanation.length > 150 
        ? data.explanation.substring(0, 150) + "..." 
        : data.explanation;

    container.innerHTML = `
        <div class="today-preview-layout">
            <div class="preview-media">${mediaHtml}</div>
            <div class="preview-text">
                <h4>${data.title}</h4>
                <p>${shortDesc}</p>
                <button class="primary-btn explore-apod-btn" onclick="document.getElementById('apod').scrollIntoView({ behavior: 'smooth', block: 'start' })">
                    <i class="fa-solid fa-rocket"></i> Explore Full APOD
                </button>
            </div>
        </div>
    `;
}

// ==========================================
// 4. GAMIFICATION: PROGRESS & BADGES
// ==========================================
let missionScore = 0;
const MAX_SCORE = 1000;
let unlockedBadges = [];

const BADGE_DEFS = {
    apod: { id: 'apod', icon: 'fa-star', name: 'Stargazer', color: '#f59e0b', description: 'Viewed APOD' },
    asteroids: { id: 'asteroids', icon: 'fa-meteor', name: 'Asteroid Hunter', color: '#ef4444', description: 'Tracked NEOs' },
    rover: { id: 'rover', icon: 'fa-robot', name: 'Martian', color: '#f97316', description: 'Explored Mars' },
    iss: { id: 'iss', icon: 'fa-satellite', name: 'Tracker', color: '#0ea5e9', description: 'Located ISS' },
    favorites: { id: 'favorites', icon: 'fa-heart', name: 'Curator', color: '#ec4899', description: 'Saved Favorites' }
};

function initGamification() {
    // Load from storage
    const storedScore = localStorage.getItem("missionScore");
    const storedBadges = localStorage.getItem("unlockedBadges");

    if (storedScore) missionScore = parseInt(storedScore, 10);
    if (storedBadges) unlockedBadges = JSON.parse(storedBadges);

    updateGamificationUI();
}

/**
 * Called globally (from main.js) when a user visits a section or performs an action
 */
window.trackMissionAction = function(actionId, points = 50) {
    let changed = false;

    // Award points (throttle max score)
    if (missionScore < MAX_SCORE) {
        // Prevent infinite farming - simplified logic: only award points if we also unlock a badge, or if we randomly explore. Let's just award flat points until max.
        missionScore = Math.min(missionScore + points, MAX_SCORE);
        changed = true;
    }

    // Unlock badges (e.g., visiting 'apod' unlocks 'apod' badge)
    if (BADGE_DEFS[actionId] && !unlockedBadges.includes(actionId)) {
        unlockedBadges.push(actionId);
        changed = true;
        
        // Bonus score for unlocking a badge
        missionScore = Math.min(missionScore + 100, MAX_SCORE);
        
        showBadgeNotification(BADGE_DEFS[actionId]);
    }

    if (changed) {
        localStorage.setItem("missionScore", missionScore);
        localStorage.setItem("unlockedBadges", JSON.stringify(unlockedBadges));
        updateGamificationUI();
    }
}

function updateGamificationUI() {
    const scoreEl = document.getElementById("mission-score");
    const barEl = document.getElementById("score-bar");
    const badgesContainer = document.getElementById("badges-container");

    if (scoreEl) scoreEl.textContent = missionScore;
    
    if (barEl) {
        const percentage = Math.min((missionScore / MAX_SCORE) * 100, 100);
        barEl.style.width = `${percentage}%`;
        
        // Add neon glow based on progress
        if (percentage >= 100) {
            barEl.style.boxShadow = '0 0 15px #0ea5e9, 0 0 30px #0ea5e9';
            barEl.style.backgroundColor = '#38bdf8';
        }
    }

    if (badgesContainer) {
        badgesContainer.innerHTML = ''; // Clear
        
        if (unlockedBadges.length === 0) {
            badgesContainer.innerHTML = `<span class="no-badges">No badges unlocked yet. Start exploring!</span>`;
            return;
        }

        unlockedBadges.forEach(bId => {
            const def = BADGE_DEFS[bId];
            if (def) {
                const badgeEl = document.createElement("div");
                badgeEl.className = "mission-badge tooltip-trigger";
                badgeEl.innerHTML = `
                    <i class="fa-solid ${def.icon}" style="color: ${def.color};"></i>
                    <span class="tooltip-text">${def.name}: ${def.description}</span>
                `;
                badgesContainer.appendChild(badgeEl);
            }
        });
    }
}

function showBadgeNotification(badgeDef) {
    // Optional: Could append a brief toast notification to the screen
    console.log(`Unlocked Badge: ${badgeDef.name}`);
}
