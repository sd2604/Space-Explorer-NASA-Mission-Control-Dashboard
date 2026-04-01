function saveFavorite(url) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (!favorites.includes(url)) {
    favorites.unshift(url); 
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
    
    if (window.location.hash === '#favorites' || document.getElementById('favorites').classList.contains('active')) {
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
  favorites = favorites.filter(fav => fav !== url);
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
    .map(url => {
       const cleanUrl = url.replace(/'/g, "\\'");
       return `
        <div class="favorite-card">
          <img src="${url}" alt="Saved Favorite" onclick="window.openLightbox('${cleanUrl}', 'Favorite Photo')">
          <div class="fav-overlay" onclick="window.openLightbox('${cleanUrl}', 'Favorite Photo')">
             <button class="fav-remove-btn" onclick="removeFavorite('${cleanUrl}'); event.stopPropagation();" title="Remove from Favorites">
                <i class="fa-solid fa-trash"></i>
             </button>
          </div>
        </div>
      `;
    })
    .join("");
}