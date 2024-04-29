import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import "https://cdn.jsdelivr.net/npm/leaflet@1.9.3/+esm";
import "https://unpkg.com/leaflet@1.9.3/dist/leaflet.js";

// Initialize a Leaflet map
var map = L.map("map").setView([0, 0], 2);

// // Add a tile layer
// var Stadia_AlidadeSmooth = L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}", {
//     minZoom: 0,
//     maxZoom: 20,
//     attribution:
//         '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     ext: "png",
// }).addTo(map);
var CartoDB_Positron = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      'Map tiles by <a href="https://carto.com/attributions">CARTO</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    subdomains: "abcd",
    maxZoom: 19,
  }
).addTo(map);

// Create a layer group for earthquake markers
var earthquakeMarkers = L.layerGroup().addTo(map);

// Variables for animation control
var currentIndex = 0;
var animationSpeed = 100; // Delay between earthquakes (1 second)

// Define the data object at a higher scope
var data = null;

// Function to fetch and animate earthquake data
async function fetchAndAnimateEarthquakes() {
  try {
    // Fetch earthquake data for the past month
    const response = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
    );
    data = await response.json(); // Define data in a higher scope

    // Sort earthquake data by occurrence date
    data.features.sort(function (a, b) {
      return new Date(a.properties.time) - new Date(b.properties.time);
    });

    // Start the animation when the data is loaded
    addEarthquakeMarker(currentIndex);
  } catch (error) {
    console.error("Error fetching or processing earthquake data:", error);
  }
}

// Function to add a circle marker for the earthquake at the given index
function addEarthquakeMarker(index) {
  if (index < data.features.length) {
    var earthquake = data.features[index];
    var coordinates = earthquake.geometry.coordinates;
    var magnitude = earthquake.properties.mag;
    var depth = earthquake.geometry.coordinates[2];
    var timestamp = new Date(earthquake.properties.time);
    var dayTime = timestamp.toLocaleString(); // Format date and time

    var radius = magnitude * 2; // Adjust the radius based on magnitude
    // Update the clock with the time of the current earthquake
    document.getElementById("clock-text").textContent =
      "Earthquake Time: " + dayTime;

    var circle = L.circleMarker([coordinates[1], coordinates[0]], {
      radius: radius,
      fillColor: "blue",
      color: "transparent",
      fillOpacity: 0.4,
    });

    // Set up the popup content
    var popupContent = `
            <strong>Date and Time:</strong> ${dayTime}<br>
            <strong>Magnitude:</strong> ${magnitude}<br>
            <strong>Depth:</strong> ${depth} km<br>
        `;

    circle.bindPopup(popupContent);
    circle.addTo(earthquakeMarkers);

    currentIndex++;

    if (currentIndex < data.features.length) {
      setTimeout(addEarthquakeMarker, animationSpeed, currentIndex); // Call the function for the next earthquake
    } else {
      // All markers have loaded, display the message
      var loadingMessage = document.getElementById("loading-message");
      loadingMessage.textContent = "All earthquakes have loaded!";
    }
  }
}

// Call the function to fetch and animate earthquake data
fetchAndAnimateEarthquakes();

// Find and add an event listener to the "Pan and Zoom to Largest Earthquake" button
var panToLargestButton = document.getElementById("panToLargestButton");
var earthquakeInfoDiv = document.getElementById("earthquakeInfo");

panToLargestButton.addEventListener("click", function () {
  var largestMagnitudeIndex = findLargestMagnitudeIndex();

  if (largestMagnitudeIndex !== -1) {
    var largestEarthquake = data.features[largestMagnitudeIndex];
    var coordinates = largestEarthquake.geometry.coordinates;
    var zoomLevel = 12; // Adjust zoom
    map.setView([coordinates[1], coordinates[0]], zoomLevel);
    console.log("Largest Earthquake:");
    console.log("Magnitude:", largestEarthquake.properties.mag);
    console.log("Location:", largestEarthquake.properties.place);
    console.log("Coordinates:", coordinates);
    console.log(
      "Time:",
      new Date(largestEarthquake.properties.time).toLocaleString()
    );
    // Display information about the largest earthquake below the button
    earthquakeInfoDiv.innerHTML = `
            <p><strong>Magnitude:</strong> ${
              largestEarthquake.properties.mag
            }</p>
            <p><strong>Location:</strong> ${
              largestEarthquake.properties.place
            }</p>
            <p><strong>Coordinates:</strong> [${coordinates[1]}, ${
      coordinates[0]
    }]</p>
            <p><strong>Time:</strong> ${new Date(
              largestEarthquake.properties.time
            ).toLocaleString()}</p>
        `;
  }
});

// Function to find the index of the earthquake with the largest magnitude
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

  return -1; // Return -1 if data is not available
}
