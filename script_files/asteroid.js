const asteroidBtn = document.getElementById("load-asteroids");
const asteroidList = document.getElementById("asteroid-list");
const filterGroup = document.getElementById("asteroid-filters");
const sortSelect = document.getElementById("sort-asteroids");
const searchInput = document.getElementById("search-asteroids");
const hazardSelect = document.getElementById("filter-hazard");
const paginationContainer = document.getElementById("asteroid-pagination");
const insightsPanel = document.getElementById("asteroid-insights");

let asteroidsData = [];
let filteredAsteroidsData = []; // Pure state reference for HOFs
let countdownIntervals = [];
const ITEMS_PER_PAGE = 6;
let currentPage = 1;

asteroidBtn?.addEventListener("click", fetchAsteroids);

// HOF triggers
searchInput?.addEventListener("input", () => {
  currentPage = 1; 
  applyFilters();
});

hazardSelect?.addEventListener("change", () => {
  currentPage = 1; 
  applyFilters();
});

sortSelect?.addEventListener("change", () => {
  currentPage = 1; 
  sortAndRender();
});

async function fetchAsteroids() {
  asteroidList.innerHTML = `
    <div class="skeleton-layout skeleton-active" style="display:flex; flex-direction:row; gap:15px; flex-wrap:wrap">
       <div class="skel-media" style="width:300px; height:200px"></div>
       <div class="skel-media" style="width:300px; height:200px"></div>
       <div class="skel-media" style="width:300px; height:200px"></div>
    </div>
  `;
  
  const today = new Date().toISOString().split("T")[0];
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${window.API_KEY || 'DEMO_KEY'}`;

  try {
    const data = await window.nasaFetch(url);
    asteroidsData = data.near_earth_objects[today] || [];
    
    if (asteroidsData.length === 0) {
      asteroidList.innerHTML = `<div class="empty-state">No asteroids approaching today. Rest easy!</div>`;
      return;
    }
    asteroidsData = asteroidsData.map(a => {
      return {
        id: a.id,
        name: a.name.replace(/[^\w\s-]/gi, ''),
        sizeFormatter: Math.round(a.estimated_diameter.meters.estimated_diameter_max),
        distanceNum: parseFloat(a.close_approach_data[0].miss_distance.kilometers),
        speedNum: parseFloat(a.close_approach_data[0].relative_velocity.kilometers_per_hour),
        isHazardous: a.is_potentially_hazardous_asteroid,
        approachTimeStr: a.close_approach_data[0].close_approach_date_full
      };
    });

    filteredAsteroidsData = [...asteroidsData];

    filterGroup.classList.remove("hidden");
    insightsPanel.classList.remove("hidden");
    paginationContainer.classList.remove("hidden");
    sortSelect.value = "distance";
    hazardSelect.value = "all";
    searchInput.value = "";
    
    applyFilters();
  } catch (err) {
    console.error(err);
    asteroidList.innerHTML = `
      <div class="empty-state">
         <i class="fa-solid fa-satellite-dish fa-3x"></i>
         <p>${err.message || 'Failed to collect NeoWs data.'}</p>
      </div>`;
  }
}

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const hazardFilter = hazardSelect.value;
  
  // Array.prototype.filter() execution
  filteredAsteroidsData = asteroidsData.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchTerm);
      const matchesHazard = hazardFilter === "all" 
        || (hazardFilter === "hazardous" && a.isHazardous)
        || (hazardFilter === "safe" && !a.isHazardous);
        
      return matchesSearch && matchesHazard;
  });

  sortAndRender();
}

function sortAndRender() {
  const sortBy = sortSelect.value;
  
  // Array.prototype.sort() execution
  if (sortBy === "distance") {
    filteredAsteroidsData.sort((a, b) => a.distanceNum - b.distanceNum);
  } else if (sortBy === "speed") {
    filteredAsteroidsData.sort((a, b) => b.speedNum - a.speedNum);
  } else if (sortBy === "size") {
    filteredAsteroidsData.sort((a, b) => b.sizeFormatter - a.sizeFormatter);
  } else if (sortBy === "hazard") {
    filteredAsteroidsData.sort((a, b) => (b.isHazardous ? 1 : 0) - (a.isHazardous ? 1 : 0));
  }

  calculateInsights();
  renderPage();
  setupPagination();
}

function calculateInsights() {
  if (filteredAsteroidsData.length === 0) {
      insightsPanel.innerHTML = `<div class="empty-state" style="margin:0;">No metrics available for current filters.</div>`;
      return;
  }

  // Array.prototype.reduce() execution 
  const totalSpeed = filteredAsteroidsData.reduce((acc, a) => acc + a.speedNum, 0);
  const avgSpeed = Math.round(totalSpeed / filteredAsteroidsData.length);

  // Isolate extremes using safe spread sorting (or .reduce effectively hooks min/max without mutating context)
  const fastest = filteredAsteroidsData.reduce((max, a) => a.speedNum > max.speedNum ? a : max, filteredAsteroidsData[0]);
  const closest = filteredAsteroidsData.reduce((min, a) => a.distanceNum < min.distanceNum ? a : min, filteredAsteroidsData[0]);

  insightsPanel.innerHTML = `
    <div class="insight-box">
      <h4><i class="fa-solid fa-gauge-high"></i> Avg Speed</h4>
      <p>${avgSpeed.toLocaleString()} km/h</p>
    </div>
    <div class="insight-box hazardous-metric">
      <h4><i class="fa-solid fa-fire"></i> Fastest Object</h4>
      <p><strong>${fastest.name}</strong><br/>${Math.round(fastest.speedNum).toLocaleString()} km/h</p>
    </div>
    <div class="insight-box warning-metric">
      <h4><i class="fa-solid fa-arrows-to-dot"></i> Closest Approach</h4>
      <p><strong>${closest.name}</strong><br/>${Math.round(closest.distanceNum).toLocaleString()} km</p>
    </div>
  `;
}

function renderPage() {
  // Clear old intervals
  countdownIntervals.forEach(clearInterval);
  countdownIntervals = [];

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageData = filteredAsteroidsData.slice(startIndex, endIndex);

  // Array.prototype.map() execution
  asteroidList.innerHTML = pageData.map(a => {
    const hazardClass = a.isHazardous ? "hazardous" : "safe";
    const badgeHtml = a.isHazardous 
      ? '<span class="ast-badge badge-danger">⚠️ Hazardous</span>' 
      : '<span class="ast-badge badge-safe">✅ Safe</span>';
      
    const distanceFormatted = a.distanceNum.toLocaleString(undefined, { maximumFractionDigits: 0 });
    const speedFormatted = a.speedNum.toLocaleString(undefined, { maximumFractionDigits: 0 });

    return `
      <div class="nasa-card asteroid-card ${hazardClass}">
        <div class="ast-header">
          <h3><i class="fa-solid fa-meteor"></i> ${a.name}</h3>
          ${badgeHtml}
        </div>
        
        <div class="ast-data">
          <div class="data-item">
            <span class="data-label">Max Size</span>
            <span class="data-val">~${a.sizeFormatter} m</span>
          </div>
          <div class="data-item">
            <span class="data-label">Speed</span>
            <span class="data-val">${speedFormatted} km/h</span>
          </div>
          <div class="data-item" style="grid-column: span 2;">
            <span class="data-label">Miss Distance</span>
            <span class="data-val">${distanceFormatted} km</span>
          </div>
        </div>
        
        <!-- Timer container identified by asteroid ID -->
        <div class="ast-countdown" id="timer-${a.id}">
           Calculating time...
        </div>
      </div>
    `;
  }).join("");

  pageData.forEach(a => {
    startTimer(a.id, a.approachTimeStr);
  });
}

function setupPagination() {
  const totalPages = Math.ceil(filteredAsteroidsData.length / ITEMS_PER_PAGE);
  if(totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }
  
  let html = '';
  for(let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  
  paginationContainer.innerHTML = html;
  
  document.querySelectorAll(".page-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      currentPage = parseInt(e.target.dataset.page);
      renderPage();
      setupPagination(); 
      document.getElementById('asteroids').scrollIntoView({ behavior: 'smooth' });
    });
  });
}
function startTimer(elementId, timeString) {
  let approachDate = null;
  
  try {
     const parts = timeString.split(" ");
     const datePart = parts[0]; 
     const timePart = parts[1]; 
     
     const months = { "Jan":"01", "Feb":"02", "Mar":"03", "Apr":"04", "May":"05", "Jun":"06", "Jul":"07", "Aug":"08", "Sep":"09", "Oct":"10", "Nov":"11", "Dec":"12" };
     const dp = datePart.split("-"); // [YYYY, Mon, DD]
     if(dp.length === 3) {
        const isoString = `${dp[0]}-${months[dp[1]]}-${dp[2]}T${timePart}:00Z`;
        approachDate = new Date(isoString).getTime();
     }
  } catch(e) {
     approachDate = new Date(timeString).getTime(); // fallback
  }

  const el = document.getElementById(`timer-${elementId}`);
  if(!el) return;

  function update() {
    if(!approachDate) {
      el.innerHTML = "Time Available: <span>Unknown</span>";
      return;
    }
    
    const now = new Date().getTime();
    const diff = approachDate - now;

    if (diff <= 0) {
      el.innerHTML = "Approach: <span>Completed</span>";
      return;
    }
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    el.innerHTML = `T-Minus <span>${pad(h)}h ${pad(m)}m ${pad(s)}s</span>`;
  }
  
  update();
  const iv = setInterval(update, 1000);
  countdownIntervals.push(iv);
}

function pad(n) {
  return n < 10 ? '0' + n : n;
}