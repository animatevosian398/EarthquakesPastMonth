import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import "https://cdn.jsdelivr.net/npm/leaflet@1.9.3/+esm";

// Initialize the Leaflet map
var map = L.map("map").setView([10, 0], 2.2);

// Modify it to include the noWrap: true option:
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution:
    'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  subdomains: "abcd",
  maxZoom: 19,
  noWrap: true, // Prevents the map from repeating/wrapping horizontally
}).addTo(map);
// Layer group for earthquake markers
var earthquakeMarkers = L.layerGroup().addTo(map);

// Variables for animation control
var currentIndex = 0;
var animationSpeed = 100;
var data = null;
var earthquakesLoaded = false; // Track whether earthquakes are fully loaded
var animationTimeout = null; // Store the timeout reference for stopping animation

// Elements
var panToLargestButton = document.getElementById("panToLargestButton");
var backButton = document.getElementById("backButton");
var earthquakeInfoDiv = document.getElementById("earthquakeInfo");
var clockText = document.getElementById("clock-text");
var backButtonContainer = document.getElementById("backButtonContainer");
var clockContainer = document.getElementById("clock");

// Fetch and animate earthquake data
async function fetchAndAnimateEarthquakes() {
  try {
    const response = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
    );
    data = await response.json();

    // Sort earthquakes by time
    data.features.sort(
      (a, b) => new Date(a.properties.time) - new Date(b.properties.time)
    );

    // Start animation
    addEarthquakeMarker(currentIndex);

    earthquakesLoaded = true; // Mark earthquakes as loaded
  } catch (error) {
    console.error("Error fetching earthquake data:", error);
  }
}

// Function to add an earthquake marker
function addEarthquakeMarker(index) {
  if (index < data.features.length) {
    var earthquake = data.features[index];
    var coordinates = earthquake.geometry.coordinates;
    var magnitude = earthquake.properties.mag;
    var timestamp = new Date(earthquake.properties.time);
    var dayTime = timestamp.toLocaleString();

    var radius = magnitude * 2;
    var circle = L.circleMarker([coordinates[1], coordinates[0]], {
      radius: radius,
      fillColor: "blue",
      color: "transparent",
      fillOpacity: 0.4,
    });

    var popupContent = `
        <strong>Date and Time:</strong> ${dayTime}<br>
        <strong>Magnitude:</strong> ${magnitude}<br>
        <strong>Depth:</strong> ${coordinates[2]} km<br>
        `;

    circle.bindPopup(popupContent);
    circle.addTo(earthquakeMarkers);

    // Update the clock text
    clockText.textContent = "Earthquake Time: " + dayTime;

    currentIndex++;

    if (currentIndex < data.features.length) {
      // Store the timeout reference so we can cancel it later
      animationTimeout = setTimeout(
        addEarthquakeMarker,
        animationSpeed,
        currentIndex
      );
    }
  }
}

// Event listener for the "Pan to Largest Earthquake" button
panToLargestButton.addEventListener("click", function () {
  panToLargestButton.style.display = "none";

  if (!earthquakesLoaded) {
    earthquakeInfoDiv.innerHTML = `<p class="loading-text">Waiting for earthquake data to load...</p>`;
    return;
  }

  var largestMagnitudeIndex = findLargestMagnitudeIndex();

  if (largestMagnitudeIndex !== -1) {
    var largestEarthquake = data.features[largestMagnitudeIndex];
    var coordinates = largestEarthquake.geometry.coordinates;
    var zoomLevel = 12;

    map.setView([coordinates[1], coordinates[0]], zoomLevel);

    var largestEarthquakeTime = new Date(
      largestEarthquake.properties.time
    ).toLocaleString();

    // Update clock with the time of the largest earthquake
    clockText.textContent = "Earthquake Time: " + largestEarthquakeTime;

    earthquakeInfoDiv.innerHTML = `
          <p><strong>Magnitude:</strong> ${largestEarthquake.properties.mag}</p>
          <p><strong>Location:</strong> ${largestEarthquake.properties.place}</p>
          <p><strong>Coordinates:</strong> [${coordinates[1]}, ${coordinates[0]}]</p>
          <p><strong>Time:</strong> ${largestEarthquakeTime}</p>
      `;

    // Add a marker for the largest earthquake
    var circle = L.circleMarker([coordinates[1], coordinates[0]], {
      radius: largestEarthquake.properties.mag * 3, // Make it slightly larger for visibility
      fillColor: "orange", // Changed color to red to differentiate
      color: "#white", // white border
      weight: 1, // Border width
      fillOpacity: 0.7, // More opaque
    }).addTo(earthquakeMarkers);

    circle.bindPopup(`
        <strong>Date and Time:</strong> ${largestEarthquakeTime}<br>
        <strong>Magnitude:</strong> ${largestEarthquake.properties.mag}<br>
        <strong>Depth:</strong> ${coordinates[2]} km
    `);

    // Show the back button
    backButton.style.display = "block";
    backButtonContainer.style.display = "block";

    // Stop the animation of earthquake markers by clearing the timeout
    if (animationTimeout) {
      clearTimeout(animationTimeout);
      animationTimeout = null;
    }
  } else {
    earthquakeInfoDiv.innerHTML = "<p>No earthquake data available.</p>";
  }
});

// Event listener for the "Back to Default View" button
backButton.addEventListener("click", function () {
  panToLargestButton.style.display = "block";

  // Set the map back to the default view
  map.setView([0, 0], 2); // Default zoom level and position

  // Reset the clock and earthquake info
  clockText.textContent = "Time";
  earthquakeInfoDiv.innerHTML = "";

  // Remove the current markers
  earthquakeMarkers.clearLayers();

  // Hide the back button
  backButton.style.display = "none";
  backButtonContainer.style.display = "none";

  // Restart the animation of earthquake markers from the beginning
  currentIndex = 0;
  fetchAndAnimateEarthquakes();
});

// Function to find the index of the largest earthquake
function findLargestMagnitudeIndex() {
  if (data && data.features) {
    let largestMagnitude = -1;
    let largestMagnitudeIndex = -1;

    for (let i = 0; i < data.features.length; i++) {
      if (data.features[i].properties.mag > largestMagnitude) {
        largestMagnitude = data.features[i].properties.mag;
        largestMagnitudeIndex = i;
      }
    }

    return largestMagnitudeIndex;
  }
  return -1;
}

// Start fetching and animating earthquakes
fetchAndAnimateEarthquakes();
