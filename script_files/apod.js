let currentAPODDate = "";
let currentAPODData = null;
let isHD = false;

window.apodLoaded = false;

function loadAPOD(date = "") {
  window.apodLoaded = true;
  const container = document.getElementById("apod-content");
  if (!container) return;
  showLoader("apod-content");

  let url = `https://api.nasa.gov/planetary/apod?api_key=${window.API_KEY}&thumbs=true`;
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
            videoUrl = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
            isEmbeddable = true;
          } else if (vimeoMatch && vimeoMatch[1]) {
            videoUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0`;
            isEmbeddable = true;
          }
        }
        
        if (isDirectVideo) {
          mediaHtml = `<video id="apod-video" autoplay muted loop playsinline controls>
                         <source src="${videoUrl}" type="video/mp4">
                       </video>`;
        } else if (isEmbeddable) {
          mediaHtml = `<iframe id="apod-video" src="${videoUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
          if (data.thumbnail_url) {
            mediaHtml = `<div style="position:relative; width:100%; height:100%;">
                           <img id="apod-image" src="${data.thumbnail_url}" alt="Video Thumbnail" style="opacity:1; cursor:pointer;" onclick="window.open('${data.url}', '_blank')">
                           <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.6); padding:1.5rem 2rem; border-radius:30px; border: 1px solid rgba(0, 212, 255, 0.4); pointer-events:none; box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);">
                              <i class="fa-solid fa-play" style="color:#00d4ff; font-size:2rem;"></i>
                           </div>
                         </div>`;
          } else {
            mediaHtml = `<div class="empty-state" style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding: 2rem;">
                            <i class="fa-solid fa-link-slash fa-3x" style="color:#00d4ff; margin-bottom:1rem;"></i>
                            <p style="color:#e0faff; font-family:'Orbitron', sans-serif; font-size:1.2rem; margin-bottom:1.5rem;">Video cannot be embedded.</p>
                            <a href="${data.url}" target="_blank" class="primary-btn" style="text-decoration:none; display:inline-block; padding: 0.8rem 1.5rem; border-radius: 20px;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Watch on NASA</a>
                         </div>`;
          }
        }
      } else {
        mediaHtml = `<img id="apod-image" src="${sourceUrl}" alt="${data.title}" 
                    onload="this.style.opacity=1" style="opacity:0; transition: opacity 0.5s;"
                    onclick="window.openLightbox('${data.hdurl || data.url}', '${data.title.replace(/'/g, "\\'")}')">`;
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