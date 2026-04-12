/**
 * Shared utilities — geo, strings, number tweening.
 */

(function initUtils() {
  const EARTH_RADIUS_KM = 6371;

  function haversineKm(lat1, lon1, lat2, lon2) {
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return EARTH_RADIUS_KM * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  function initialsFromName(name) {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Parses Where The ISS payload into normalized numbers.
   */
  function parseIssTelemetry(data) {
    const lat = Number(data.latitude);
    const lng = Number(data.longitude);
    const altitudeKm = Number(data.altitude);
    const velocityKms = Number(data.velocity);
    if (![lat, lng, altitudeKm, velocityKms].every(Number.isFinite)) {
      throw new Error("Invalid ISS telemetry fields");
    }
    return {
      latitude: lat,
      longitude: lng,
      altitudeKm,
      velocityKmh: velocityKms * 3600,
    };
  }

  function filterIssCrewPeople(peopleArray) {
    if (!Array.isArray(peopleArray)) return [];
    return peopleArray
      .filter((p) => p && p.craft === "ISS" && p.name)
      .map((p) => p.name);
  }

  /**
   * Smooth numeric display tween. Returns cancel function.
   */
  function tweenNumber(element, from, to, format, durationMs = 500) {
    if (!element) return () => {};
    let cancelled = false;
    const startVal = from != null && Number.isFinite(from) ? from : to;
    const t0 = performance.now();

    function frame(now) {
      if (cancelled) return;
      const u = Math.min((now - t0) / durationMs, 1);
      const eased = 1 - (1 - u) ** 3;
      const v = startVal + (to - startVal) * eased;
      element.textContent = format(v);
      if (u < 1) requestAnimationFrame(frame);
      else element.textContent = format(to);
    }
    requestAnimationFrame(frame);
    return () => {
      cancelled = true;
    };
  }

  window.SpaceExplorerUtils = {
    EARTH_RADIUS_KM,
    haversineKm,
    initialsFromName,
    parseIssTelemetry,
    filterIssCrewPeople,
    tweenNumber,
  };
})();
