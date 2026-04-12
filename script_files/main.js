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
    const mobileOpen = document.getElementById("mobile-menu-btn");
    
    // Smooth scroll wiring
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        const targetId = link.dataset.target;
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Dashboard card reroutes
    document.querySelectorAll(".stat-card").forEach(card => {
      card.addEventListener("click", () => {
        const targetId = card.dataset.link;
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // IntersectionObserver to auto-track scroll hooks
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -70% 0px', // Hook tight so snap always engages instantly
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                
                navLinks.forEach(link => {
                    link.classList.toggle("active", link.dataset.target === targetId);
                });
                
                // Lock the spacevideo backend ON if we drop back to dashboard
                if (targetId === "dashboard") {
                    document.body.classList.add("dashboard-active");
                } else {
                    document.body.classList.remove("dashboard-active");
                }
                
                // Track Gamification (Award points + badges)
                if (window.trackMissionAction) {
                    window.trackMissionAction(targetId, 50);
                }

                // Add transition active class for smooth section focus fade
                sections.forEach(sec => sec.classList.remove("section-focussed"));
                entry.target.classList.add("section-focussed");
                
                triggerSectionLoad(targetId);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
  }

  function setupMicroInteractions() {
    // Basic ripple and scale effect on global interactive buttons and cards
    document.addEventListener("click", (e) => {
        const actionBtn = e.target.closest("button:not(.mobile-only), .stat-card, .rover-card, .asteroid-card");
        if (actionBtn) {
            // Apply quick click-pop scale
            actionBtn.style.transform = "scale(0.96)";
            setTimeout(() => {
                actionBtn.style.transform = "";
            }, 150);
        }
    });
  }

  function triggerSectionLoad(sectionId) {
     const registry = {
        "apod": () => { if (!window.apodLoaded && typeof loadAPOD === "function") loadAPOD(); },
        "favorites": () => { if (typeof loadFavorites === "function") loadFavorites(); },
        "iss": () => { if (!window.issLoaded && typeof initISS === "function") initISS(); }
     };
     
     if (registry[sectionId]) registry[sectionId]();
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
  setupMicroInteractions();
  hideLoader();
});

// NASA Utilities
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

/**
 * Global HTTP Fetch Wrapper unifying NASA API Error & Rate Limit structures.
 * Returns parsed JSON if successful, or throws a sanitized Error.
 */
window.nasaFetch = async function(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (res.status === 429) {
       const isDemo = window.API_KEY === "DEMO_KEY";
       let msg = "NASA API Rate Limit Exceeded (429). Please try again later.";
       if (isDemo) msg += " You are using the default DEMO_KEY which has strict limits.";
       throw new Error(msg);
    }
    if (!res.ok || data.error || (data.code && data.code !== 200)) {
       throw new Error(data.error?.message || data.msg || `HTTP Error ${res.status}`);
    }
    
    return data;
  } catch(e) {
    console.error("NASA Fetch Exception:", e);
    throw e;
  }
}
