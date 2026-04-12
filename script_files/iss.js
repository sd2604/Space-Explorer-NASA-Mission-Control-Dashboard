document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const latElement = document.getElementById("iss-lat");
    const lngElement = document.getElementById("iss-lng");
    const velElement = document.getElementById("iss-velocity");
    const statusText = document.getElementById("status-text");
    const radarPingText = document.getElementById("radar-ping-text");
    const scanIcon = document.getElementById("scan-icon");
    const connectionStatus = document.getElementById("iss-connection-status");
    const locationAlert = document.getElementById("location-alert");
    const crewContainer = document.getElementById("crew-container");
    const crewCount = document.getElementById("crew-count");
  
    // 3D Globe Vars
    let globe;
    let orbitTrail = [];
    const MAX_TRAIL_LENGTH = 100;
    let currentMarkerPos = null;
    let userCoords = null;
  
    // Vanta Gamified Dashboard Init
    if (typeof VANTA !== 'undefined' && document.getElementById("vanta-bg")) {
        VANTA.NET({
            el: "#vanta-bg",
            mouseControls: true,
            touchControls: true,
            scale: 1.00,
            color: 0x3b82f6,
            backgroundColor: 0x030712,
            points: 10.00,
            maxDistance: 22.00,
            spacing: 16.00
        });
    }
  
    function getRandomFluctuation(base, range) {
      return (base + (Math.random() * range - range/2)).toFixed(0);
    }
  
    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; 
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      return R * c;
    }
  
    // 3D Globe WebGL Setup replacing Leaflet
    function initializeGlobe() {
      const container = document.getElementById('globe-container');
      if (!container) return;

      globe = Globe()(container)
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
        .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
        .showAtmosphere(true)
        .atmosphereColor('#0ea5e9')
        .atmosphereAltitude(0.15)
        
        // Define Custom Glowing ISS Marker (HTML marker superimposed on Globe)
        .htmlElementsData([])
        .htmlElement(d => {
            const el = document.createElement('div');
            el.className = 'iss-glowing-marker';
            return el;
        })
        .htmlAltitude(0.2) // Float above globe

        // Path renderer for Orbit Trail (Cyan glow)
        .pathData([])
        .pathPointLat(p => p.lat)
        .pathPointLng(p => p.lng)
        .pathColor(() => '#00d4ff')
        .pathDashLength(0.01)
        .pathDashGap(0.004)
        .pathDashAnimateTime(100000)
        .pathStroke(2);

      // Setup initial camera pos and auto-rotate behavior
      globe.controls().autoRotate = false;
      globe.controls().enableZoom = true;
      globe.pointOfView({ altitude: 2.5 });

      // Handle Resize bounds
      window.addEventListener('resize', () => {
          if(globe) globe.width(container.clientWidth).height(container.clientHeight);
      });
      setTimeout(() => globe.width(container.clientWidth).height(container.clientHeight), 100);
    }
  
    function locateUser() {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
            }, 
            () => console.warn("Location denied. 'Over-your-city' alert disabled.")
        );
      }
    }
  
    async function updateISSTelemetry() {
      try {
        // Fetch from newer ISS API endpoint specific to prompt
        const response = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        if (!response.ok) throw new Error("API Offline");
        
        const data = await response.json();
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        const altitude = parseFloat(data.altitude);
  
        // UI Dashboard Stats
        latElement.textContent = lat.toFixed(4);
        lngElement.textContent = lng.toFixed(4);
        velElement.textContent = getRandomFluctuation(27600, 100); // Cinematic Velocity jitter
  
        statusText.textContent = "Orbiting Earth";
        connectionStatus.style.background = "rgba(16, 185, 129, 0.1)";
        connectionStatus.style.color = "#10b981";
        document.querySelector(".pulse-dot").style.backgroundColor = "#10b981";
        
        // Push coordinate to trailing array limit dynamically
        orbitTrail.push({ lat, lng });
        if (orbitTrail.length > MAX_TRAIL_LENGTH) orbitTrail.shift();

        // 3D Rendering Overwrites
        if (globe) {
            // Update the superimposed HTML Marker location
            globe.htmlElementsData([{ lat, lng, alt: altitude/1000 }]);
            
            // Rebuild Path Arcs to visualize tracing
            globe.pathData([orbitTrail]);

            // Interpolate the WebGL Camera smoothly keeping ISS centered softly
            globe.pointOfView({ lat, lng, altitude: 2.5 }, 2000); 
        }
  
        // Gamified over-location alerts utilizing native lat/lng 
        if (userCoords) {
           const distance = calculateDistance(lat, lng, userCoords.lat, userCoords.lng);
           if (distance < 500) {
               locationAlert.classList.remove("alert-hidden");
               locationAlert.classList.add("alert-active");
           } else {
               locationAlert.classList.remove("alert-active");
               locationAlert.classList.add("alert-hidden");
           }
        }
  
        // Radar text blink effect
        radarPingText.textContent = "Coordinate Sync...";
        scanIcon.style.color = "#fff";
        setTimeout(() => {
            radarPingText.textContent = "Scanning orbit...";
            scanIcon.style.color = "#0ea5e9";
        }, 800);
  
      } catch (err) {
        console.error("ISS Fetch Error:", err);
        statusText.textContent = "Connection lost with ISS";
        connectionStatus.style.background = "rgba(239, 68, 68, 0.1)";
        connectionStatus.style.color = "#ef4444";
        document.querySelector(".pulse-dot").style.backgroundColor = "#ef4444";
        radarPingText.textContent = "Signal Lost...";
        scanIcon.classList.remove("fa-spin");
      }
    }
  
    // Fetch Astronauts onboard
    async function loadCrew() {
        try {
            crewContainer.innerHTML = `<div style="color: #94a3b8; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Uplinking manifest...</div>`;
            const response = await fetch("http://api.open-notify.org/astros.json");
            if (!response.ok) throw new Error("Manifest Error");
            
            const data = await response.json();
            const issCrew = data.people.filter(person => person.craft === "ISS");
            
            crewCount.textContent = issCrew.length;
            
            if (issCrew.length === 0) {
                crewContainer.innerHTML = `<div style="color: #94a3b8; padding: 20px;">No crew currently documented.</div>`;
                return;
            }
            
            crewContainer.innerHTML = issCrew.map((astronaut, i) => `
               <div class="crew-card" style="animation: fadeIn 0.5s ease-in-out forwards; animation-delay: ${i * 0.1}s; opacity: 0;">
                  <div class="crew-icon"><i class="fa-solid fa-user-astronaut"></i></div>
                  <div class="crew-name">${astronaut.name}</div>
                  <div class="crew-role">ISS CREW</div>
               </div>
            `).join("");
            
        } catch (err) {
            crewContainer.innerHTML = `<div style="color: #ef4444; padding: 20px;"><i class="fa-solid fa-triangle-exclamation"></i> Manifest fetch failed.</div>`;
        }
    }
  
    // Execute Boot Sequence
    initializeGlobe();
    locateUser();
    loadCrew();
    
    // Auto-Polling Interval logic
    updateISSTelemetry();
    setInterval(updateISSTelemetry, 5000);
});
