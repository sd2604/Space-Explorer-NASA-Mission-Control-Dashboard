const API_KEY = "Cj3K2i5DrgI4SPecivHDskyVd8PdXHzAZu5yPyN3";

const apodContainer = document.getElementById("apod-content");
const dateInput = document.getElementById("date-input");
const searchBtn = document.getElementById("search-btn");

loadAPOD();

async function loadAPOD(date = "") {

  apodContainer.innerHTML = "Loading... 🚀";

  let url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;

  if (date) {
    url += `&date=${date}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    apodContainer.innerHTML = `
      <h3>${data.title}</h3>
      <img src="${data.url}" alt="${data.title}">
      <p>${data.explanation}</p>
      <p><strong>Date:</strong> ${data.date}</p>
    `;
  }
  catch (error) {
    apodContainer.innerHTML = "❌ Failed to load data.";
  }
}
searchBtn.addEventListener("click", () => {

  const selectedDate = dateInput.value;

  if (!selectedDate) {
    alert("Please select a date!");
    return;
  }

  loadAPOD(selectedDate);
});