/**
 * ISS tracking — dedicated Command Center page + optional embedded dashboard strip.
 * Depends: SpaceExplorerApi, SpaceExplorerUtils, IssUi (load api.js, utils.js, ui.js first).
 */

(function initIssModule() {
  const Api = () => window.SpaceExplorerApi;
  const U = () => window.SpaceExplorerUtils;
  const Ui = () => window.IssUi;

  const TICK_MS = 5000;
  const CREW_EVERY_N_TICKS = 12;
  const AMBIENT_SRC =
    "https://assets.mixkit.co/active_storage/sfx/2093/2093-preview.mp3";
  const SOUND_KEY = "iss_ambient_sound_enabled";

  function createIssPageState() {
    return {
      iss: {
        latitude: null,
        longitude: null,
        velocityKmh: null,
        altitudeKm: null,
        connected: false,
        lastError: null,
      },
      crew: { names: [], signature: null, primed: false },
      isSoundOn: false,
      telemetryLive: false,
    };
  }

  function cacheDedicatedDom() {
    return {
      latEl: document.getElementById("latitude"),
      lngEl: document.getElementById("longitude"),
      velEl: document.getElementById("velocity"),
      altEl: document.getElementById("altitude"),
      statusText: document.getElementById("status-text"),
      radarPingText: document.getElementById("radar-ping-text"),
      scanIcon: document.getElementById("scan-icon"),
      connectionStatus: document.getElementById("iss-connection-status"),
      telemetryPanel: document.getElementById("iss-telemetry-panel"),
      globePanel: document.getElementById("iss-globe-panel"),
      locationAlert: document.getElementById("location-alert"),
      crewListEl: document.getElementById("crew-list"),
      crewCountEl: document.getElementById("crew-count"),
      crewPanel: document.getElementById("iss-crew-panel"),
      telemetryLive: false,
    };
  }

  function initGlobe(ctx) {
    const container = document.getElementById("globe-container");
    if (!container || typeof Globe !== "function") return null;

    const globe = Globe()(container)
      .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
      .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")
      .showAtmosphere(true)
      .atmosphereColor("#38bdf8")
      .atmosphereAltitude(0.18)
      .htmlElementsData([])
      .htmlElement(() => {
        const el = document.createElement("div");
        el.className = "iss-glowing-marker";
        return el;
      })
      .htmlAltitude((d) => (d && Number.isFinite(d.alt) ? d.alt : 0.12))
      .pathData([])
      .pathPointLat((p) => p.lat)
      .pathPointLng((p) => p.lng)
      .pathColor(() => "#22d3ee")
      .pathDashLength(0.01)
      .pathDashGap(0.004)
      .pathDashAnimateTime(120000)
      .pathStroke(2);

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.enableZoom = true;
    globe.pointOfView({ altitude: 2.45 });

    const onResize = () => {
      globe.width(container.clientWidth).height(container.clientHeight);
    };
    window.addEventListener("resize", onResize);
    requestAnimationFrame(onResize);

    return { globe, orbitTrail: [], onResize, container };
  }

  function updateGlobeView(globeCtx, lat, lng, altitudeKm) {
    if (!globeCtx?.globe) return;
    const R = U().EARTH_RADIUS_KM;
    const altFrac = Math.min(0.2, Math.max(0.025, altitudeKm / R));
    globeCtx.orbitTrail.push({ lat, lng });
    if (globeCtx.orbitTrail.length > 100) globeCtx.orbitTrail.shift();
    globeCtx.globe.htmlElementsData([{ lat, lng, alt: altFrac }]);
    globeCtx.globe.pathData([globeCtx.orbitTrail]);
    globeCtx.globe.pointOfView({ lat, lng, altitude: 2.35 }, 2200);
  }

  function setupSound(state) {
    const btn = document.getElementById("audio-toggle-btn");
    if (!btn || btn.dataset.issSoundBound === "1") return;
    btn.dataset.issSoundBound = "1";

    const iconEl = btn.querySelector(".hud-audio-btn__icon");
    const labelEl = btn.querySelector(".hud-audio-btn__label");
    const audio = new Audio(AMBIENT_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;

    state.isSoundOn = localStorage.getItem(SOUND_KEY) === "true";
    const TARGET = 0.32;
    let fadeRaf = null;

    const ramp = (from, to, onDone) => {
      if (fadeRaf) cancelAnimationFrame(fadeRaf);
      const t0 = performance.now();
      const dur = 420;
      const step = (now) => {
        const u = Math.min((now - t0) / dur, 1);
        const e = 1 - (1 - u) ** 2;
        audio.volume = from + (to - from) * e;
        if (u < 1) fadeRaf = requestAnimationFrame(step);
        else {
          fadeRaf = null;
          if (onDone) onDone();
        }
      };
      fadeRaf = requestAnimationFrame(step);
    };

    const syncBtn = () => {
      btn.classList.toggle("audio-on", state.isSoundOn);
      btn.setAttribute("aria-pressed", state.isSoundOn ? "true" : "false");
      if (labelEl) labelEl.textContent = state.isSoundOn ? "Sound ON" : "Sound OFF";
      if (iconEl) {
        iconEl.classList.toggle("fa-volume-xmark", !state.isSoundOn);
        iconEl.classList.toggle("fa-volume-high", state.isSoundOn);
      }
    };

    async function playWithFade() {
      audio.volume = 0;
      try {
        await audio.play();
        ramp(0, TARGET);
      } catch {
        console.warn("[ISS] Audio needs user gesture");
      }
    }

    audio.addEventListener("play", syncBtn);
    audio.addEventListener("pause", syncBtn);

    if (state.isSoundOn) playWithFade();
    syncBtn();

    btn.addEventListener("click", async () => {
      if (!state.isSoundOn) {
        state.isSoundOn = true;
        localStorage.setItem(SOUND_KEY, "true");
        await playWithFade();
        syncBtn();
        return;
      }
      if (audio.paused) {
        await playWithFade();
        syncBtn();
        return;
      }
      ramp(audio.volume, 0, () => {
        audio.pause();
        state.isSoundOn = false;
        localStorage.setItem(SOUND_KEY, "false");
        syncBtn();
      });
    });

    return () => {
      if (fadeRaf) cancelAnimationFrame(fadeRaf);
    };
  }

  async function fetchIssDataNormalized() {
    const raw = await Api().fetchIssSatellite();
    return U().parseIssTelemetry(raw);
  }

  async function fetchCrewNames() {
    const raw = await Api().fetchCrewManifest();
    return U().filterIssCrewPeople(raw.people);
  }

  function initIssCommandCenterPage() {
    if (window.__issDedicatedInit) return;
    window.__issDedicatedInit = true;

    const state = createIssPageState();
    const refs = cacheDedicatedDom();
    if (!refs.latEl || !refs.crewListEl) {
      console.error("[ISS] Dedicated page DOM incomplete.");
      return;
    }

    Ui().showTelemetryPlaceholder(refs);

    const tweenState = {
      latCancel: null,
      lngCancel: null,
      velCancel: null,
      altCancel: null,
    };

    const globeCtx = initGlobe();

    let userCoords = null;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        },
        () => {}
      );
    }

    let tickIndex = 0;
    let busy = false;
    let timerId = null;

    async function refreshIss() {
      const r = { ...refs, telemetryLive: state.telemetryLive };
      try {
        const next = await fetchIssDataNormalized();
        const prev = {
          latitude: state.iss.latitude,
          longitude: state.iss.longitude,
          velocityKmh: state.iss.velocityKmh,
          altitudeKm: state.iss.altitudeKm,
        };
        Object.assign(state.iss, {
          ...next,
          connected: true,
          lastError: null,
        });
        if (!state.telemetryLive) state.telemetryLive = true;
        Ui().renderIssTelemetryValues(refs, prev, next, tweenState);
        Ui().setIssConnectionUi({ ...r, telemetryLive: state.telemetryLive }, true);
        Ui().renderProximityAlert(refs.locationAlert, userCoords, next.latitude, next.longitude);
        Ui().pulsePanel(refs.telemetryPanel, "telemetry-panel--pulse");
        Ui().pulsePanel(refs.globePanel, "globe-panel--pulse");
        updateGlobeView(globeCtx, next.latitude, next.longitude, next.altitudeKm);
      } catch (err) {
        console.error("[ISS]", err);
        state.iss.connected = false;
        state.iss.lastError = err.message;
        Ui().setIssConnectionUi({ ...refs, telemetryLive: state.telemetryLive }, false);
        Ui().showTelemetryPlaceholder(refs);
      }
    }

    async function refreshCrew() {
      if (!state.crew.primed) Ui().renderCrewLoading(refs.crewListEl);
      try {
        const names = await fetchCrewNames();
        const sig = names.join("\0");
        if (sig === state.crew.signature && state.crew.primed) return;
        state.crew.signature = sig;
        state.crew.names = names;
        state.crew.primed = true;
        Ui().renderCrewCards(refs.crewListEl, refs.crewCountEl, names);
        Ui().pulsePanel(refs.crewPanel, "crew-panel--pulse");
      } catch (err) {
        console.error("[ISS] Crew", err);
        if (!state.crew.primed) Ui().renderCrewError(refs.crewListEl, refs.crewCountEl);
        state.crew.primed = true;
      }
    }

    async function tick() {
      if (busy) return;
      busy = true;
      try {
        await refreshIss();
        tickIndex += 1;
        if (tickIndex === 1 || tickIndex % CREW_EVERY_N_TICKS === 0) {
          await refreshCrew();
        }
      } finally {
        busy = false;
      }
    }

    setupSound(state);

    timerId = window.setInterval(tick, TICK_MS);
    tick();

    window.addEventListener("beforeunload", () => {
      if (timerId != null) clearInterval(timerId);
    });
  }

  function initEmbeddedIssStrip() {
    if (window.__issEmbeddedInit) return;
    const latEl = document.getElementById("iss-lat");
    const lngEl = document.getElementById("iss-lng");
    const velEl = document.getElementById("iss-vel");
    const altEl = document.getElementById("iss-alt");
    if (!latEl || !lngEl || !velEl || !altEl) return;
    window.__issEmbeddedInit = true;

    let timerId = null;
    let busy = false;

    async function update() {
      if (busy) return;
      busy = true;
      try {
        const t = await fetchIssDataNormalized();
        latEl.textContent = t.latitude.toFixed(4);
        lngEl.textContent = t.longitude.toFixed(4);
        velEl.textContent = `${Math.round(t.velocityKmh)} km/h`;
        altEl.textContent = `${Math.round(t.altitudeKm)} km`;
        const ph = document.getElementById("iss-map-placeholder");
        if (ph) {
          const sub = ph.querySelector("p");
          if (sub) sub.textContent = "Live telemetry";
        }
      } catch (e) {
        console.error("[ISS] Embedded", e);
        latEl.textContent = "—";
        lngEl.textContent = "—";
        velEl.textContent = "—";
        altEl.textContent = "—";
      } finally {
        busy = false;
      }
    }

    timerId = setInterval(update, TICK_MS);
    update();
    window.addEventListener("beforeunload", () => clearInterval(timerId));
  }

  /**
   * Called from main app when user scrolls to ISS section (lazy start).
   */
  function initISS() {
    initEmbeddedIssStrip();
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("globe-container")) {
      initIssCommandCenterPage();
    }
  });

  window.initISS = initISS;
})();
