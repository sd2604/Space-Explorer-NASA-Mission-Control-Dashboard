let issInterval = null;
window.issLoaded = false;

function initISS() {
  if (window.issLoaded) return;
  window.issLoaded = true;

  fetchISSLocation();
  issInterval = setInterval(fetchISSLocation, 5000);
}

function fetchISSLocation() {
  const url = 'https://api.wheretheiss.at/v1/satellites/25544';

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const latEl = document.getElementById("iss-lat");
      const lngEl = document.getElementById("iss-lng");
      const velEl = document.getElementById("iss-vel");
      const altEl = document.getElementById("iss-alt");
      
      const mapFrame = document.getElementById("iss-map-frame");
      const mapPlaceholder = document.getElementById("iss-map-placeholder");
      
      // Update UI
      latEl.textContent = data.latitude.toFixed(4);
      lngEl.textContent = data.longitude.toFixed(4);
      velEl.textContent = Math.round(data.velocity);
      altEl.textContent = Math.round(data.altitude);
      if (mapFrame.src === "" || mapFrame.src === window.location.href) {
         const lat = data.latitude;
         const lng = data.longitude;
         const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-5}%2C${lat-5}%2C${lng+5}%2C${lat+5}&layer=mapnik&marker=${lat}%2C${lng}`;
         
         mapFrame.src = mapUrl;
         mapFrame.onload = () => {
             mapFrame.classList.remove("hidden");
             if(mapPlaceholder) mapPlaceholder.style.opacity = '0';
         };
      }
    })
    .catch(err => {
      console.error("ISS error:", err);
    });
}
