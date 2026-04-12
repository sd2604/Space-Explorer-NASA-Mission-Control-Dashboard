/**
 * Mission Control shell — theme, navigation, section lazy-load hooks, lightbox.
 * Requires: api.js (window.nasaFetch), loader.js (hideLoader).
 */

window.API_KEY = window.API_KEY || "Cj3K2i5DrgI4SPecivHDskyVd8PdXHzAZu5yPyN3";

function initApp() {
  let vantaEffect;

  function initVanta(isLight) {
    if (typeof VANTA === "undefined" || !document.getElementById("vanta-bg")) return;
    if (vantaEffect) vantaEffect.destroy();
    vantaEffect = VANTA.NET({
      el: "#vanta-bg",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: isLight ? 0x0b3d91 : 0x3b82f6,
      backgroundColor: isLight ? 0xffffff : 0x030712,
      points: 10.0,
      maxDistance: 22.0,
      spacing: 16.0,
    });
  }

  function setupTheme() {
    const toggle = document.getElementById("theme-toggle");
    const icon = document.querySelector(".theme-switch .icon");
    const savedTheme = localStorage.getItem("theme");
    const isLightOnLoad = savedTheme === "light";

    if (isLightOnLoad) {
      document.body.classList.add("light");
      if (toggle) toggle.checked = true;
      if (icon) icon.textContent = "☀️";
    }
    initVanta(isLightOnLoad);

    if (toggle) {
      toggle.addEventListener("change", () => {
        const isLight = toggle.checked;
        document.body.classList.toggle("light", isLight);
        initVanta(isLight);
        localStorage.setItem("theme", isLight ? "light" : "dark");
        if (icon) icon.textContent = isLight ? "☀️" : "🌙";
      });
    }
  }

  function setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-links li[data-target]");
    const sections = document.querySelectorAll(".view-section");

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const targetId = link.dataset.target;
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    document.querySelectorAll(".stat-card[data-link]").forEach((card) => {
      card.addEventListener("click", () => {
        const targetId = card.dataset.link;
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -70% 0px",
      threshold: 0,
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const targetId = entry.target.id;

        navLinks.forEach((link) => {
          link.classList.toggle("active", link.dataset.target === targetId);
        });

        document.body.classList.toggle("dashboard-active", targetId === "dashboard");

        if (window.trackMissionAction) {
          window.trackMissionAction(targetId, 50);
        }

        sections.forEach((sec) => sec.classList.remove("section-focussed"));
        entry.target.classList.add("section-focussed");

        triggerSectionLoad(targetId);
      });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  }

  function setupMicroInteractions() {
    document.addEventListener("click", (e) => {
      const actionBtn = e.target.closest(
        "button:not(.mobile-only), .stat-card, .rover-card, .asteroid-card"
      );
      if (actionBtn) {
        actionBtn.style.transform = "scale(0.96)";
        setTimeout(() => {
          actionBtn.style.transform = "";
        }, 150);
      }
    });
  }

  function triggerSectionLoad(sectionId) {
    const loaders = {
      apod: () => {
        if (!window.apodLoaded && typeof loadAPOD === "function") loadAPOD();
      },
      favorites: () => {
        if (typeof loadFavorites === "function") loadFavorites();
      },
      iss: () => {
        if (!window.issLoaded && typeof window.initISS === "function") {
          window.initISS();
          window.issLoaded = true;
        }
      },
    };
    const fn = loaders[sectionId];
    if (fn) fn();
  }

  function setupLightbox() {
    const modal = document.getElementById("lightbox-modal");
    const closeBtn = document.getElementById("close-lightbox");
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
      });
    }
  }

  setupTheme();
  setupNavigation();
  setupLightbox();
  setupMicroInteractions();
  if (typeof hideLoader === "function") hideLoader();
}

document.addEventListener("DOMContentLoaded", initApp);

window.openLightbox = function openLightbox(url, caption = "") {
  const modal = document.getElementById("lightbox-modal");
  const img = document.getElementById("lightbox-img");
  const cap = document.getElementById("lightbox-caption");
  if (modal && img) {
    img.src = url;
    if (cap) cap.textContent = caption;
    modal.classList.remove("hidden");
  }
};
