/**
 * Centralized HTTP / API layer — NASA, Where The ISS, Open Notify.
 * Depends on window.API_KEY for NASA endpoints (set in HTML before this script).
 */

(function initApiModule() {
  const ISS_SATELLITE_URL = "https://api.wheretheiss.at/v1/satellites/25544";
  const CREW_API_URLS = [
    "https://api.open-notify.org/astros.json",
    "http://api.open-notify.org/astros.json",
  ];

  async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  /**
   * Generic fetch with retries and backoff.
   */
  async function fetchWithRetry(url, options = {}) {
    const { retries = 2, backoffMs = 800, parseJson = true } = options;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          lastError = new Error(`HTTP ${response.status}`);
          if (attempt < retries) await sleep(backoffMs * (attempt + 1));
          continue;
        }
        return parseJson ? response.json() : response;
      } catch (err) {
        lastError = err;
        if (attempt < retries) await sleep(backoffMs * (attempt + 1));
      }
    }
    throw lastError || new Error("Request failed");
  }

  /**
   * NASA APOD / NeoWs etc. — same contract as legacy window.nasaFetch.
   */
  async function nasaFetch(url) {
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (res.status === 429) {
        const isDemo = window.API_KEY === "DEMO_KEY";
        let msg = "NASA API Rate Limit Exceeded (429). Please try again later.";
        if (isDemo) msg += " You are using DEMO_KEY with strict limits.";
        throw new Error(msg);
      }
      if (!res.ok || data.error || (data.code && data.code !== 200)) {
        throw new Error(data.error?.message || data.msg || `HTTP Error ${res.status}`);
      }
      return data;
    } catch (e) {
      console.error("[API] NASA fetch:", e);
      throw e;
    }
  }

  async function fetchIssSatellite() {
    const data = await fetchWithRetry(ISS_SATELLITE_URL, { retries: 2, backoffMs: 600 });
    console.log("[API] ISS satellite:", data);
    return data;
  }

  async function fetchCrewManifest() {
    let lastErr;
    for (const url of CREW_API_URLS) {
      try {
        const data = await fetchWithRetry(url, { retries: 1, backoffMs: 500 });
        console.log("[API] Crew manifest:", data);
        return data;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("Crew API unreachable");
  }

  window.SpaceExplorerApi = {
    ISS_SATELLITE_URL,
    fetchIssSatellite,
    fetchCrewManifest,
    nasaFetch,
    fetchWithRetry,
  };

  window.nasaFetch = nasaFetch;
})();
