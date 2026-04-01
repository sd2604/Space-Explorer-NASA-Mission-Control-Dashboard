let currentAPODDate = "";
let currentAPODData = null;
let isHD = false;

window.apodLoaded = false;

function loadAPOD(date = "") {
  window.apodLoaded = true;
  const container = document.getElementById("apod-content");
  if (!container) return;
  showLoader("apod-content");

  let url = `https://api.nasa.gov/planetary/apod?api_key=${window.API_KEY}`;
  if (date) url += `&date=${date}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.code && data.code !== 200) {
        container.innerHTML = `<div class="empty-state">
           <i class="fa-solid fa-triangle-exclamation fa-3x"></i>
           <p>${data.msg}</p>
        </div>`;
        return;
      }

      currentAPODDate = data.date;
      currentAPODData = data;
      document.getElementById("date-input").value = data.date;

      let mediaHtml = "";
      const sourceUrl = isHD && data.hdurl ? data.hdurl : data.url;

      if (data.media_type === "image") {
        mediaHtml = `<img id="apod-image" src="${sourceUrl}" alt="${data.title}" 
                    onload="this.style.opacity=1" style="opacity:0; transition: opacity 0.5s;"
                    onclick="window.openLightbox('${data.hdurl || data.url}', '${data.title.replace(/'/g, "\\'")}')">`;
      } else {
        mediaHtml = `<iframe src="${data.url}" allowfullscreen></iframe>`;
      }

      const copyright = data.copyright ? `&copy; ${data.copyright}` : "Public Domain";

      container.innerHTML = `
        <div class="apod-media-container">
          ${mediaHtml}
        </div>
        <div class="apod-details">
          <h3 class="apod-title">${data.title}</h3>
          
          <div class="apod-meta">
            <span class="badge"><i class="fa-solid fa-calendar"></i> ${data.date}</span>
            <span class="badge"><i class="fa-solid fa-camera"></i> ${copyright}</span>
          </div>
          
          <p class="apod-explanation">${data.explanation}</p>
          
          <div class="apod-actions">
            <button onclick="saveFavorite('${data.url}')" class="primary-btn">
              <i class="fa-solid fa-heart"></i> Save Favorite
            </button>
            <button onclick="toggleHD()" class="secondary-btn" title="Toggle HD Resolution">
              <i class="fa-solid ${isHD ? 'fa-toggle-on' : 'fa-toggle-off'}"></i> HD Config
            </button>
            ${data.media_type === "image" ? `
              <button onclick="downloadImage('${data.hdurl || data.url}', '${data.title}')" class="primary-btn download-btn">
                <i class="fa-solid fa-download"></i> Download
              </button>
            ` : ""}
          </div>
        </div>
      `;
    })
    .catch((err) => {
      console.error(err);
      container.innerHTML = `<div class="empty-state">
           <i class="fa-solid fa-satellite-dish fa-3x"></i>
           <p>Failed to establish connection. Check your signal.</p>
        </div>`;
    });
}
const searchBtn = document.getElementById("search-btn");
const dateInput = document.getElementById("date-input");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const randomBtn = document.getElementById("random-btn");

searchBtn?.addEventListener("click", () => {
  if (dateInput.value) loadAPOD(dateInput.value);
});

prevBtn?.addEventListener("click", () => shiftDate(-1));
nextBtn?.addEventListener("click", () => shiftDate(1));
randomBtn?.addEventListener("click", () => loadRandomAPOD());

function shiftDate(offset) {
  if (!currentAPODDate) return;
  const d = new Date(currentAPODDate);
  d.setDate(d.getDate() + offset);
  
  // Prevent future dates
  if (d > new Date()) return alert("Can't look into the future!");
  
  const formatted = d.toISOString().split("T")[0];
  loadAPOD(formatted);
}

function loadRandomAPOD() {
  const start = new Date(1995, 5, 16); // APOD start date
  const end = new Date();
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  loadAPOD(randomDate.toISOString().split("T")[0]);
}

window.toggleHD = function() {
  isHD = !isHD;
  if(currentAPODDate) {
    loadAPOD(currentAPODDate); 
  }
}
window.downloadImage = function(url, filename) {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename + '.jpg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    })
    .catch(() => alert("Could not fetch the image for download. It may be blocked by CORS."));
}