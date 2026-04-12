/**
 * ISS Command Center — DOM rendering helpers (no fetch logic).
 * Expects cached element references from the caller.
 */

(function initIssUi() {
  const U = window.SpaceExplorerUtils;

  function pulseElement(el) {
    if (!el) return;
    el.classList.remove("telemetry-metric--pulse");
    void el.offsetWidth;
    el.classList.add("telemetry-metric--pulse");
  }

  function pulsePanel(el, pulseClass) {
    if (!el || !pulseClass) return;
    el.classList.remove(pulseClass);
    void el.offsetWidth;
    el.classList.add(pulseClass);
  }

  function setIssConnectionUi(refs, ok, message) {
    const { statusText, connectionStatus, radarPingText, scanIcon } = refs;
    if (statusText) statusText.textContent = message || (ok ? "Orbiting Earth" : "Connection lost");
    if (connectionStatus) {
      connectionStatus.style.background = ok
        ? "rgba(16, 185, 129, 0.12)"
        : "rgba(239, 68, 68, 0.12)";
      connectionStatus.style.color = ok ? "#10b981" : "#f87171";
    }
    const dot = connectionStatus?.querySelector(".pulse-dot");
    if (dot) dot.style.backgroundColor = ok ? "#10b981" : "#ef4444";
    if (radarPingText) {
      if (!ok) radarPingText.textContent = "Connection lost — retrying…";
      else
        radarPingText.textContent = refs.telemetryLive ? "Live tracking" : "Scanning orbit…";
    }
    if (scanIcon) {
      if (ok) scanIcon.classList.add("fa-spin");
      else scanIcon.classList.remove("fa-spin");
    }
  }

  /**
   * Updates telemetry numbers with optional tween (uses utils.tweenNumber).
   */
  function renderIssTelemetryValues(refs, prev, next, tweenState) {
    const fmtLat = (n) => n.toFixed(4);
    const fmtLng = (n) => n.toFixed(4);
    const fmtVel = (n) => String(Math.round(n));
    const fmtAlt = (n) => String(Math.round(n));

    ["latCancel", "lngCancel", "velCancel", "altCancel"].forEach((k) => {
      if (typeof tweenState[k] === "function") tweenState[k]();
    });

    tweenState.latCancel = U.tweenNumber(refs.latEl, prev.latitude, next.latitude, fmtLat);
    tweenState.lngCancel = U.tweenNumber(refs.lngEl, prev.longitude, next.longitude, fmtLng);
    tweenState.velCancel = U.tweenNumber(refs.velEl, prev.velocityKmh, next.velocityKmh, fmtVel);
    tweenState.altCancel = U.tweenNumber(refs.altEl, prev.altitudeKm, next.altitudeKm, fmtAlt);

    ["metric-velocity", "metric-latitude", "metric-longitude", "metric-altitude"].forEach((id) => {
      pulseElement(document.getElementById(id));
    });
  }

  function showTelemetryPlaceholder(refs) {
    const ph = "…";
    if (refs.latEl) refs.latEl.textContent = ph;
    if (refs.lngEl) refs.lngEl.textContent = ph;
    if (refs.velEl) refs.velEl.textContent = ph;
    if (refs.altEl) refs.altEl.textContent = ph;
  }

  function renderProximityAlert(alertEl, userCoords, lat, lng) {
    if (!alertEl || !userCoords) return;
    const d = U.haversineKm(lat, lng, userCoords.lat, userCoords.lng);
    if (d < 500) {
      alertEl.classList.remove("alert-hidden");
      alertEl.classList.add("alert-active");
    } else {
      alertEl.classList.remove("alert-active");
      alertEl.classList.add("alert-hidden");
    }
  }

  function renderCrewLoading(crewListEl) {
    if (!crewListEl) return;
    crewListEl.innerHTML = `
      <div class="crew-state crew-state--loading">
        <i class="fa-solid fa-satellite-dish fa-spin" aria-hidden="true"></i>
        <span>Scanning for crew…</span>
      </div>`;
  }

  function renderCrewError(crewListEl, crewCountEl) {
    if (crewCountEl) crewCountEl.textContent = "0";
    if (!crewListEl) return;
    crewListEl.innerHTML = `
      <div class="crew-state crew-state--error" role="alert">
        Unable to fetch crew — retrying on next cycle
      </div>`;
  }

  function renderCrewCards(crewListEl, crewCountEl, names) {
    if (!crewListEl || !crewCountEl) return;
    crewCountEl.textContent = String(names.length);
    crewListEl.replaceChildren();

    if (names.length === 0) {
      const empty = document.createElement("div");
      empty.className = "crew-state crew-state--empty";
      empty.textContent = "No ISS crew listed.";
      crewListEl.appendChild(empty);
      return;
    }

    names.forEach((name, i) => {
      const card = document.createElement("article");
      card.className = "crew-card";
      card.style.animationDelay = `${i * 0.055}s`;

      const avatar = document.createElement("div");
      avatar.className = "crew-avatar";
      avatar.textContent = U.initialsFromName(name);
      avatar.setAttribute("aria-hidden", "true");

      const body = document.createElement("div");
      body.className = "crew-card__body";
      const nameEl = document.createElement("div");
      nameEl.className = "crew-name";
      nameEl.textContent = name;
      const role = document.createElement("div");
      role.className = "crew-role";
      role.textContent = "ISS crew";
      body.append(nameEl, role);
      card.append(avatar, body);
      crewListEl.appendChild(card);
    });
  }

  window.IssUi = {
    pulseElement,
    pulsePanel,
    setIssConnectionUi,
    renderIssTelemetryValues,
    showTelemetryPlaceholder,
    renderProximityAlert,
    renderCrewLoading,
    renderCrewError,
    renderCrewCards,
  };
})();
