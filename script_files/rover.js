const roverBtn = document.getElementById("load-rover-btn");
const roverGallery = document.getElementById("rover-gallery");\
const roverSelect = document.getElementById("rover-select");
const cameraSelect = document.getElementById("camera-select");
const solInput = document.getElementById("sol-input");

roverBtn?.addEventListener("click", fetchRoverPhotos);

function fetchRoverPhotos() {
  const rover = roverSelect.value;
  const camera = cameraSelect.value;
  const sol = solInput.value || 1000;

  roverGallery.innerHTML = `
    <div class="skeleton-layout skeleton-active">
       <div class="skel-media"></div>
    </div>
    <div class="skeleton-layout skeleton-active">
       <div class="skel-media"></div>
    </div>
    <div class="skeleton-layout skeleton-active">
       <div class="skel-media"></div>
    </div>
  `;
  let url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${window.API_KEY}`;
  
  if (camera !== "all") {
    url += `&camera=${camera}`;
  }

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const photos = data.photos;

      if (!photos || photos.length === 0) {
        roverGallery.innerHTML = `
          <div class="empty-state">
             <i class="fa-solid fa-camera-retro fa-3x"></i>
             <p>No photos found for the selected Sol and Camera combo.</p>
          </div>
        `;
        return;
      }

      roverGallery.innerHTML = photos.slice(0, 20).map(photo => {
        const cleanUrl = photo.img_src.replace(/'/g, "\\'");
        const cleanTitle = `${photo.rover.name} - ${photo.camera.full_name}`.replace(/'/g, "\\'");
        
        return `
          <div class="rover-card">
            <button class="rover-save-btn" onclick="saveFavorite('${cleanUrl}'); event.stopPropagation();" title="Save to Favorites">
               <i class="fa-solid fa-heart"></i>
            </button>
            <img src="${photo.img_src}" alt="Mars Photo" onclick="window.openLightbox('${cleanUrl}', '${cleanTitle}')"/>
            <div class="rover-card-info" onclick="window.openLightbox('${cleanUrl}', '${cleanTitle}')">
               <span class="rover-badge">${photo.camera.name}</span>
               <p><i class="fa-solid fa-calendar"></i> Earth Date: ${photo.earth_date}</p>
            </div>
          </div>
        `;
      }).join("");
    })
    .catch((err) => {
      console.error(err);
      roverGallery.innerHTML = `
        <div class="empty-state">
           <i class="fa-solid fa-satellite-dish fa-3x"></i>
           <p>Connection lost. The rover may be in hibernation.</p>
        </div>`;
    });
}
