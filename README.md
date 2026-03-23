# Space-Explorer-NASA-Mission-Control-Dashboard

PROJECT DESCRIPTION
Space Explorer — NASA Mission Control is a web application that allows users to explore real-time space data provided by NASA’s public APIs. The application displays the Astronomy Picture of the Day, Mars rover photographs, and information about near-Earth asteroids. Users can search, filter, and sort the data, as well as save their favorite items. The interface will be designed with a space-themed dashboard to simulate a mission control experience.

PURPOSE
The purpose of this project is to demonstrate API integration, dynamic data handling, and interactive UI development using JavaScript. It provides users with educational and engaging space-related information while showcasing modern web development concepts such as asynchronous programming, array higher-order functions, and responsive design.

PUBLIC API SELECTED
Links:

https://api.nasa.gov/planetary/apod
https://api.nasa.gov/mars-photos/api/v1/rovers
https://api.nasa.gov/neo/rest/v1/feed

FEATURES
The application will include the following features:

Display Astronomy Picture of the Day with description
Mars Rover Photo Explorer with rover selection
Near-Earth Asteroid Tracker
Search by date or keywords
Filtering options (e.g., rover type, camera, hazardous asteroids)
Sorting options (e.g., date, size, distance)
Favorite/Bookmark functionality
Responsive design for mobile, tablet, and desktop
Loading indicators during API calls
Dark space-themed user interface

TECHNOLOGIES

HTML5 for structure
CSS for styling
JavaScript (ES6+) for functionality
Fetch API for data retrieval
NASA Public APIs for real-time space data
Local Storage for saving user preferences

HOW TO SET UP AND RUN THE PROJECT

Prerequisites:

A modern web browser (Chrome, Edge, Firefox, etc.)
Internet connection (required for API requests)
Code editor such as Visual Studio Code (optional)

Setup Instructions:

Clone or download the project repository:
git clone https://github.com/your-username/space-explorer.git

OR download the ZIP file and extract it.

Navigate to the project folder:
cd space-explorer
Open the project in a code editor (optional):
code .

Running the Application:

Method 1 — Open Directly (Simplest)

Open the index.html file in any web browser.
Double-click the file
OR right-click → Open With → Browser

Method 2 — Using Live Server (Recommended)

If using Visual Studio Code:
Install the Live Server extension
Right-click on index.html
Click "Open with Live Server"

This will start a local development server and automatically refresh changes.

NASA API Key Setup:
Obtain a free API key from:

https://api.nasa.gov/

Replace the placeholder in the JavaScript file:
const API_KEY = "YOUR_API_KEY";

Internet Requirement:
The application requires an active internet connection to fetch real-time data from NASA’s public APIs.


The project supports search, filtering, and sorting functionalities using JavaScript array higher-order functions such as map, filter, find, and sort. Interactive buttons will allow users to mark items as favorites. The application will be responsive and dynamically update content based on user input.






