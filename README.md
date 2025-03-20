# 🌎 Real-time Earthquake Tracker

![Earthquake Map Screenshot](/EQPast_Month_Screenshot.png)

## Overview

This interactive web application visualizes earthquake activity from around the world in near real-time. Using data from the USGS Earthquake Hazards Program, the application animates earthquake occurrences chronologically, allowing users to observe seismic patterns and explore significant events.

## Features

- **Real-time Data**: Fetches the latest month of global earthquake data from USGS
- **Chronological Animation**: Visualizes earthquakes in the order they occurred
- **Interactive Map**: Explore earthquake locations worldwide
- **Magnitude Visualization**: Circle size corresponds to earthquake magnitude
- **Largest Earthquake Focus**: Quick navigation to view the most significant seismic event
- **Detailed Information**: Access magnitude, location, depth, and precise timing for each event

## How to Use

1. **Launch the application**: Open `index.html` in a modern web browser
2. **Watch the animation**: Earthquakes appear chronologically with time displayed
3. **Click "Pan to largest earthquake"**: Instantly navigate to the most significant event of the period
4. **Click markers**: View detailed information about specific earthquakes
5. **Return to overview**: Use "Back to Default View" to restart the animation

## Technical Details

- Built with vanilla JavaScript, HTML5, and CSS3
- Uses Leaflet.js for interactive mapping
- Utilizes D3.js for data processing
- Real-time data from USGS Earthquake Hazards Program API
- Mobile-responsive design

## Getting Started

```bash
# Clone this repository
git clone https://github.com/username/earthquake-tracker.git

# Navigate to the project directory
cd earthquake-tracker

# Open in your browser
open index.html
# or
firefox index.html
# or
chrome index.html
```

No build process or server required - this application runs entirely in the browser.

## Future Enhancements

- Filter earthquakes by magnitude range
- Time-based playback controls (pause, speed up/slow down)
- Historical earthquake data comparison
- Heat map view of seismic activity
- Push notifications for significant new earthquakes

## Data Source

All earthquake data is sourced from the [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/), which provides real-time and historical earthquake data.

## License

MIT License - See LICENSE file for details
