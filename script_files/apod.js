let currentAPODDate = "";
let currentAPODData = null;
let isHD = false;

window.apodLoaded = false;

let isAPODLoading = false;

async function loadAPOD(date = "") {
  if (isAPODLoading) return;
  isAPODLoading = true;
  window.apodLoaded = true;

  const container = document.getElementById("apod-content");
  if (!container) {
    isAPODLoading = false;
    return;
  }

  showLoader("apod-content");

  let fetchDate = "today";
  if (typeof date === "string" && date.trim() !== "") {
    fetchDate = date;
  }

  const cacheKey = `apod_cache_${fetchDate}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    try {
      const data = JSON.parse(cachedData);
      renderAPODData(data, container);
      isAPODLoading = false;
      return;
    } catch (e) {
      console.error("Cache parsing error", e);
    }
  }

  const apiKey = window.API_KEY || "DEMO_KEY";
  let url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&thumbs=true`;
  if (fetchDate !== "today") {
    url += `&date=${fetchDate}`;
  }

  try {
    const data = await window.nasaFetch(url);

    localStorage.setItem(cacheKey, JSON.stringify(data));
    if (fetchDate === "today") {
      localStorage.setItem(`apod_cache_${data.date}`, JSON.stringify(data));
    }

    renderAPODData(data, container);
  } catch (err) {
    console.error("APOD Load Error:", err);
    
    // Check if Rate Limit occurred to provide local cache fallbacks
    if (err.message && err.message.includes("429")) {
      let fallbackBtnHtml = "";
      const cachedKeys = Object.keys(localStorage).filter(k => k.startsWith("apod_cache_") && k !== "apod_cache_today");
      if (cachedKeys.length > 0) {
        const fallbackDate = cachedKeys[0].replace("apod_cache_", "");
        fallbackBtnHtml = `<br><button onclick="loadAPOD('${fallbackDate}')" class="secondary-btn" style="margin-top: 1rem;"><i class="fa-solid fa-box-archive"></i> View Cached Image</button>`;
      }

      container.innerHTML = `
        <div class="empty-state" style="padding: 2rem; text-align: center;">
          <i class="fa-solid fa-hourglass-half fa-3x" style="color: #f59e0b;"></i>
          <p style="margin-top: 1rem; color: #fbbf24; font-weight: 500;">${err.message}</p>
          ${fallbackBtnHtml}
        </div>`;
    } else {
      container.innerHTML = `
        <div class="empty-state" style="padding: 2rem; text-align: center;">
          <i class="fa-solid fa-satellite-dish fa-3x" style="color: #ef4444;"></i>
          <p style="margin-top: 1rem; color: #f87171;">Failed to load APOD. ${err.message || 'Check connection.'}</p>
        </div>`;
    }
  } finally {
    isAPODLoading = false;
  }
}

function renderAPODData(data, container) {
  currentAPODDate = data.date;
  currentAPODData = data;

  const dateInput = document.getElementById("date-input");
  if (dateInput) dateInput.value = data.date;

  let mediaHtml = "";
  const sourceUrl = isHD && data.hdurl ? data.hdurl : data.url;

  if (data.media_type === "video") {
    let videoUrl = data.url;
    let isEmbeddable = false;
    let isDirectVideo = false;

    if (videoUrl.toLowerCase().endsWith(".mp4")) {
      isDirectVideo = true;
    } else {
      const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const ytMatch = videoUrl.match(ytRegex);

      const vimeoRegex = /vimeo\.com\/(?:video\/)?([0-9]+)/i;
      const vimeoMatch = videoUrl.match(vimeoRegex);

      if (ytMatch && ytMatch[1]) {
        videoUrl = `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
        isEmbeddable = true;
      } else if (vimeoMatch && vimeoMatch[1]) {
        videoUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        isEmbeddable = true;
      }
    }

    if (isDirectVideo) {
      mediaHtml = `
        <video autoplay muted loop controls>
          <source src="${videoUrl}" type="video/mp4">
        </video>`;
    } else if (isEmbeddable) {
      mediaHtml = `
        <iframe src="${videoUrl}" allowfullscreen></iframe>`;
    } else if (data.thumbnail_url) {
      mediaHtml = `
        <div style="position:relative;">
          <img src="${data.thumbnail_url}" onclick="window.open('${data.url}', '_blank')">
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
            ▶
          </div>
        </div>`;
    }
  } else {
    mediaHtml = `
      <img src="${sourceUrl}" alt="${data.title}"
           onclick="window.open('${data.hdurl || data.url}', '_blank')">`;
  }

  const copyright = data.copyright
    ? `© ${data.copyright}`
    : "Public Domain";

  container.innerHTML = `
    <div class="apod-media-container">
      ${mediaHtml}
    </div>

    <div class="apod-details">
      <h3>${data.title}</h3>

      <div class="apod-meta">
        <span>📅 ${data.date}</span>
        <span>📸 ${copyright}</span>
      </div>

      <p>${data.explanation}</p>

      <div class="apod-actions">
        <button class="apod-action-btn" onclick="saveFavorite('${data.url}')">
          <i class="fa-solid fa-heart" style="color: #f43f5e;"></i> Save
        </button>

        <button class="apod-action-btn hd-toggle-btn ${isHD ? "hd-on" : ""}" onclick="toggleHD()">
          <span class="hd-icon">HD</span>
          <span class="hd-status">${isHD ? "ON" : "OFF"}</span>
        </button>

        ${
          data.media_type === "image"
            ? `<button class="apod-action-btn download-btn" onclick="downloadImage('${data.hdurl || data.url}', '${data.title}')"><i class="fa-solid fa-download"></i> Download</button>`
            : ""
        }
      </div>
    </div>
  `;
}

// 🔍 BUTTONS
document.getElementById("search-btn")?.addEventListener("click", () => {
  const date = document.getElementById("date-input").value;
  if (date) loadAPOD(date);
});

document.getElementById("prev-btn")?.addEventListener("click", () => shiftDate(-1));
document.getElementById("next-btn")?.addEventListener("click", () => shiftDate(1));
document.getElementById("random-btn")?.addEventListener("click", loadRandomAPOD);

// 📅 DATE SHIFT
function shiftDate(offset) {
  if (!currentAPODDate) return;

  const d = new Date(currentAPODDate);
  d.setDate(d.getDate() + offset);

  if (d > new Date()) {
    alert("Can't go into the future!");
    return;
  }

  loadAPOD(d.toISOString().split("T")[0]);
}

// 🎲 RANDOM
function loadRandomAPOD() {
  const start = new Date(1995, 5, 16);
  const end = new Date();

  const randomDate = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );

  loadAPOD(randomDate.toISOString().split("T")[0]);
}

// 🔄 HD TOGGLE
window.toggleHD = function () {
  isHD = !isHD;
  if (currentAPODDate) loadAPOD(currentAPODDate);
};

// ⬇ DOWNLOAD
window.downloadImage = function (url, filename) {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename + ".jpg";
      a.click();
    });
};

// 🚀 DEFAULT LOAD → TODAY’S APOD
window.addEventListener("DOMContentLoaded", () => {
  loadAPOD(); // ✅ THIS is the key fix
});