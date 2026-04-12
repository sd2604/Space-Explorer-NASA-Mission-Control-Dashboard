function saveFavorite(url, mediaType = "image", title = "Saved Photo") {
  if (typeof window !== "undefined" && window.currentAPODData && window.currentAPODData.url === url) {
     mediaType = window.currentAPODData.media_type || "image";
     title = window.currentAPODData.title || title;
  }

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  const exists = favorites.some(fav => {
    if (typeof fav === "string") return fav === url;
    return fav.url === url;
  });

  if (!exists) {
    favorites.unshift({ url, media_type: mediaType, title }); 
    localStorage.setItem("favorites", JSON.stringify(favorites));

    const btn = document.activeElement;
    if(btn && btn.tagName === 'BUTTON') {
      const originalText = btn.innerHTML;
      btn.innerHTML = `<i class="fa-solid fa-check"></i> Saved!`;
      btn.style.background = "var(--secondary-accent)";
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = "";
      }, 2000);
    }
    
    if (window.location.hash === '#favorites' || document.getElementById('favorites')?.classList.contains('active')) {
       loadFavorites();
    }
  } else {
     const btn = document.activeElement;
     if(btn && btn.tagName === 'BUTTON') {
       const originalText = btn.innerHTML;
       btn.innerHTML = `Already Saved`;
       setTimeout(() => btn.innerHTML = originalText, 2000);
     }
  }
}

function removeFavorite(url) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(fav => {
    if (typeof fav === "string") return fav !== url;
    return fav.url !== url;
  });
  localStorage.setItem("favorites", JSON.stringify(favorites));
  loadFavorites(); 
}

function loadFavorites() {
  const gallery = document.getElementById("favorites-gallery");
  if (!gallery) return;

  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    gallery.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-heart-crack fa-3x" style="color:var(--text-secondary);"></i>
        <p>No favorites yet. Go save some amazing space photos!</p>
      </div>
    `;
    return;
  }

  gallery.innerHTML = favorites
    .map(fav => {
       const item = typeof fav === "string" ? { url: fav, media_type: "image", title: "Favorite Photo" } : fav;
       const cleanUrl = item.url.replace(/'/g, "\\'");
       
       // CRITICAL: Escape double quotes to prevent DOM string breakage on HTML payload
       const safeTitle = (item.title || "Favorite").replace(/"/g, '&quot;');
       const cleanTitle = safeTitle.replace(/'/g, "\\'");
       
       if (item.media_type === "video") {
          let videoUrl = item.url;
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

          let mediaHtml = "";
          if (isDirectVideo) {
             mediaHtml = `<video src="${videoUrl}" controls style="width:100%; height:100%; border-radius:12px; object-fit: cover;"></video>`;
          } else if (isEmbeddable) {
             mediaHtml = `<iframe src="${videoUrl}" allowfullscreen style="width:100%; height:100%; border-radius:12px; border:none; pointer-events:auto;"></iframe>`;
          } else {
             mediaHtml = `<div style="display:flex; height:100%; align-items:center; justify-content:center; background:#000; border-radius:12px;"><a href="${item.url}" target="_blank" style="color:#00d4ff; text-decoration:none; font-weight:bold;">▶ Play Video</a></div>`;
          }

          return `
            <div class="favorite-card">
              ${mediaHtml}
              <button class="fav-remove-btn" onclick="removeFavorite('${cleanUrl}'); event.stopPropagation();" title="Remove from Favorites" style="position:absolute; top:10px; right:10px; z-index:10; background:rgba(0,0,0,0.6); padding:8px; border-radius:50%; border:1px solid rgba(255,255,255,0.2); cursor:pointer;">
                <i class="fa-solid fa-trash" style="color:#f43f5e;"></i>
              </button>
            </div>
          `;
       } else {
          return `
            <div class="favorite-card">
              <img src="${item.url}" alt="${safeTitle}" onclick="window.openLightbox('${cleanUrl}', '${cleanTitle}')">
              <div class="fav-overlay" onclick="window.openLightbox('${cleanUrl}', '${cleanTitle}')">
                 <button class="fav-remove-btn" onclick="removeFavorite('${cleanUrl}'); event.stopPropagation();" title="Remove from Favorites">
                    <i class="fa-solid fa-trash"></i>
                 </button>
              </div>
            </div>
          `;
       }
    })
    .join("");
}