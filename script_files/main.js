window.API_KEY = "Cj3K2i5DrgI4SPecivHDskyVd8PdXHzAZu5yPyN3";

document.addEventListener("DOMContentLoaded", () => {
  let vantaEffect;
  function initVanta(isLight) {
    if (vantaEffect) vantaEffect.destroy();
    vantaEffect = VANTA.NET({
      el: "#vanta-bg",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: isLight ? 0x0b3d91 : 0x3b82f6,
      backgroundColor: isLight ? 0xffffff : 0x030712,
      points: 10.00,
      maxDistance: 22.00,
      spacing: 16.00
    });
  }
  function setupTheme() {
    const toggle = document.getElementById("theme-toggle");
    const icon = document.querySelector(".theme-switch .icon");
    const savedTheme = localStorage.getItem("theme");

    const isLightOnLoad = savedTheme === "light";
    
    if (isLightOnLoad) {
      document.body.classList.add("light");
      if(toggle) toggle.checked = true;
      if(icon) icon.textContent = "☀️";
    }
    initVanta(isLightOnLoad);

    if (toggle) {
      toggle.addEventListener("change", () => {
        const isLight = toggle.checked;
        document.body.classList.toggle("light", isLight);
        initVanta(isLight);
        localStorage.setItem("theme", isLight ? "light" : "dark");
        if(icon) icon.textContent = isLight ? "☀️" : "🌙";
      });
    }
  }

  function setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-links li");
    const sections = document.querySelectorAll(".view-section");
    const sidebar = document.getElementById("sidebar");
    const mobileOpen = document.getElementById("mobile-menu-btn");
    const mobileClose = document.getElementById("mobile-menu-close");

    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        navLinks.forEach(n => n.classList.remove("active"));
        sections.forEach(s => s.classList.remove("active", "hidden")); 
        sections.forEach(s => {
           if(s.id !== link.dataset.target) {
              s.classList.add("hidden");
           }
        });
        link.classList.add("active");
        const targetSection = document.getElementById(link.dataset.target);
        if (targetSection) {
          targetSection.classList.remove("hidden");
          targetSection.classList.add("active");
          triggerSectionLoad(link.dataset.target);
        }
        if (window.innerWidth <= 900) {
          sidebar.classList.remove("open");
        }
      });
    });
    document.querySelectorAll(".stat-card").forEach(card => {
      card.addEventListener("click", () => {
        const target = card.dataset.link;
        const link = document.querySelector(`.nav-links li[data-target="${target}"]`);
        if (link) link.click();
      });
    });
    if(mobileOpen) mobileOpen.addEventListener("click", () => sidebar.classList.add("open"));
    if(mobileClose) mobileClose.addEventListener("click", () => sidebar.classList.remove("open"));
  }

  function triggerSectionLoad(sectionId) {
     if (sectionId === "apod" && window.apodLoaded !== true) {
        if (typeof loadAPOD === "function") loadAPOD();
     }
     else if (sectionId === "favorites") {
        if (typeof loadFavorites === "function") loadFavorites();
     }
     else if (sectionId === "iss" && window.issLoaded !== true) {
        if (typeof initISS === "function") initISS();
     }
  }
  function setupLightbox() {
    const modal = document.getElementById("lightbox-modal");
    const closeBtn = document.getElementById("close-lightbox");
    
    if(closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
      });
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
      });
    }
  }
  setupTheme();
  setupNavigation();
  setupLightbox();
  hideLoader();
});
window.openLightbox = function(url, caption = "") {
  const modal = document.getElementById("lightbox-modal");
  const img = document.getElementById("lightbox-img");
  const cap = document.getElementById("lightbox-caption");
  if(modal && img) {
    img.src = url;
    if(cap) cap.textContent = caption;
    modal.classList.remove("hidden");
  }
}
