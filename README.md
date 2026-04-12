# Space Explorer — NASA Mission Control Dashboard

A futuristic, space-themed web application that allows users to explore real-time space data using NASA APIs and live satellite tracking. The interface simulates a **Mission Control Dashboard**, providing an immersive and interactive experience.

---

## Project Description

**Space Explorer — NASA Mission Control** is a dynamic web application that integrates multiple space APIs to display real-time data.

Users can:

* View NASA’s **Astronomy Picture of the Day (APOD)**
* Explore **Near-Earth Asteroids**
* Track the **International Space Station (ISS)** in real-time
* Search, filter, and sort space data
* Save favorites using local storage

The application features a **modern, cinematic UI** with smooth animations and a space-inspired design.

---

## Purpose

This project demonstrates:

* API integration using JavaScript (Fetch API)
* Asynchronous programming (`async/await`)
* Use of array higher-order functions:

  * `map()`
  * `filter()`
  * `sort()`
  * `find()`
* Dynamic UI rendering
* Modular and scalable code architecture
* Responsive web design

---

## Features

### Astronomy Picture of the Day (APOD)

* Displays NASA’s daily image/video
* Includes title, date, and description

---

### Asteroid Explorer

* Displays near-Earth asteroid data
* Features:

  * Search functionality
  * Filtering (hazardous / non-hazardous)
  * Sorting (distance, size, speed)
* Built using array higher-order functions

---

### ISS Live Command Center (Main Feature)

* Real-time ISS tracking:

  * Latitude & Longitude
  * Velocity
  * Altitude
* Crew onboard display
* Auto-refresh every few seconds
* Sound toggle system
* Animated space UI (orbit scan + glow effects)

---

### Favorites System

* Save APOD and asteroid items
* Stored using **localStorage**

---

### UI/UX

* Dark space-themed design
* Neon glow + glassmorphism effects
* Smooth animations and transitions
* Fully responsive layout

---

## Bonus Features Implemented

* Loading indicators during API calls
* Local Storage (favorites & preferences)
* Debouncing (optimized search)
* Modular architecture (clean code structure)
* Smooth animations and transitions

---

## Technologies Used

* **HTML** — Structure
* **CSS** — Styling & animations
* **JavaScript (ES6+)** — Functionality
* **Fetch API** — API requests
* **NASA APIs** — Space data
* **Local Storage** — Data persistence

---

## APIs Used

* https://api.nasa.gov/planetary/apod
* https://api.nasa.gov/neo/rest/v1/feed
* https://api.wheretheiss.at/v1/satellites/25544
* https://api.open-notify.org/astros.json

---

##  Project Structure

```bash
space-explorer/
│
├── index.html
|--iss.html
│
├── assets/
│   └── videos/
│       ├── earthvideo.mp4
│       └── spacevideo.mp4
│
├── style_files/
│   ├── main.css
│   ├── apod.css
│   ├── asteroid.css
│   ├── iss.css
│
├── script_files/
│   ├── main.js
│   ├── api.js
│   ├── ui.js
│   ├── utils.js
│   │
│   ├── scripts/
│   │   ├── apod.js
│   │   ├── asteroid.js
│   │   ├── iss.js
│   │   └── favorites.js
│
└── README.md
```

---

## Setup & Installation

### Prerequisites

* Modern browser (Chrome, Edge, Firefox)
* Internet connection
* Optional: VS Code

---

### Installation

```bash
git clone https://github.com/your-username/space-explorer.git
cd space-explorer
```

---

### Running the App

#### Method 1 — Open Directly

* Open `index.html` in your browser

#### Method 2 — Live Server (Recommended)

* Install Live Server in VS Code
* Right-click `index.html`
* Click **Open with Live Server**

---

## NASA API Key Setup

1. Get your API key:
    https://api.nasa.gov/

2. Add in your code:

```js
const API_KEY = "Cj3K2i5DrgI4SPecivHDskyVd8PdXHzAZu5yPyN3";
```

---

##  Deployment

The project is deployed using **Netlify / GitHub Pages**

 Live Demo: **(https://nasaspaceexplorer.netlify.app/)**

---

## Responsiveness

* Mobile 
* Tablet 
* Desktop 

---

## Key Learnings

* Handling real-time API data
* Modular JavaScript architecture
* Debugging API and deployment issues
* Performance optimization techniques
* UI/UX design for dashboards

---

## Author

**Shreya Das**

---

## Submission

Final Submission Date: **12th April**

---

##  Future Improvements

* 3D Earth Globe visualization
* ISS orbit prediction path
* Advanced sound system
* AI-based space insights

---

 This project combines real-time data, modern UI, and interactive features to simulate a futuristic space mission control dashboard.



