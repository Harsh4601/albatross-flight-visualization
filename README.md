# Albatross Flight Path Visualization

This project visualizes albatross flight paths using 3D graphics, interactive charts, and sensor data.

## Project Structure

```
albatross-flight-visualization/
├── albatross_flight_visualization.html    # Main HTML file
├── css/
│   └── style.css                         # All CSS styles
├── js/
│   └── script.js                         # Main JavaScript application
├── assets/
│   ├── detailed.csv                      # Primary flight data
│   └── merged_input.csv                  # Additional data file
└── README.md                            # This file
```

## Files Description

### HTML (`albatross_flight_visualization.html`)
- Clean HTML structure with semantic markup
- References external CSS and JavaScript files
- Contains the layout for 3D visualization, charts, and controls

### CSS (`css/style.css`)
- All styling for the application
- Responsive layout for 3D view and charts
- Navigation controls and legend styling
- Tooltip and interaction styles

### JavaScript (`js/script.js`)
- Complete 3D flight path visualization using Three.js
- Interactive magnetometer and accelerometer charts
- Time range selection and camera focusing
- Bird model and flight path rendering
- Sensor data processing and visualization

### Assets (`assets/`)
- `detailed.csv`: Primary dataset with flight sensor data
- `merged_input.csv`: Additional flight data

## Features

- **3D Flight Path**: Interactive 3D visualization of albatross flight patterns
- **Sensor Charts**: Real-time magnetometer and accelerometer data visualization
- **Time Selection**: Click and drag on charts to focus on specific time ranges
- **Altitude Coloring**: Flight path colored by altitude ranges
- **Interactive Navigation**: Previous/Next segment navigation
- **Hover Tooltips**: Detailed sensor information on hover
- **Responsive Design**: Optimized layout for different screen sizes

## Usage

1. Open `albatross_flight_visualization.html` in a web browser
2. Wait for the flight data to load
3. Interact with the 3D visualization using mouse controls
4. Select time ranges on the charts to focus the 3D view
5. Use navigation buttons to move through flight segments
6. Hover over flight paths for detailed sensor data

## Dependencies

- Three.js (3D graphics)
- Chart.js (interactive charts)
- PapaParse (CSV data parsing)
- OrbitControls (3D navigation)

All dependencies are loaded via CDN and don't require local installation.
