// Scene setup - declare variables but don't initialize yet
let scene;
let camera;
let renderer;
let controls;
let bird;

// Function to initialize Three.js scene
function initThreeJS() {
    console.log('Initializing Three.js...');
    const containerElement = document.getElementById('container');
    
    if (!containerElement) {
        console.error('Container element not found');
        return false;
    }
    
    // Clear container to ensure clean start
    containerElement.innerHTML = '';
    
    // Make sure previous Three.js objects are cleaned up
    if (scene) {
        console.log('Cleaning up existing scene before reinit');
        scene = null;
    }
    if (renderer) {
        console.log('Cleaning up existing renderer before reinit');
        renderer.dispose();
        renderer = null;
    }
    if (controls) {
        controls.dispose();
        controls = null;
    }
    
    try {
        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff); // White background
        
        // Camera setup - adjusted for 25% height layout (2x2 grid)
        camera = new THREE.PerspectiveCamera(75, (window.innerWidth * 0.5) / (window.innerHeight * 0.5), 0.1, 2000);
        camera.position.set(50, 50, 50); // Increased position values for a more zoomed-out view
        
        // Renderer setup - adjusted for 25% height layout (2x2 grid)
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerElement.appendChild(renderer.domElement);
        
        // Controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Add grid for reference
        const gridHelper = new THREE.GridHelper(200, 200, 0x888888, 0x444444);
        gridHelper.position.y = -15;
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);
        
        // Create and add bird model
        bird = createBirdModel();
        scene.add(bird);
        
        // Create ocean
        createOcean();
        
        console.log('Three.js initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Three.js:', error);
        return false;
    }
}

// Create path material
const pathMaterial = new THREE.LineBasicMaterial({
    color: 0x00aaff,
    linewidth: 2
});

// Create advanced path material for tubular path
const tubeMaterialBlue = new THREE.MeshPhongMaterial({
    color: 0x3A75A0, // Darker blue to match striped texture
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide
});

const tubeMaterialYellow = new THREE.MeshPhongMaterial({
    color: 0xD4AF00, // Darker yellow/gold to match striped texture
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide
});

// Create striped texture for the tube
const stripeSize = 0.1;
const createStripeTexture = (color1, color2) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Create striped pattern
    for (let i = 0; i < canvas.height; i++) {
        const stripeIndex = Math.floor(i / (canvas.height * stripeSize)) % 2;
        context.fillStyle = stripeIndex ? color1 : color2;
        context.fillRect(0, i, canvas.width, 1);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 10); // Repeat pattern along the path
    
    return texture;
};

// Create material sets for different parameters
const materialSets = {
    altitude: {
        low: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#0066CC', '#004499'), // Deep blue for low altitude
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        }),
        mediumLow: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#00AA66', '#008844'), // Green for medium-low altitude
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        }),
        medium: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#FFAA00', '#DD8800'), // Orange for medium altitude
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        }),
        mediumHigh: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#FF6600', '#DD4400'), // Red-orange for medium-high altitude
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        }),
        high: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#CC0033', '#990022'), // Red for high altitude
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        })
    },
    pressure: {
        low: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#8e44ad', '#6c3483'), // Purple for low pressure
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        }),
        mediumLow: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#3498db', '#2874a6'), // Blue for medium-low pressure
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        }),
        medium: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#17a2b8', '#138496'), // Teal for medium pressure
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        }),
        mediumHigh: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#20c997', '#1a9970'), // Green for medium-high pressure
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        }),
        high: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#28a745', '#1e7e34'), // Dark green for high pressure
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        })
    },
    temperature: {
        low: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#0066ff', '#0044cc'), // Blue for cold temperature
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        }),
        mediumLow: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#00ccff', '#0099cc'), // Light blue for cool temperature
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        }),
        medium: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#ffcc00', '#cc9900'), // Yellow for medium temperature
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        }),
        mediumHigh: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#ff6600', '#cc4400'), // Orange for warm temperature
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        }),
        high: new THREE.MeshPhongMaterial({
            map: createStripeTexture('#ff0000', '#cc0000'), // Red for hot temperature
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        })
    }
};

// Legacy reference for backward compatibility
const altitudeMaterials = materialSets.altitude;

// Global parameter boundaries (will be set dynamically based on data)
let parameterBoundaries = {
    altitude: { low: 0, mediumLow: 0, medium: 0, mediumHigh: 0, high: 0 },
    pressure: { low: 0, mediumLow: 0, medium: 0, mediumHigh: 0, high: 0 },
    temperature: { low: 0, mediumLow: 0, medium: 0, mediumHigh: 0, high: 0 }
};

// Legacy reference for backward compatibility
let altitudeBoundaries = parameterBoundaries.altitude;

// Current selected parameter for coloring
let currentColorParameter = 'altitude';

// Create purple material for selected time range segments
const purpleSelectionMaterial = new THREE.MeshPhongMaterial({
    map: createStripeTexture('#8A2BE2', '#6A1B9A'), // Purple stripes for selection
    transparent: true,
    opacity: 1.0,
    side: THREE.DoubleSide
});

// Create bird model
function createBirdModel() {
    const birdGroup = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x87CEEB });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    birdGroup.add(body);
    
    // Wings
    const wingGeometry = new THREE.CylinderGeometry(0.05, 0.2, 3, 12);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0xDDEEFF });
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.rotation.z = Math.PI / 2;
    leftWing.position.set(-1.5, 0, 0);
    birdGroup.add(leftWing);
    
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.rotation.z = -Math.PI / 2;
    rightWing.position.set(1.5, 0, 0);
    birdGroup.add(rightWing);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0, 0.7);
    birdGroup.add(head);
    
    // Tail
    const tailGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0xDDEEFF });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.rotation.x = Math.PI / 2;
    tail.position.set(0, 0, -1);
    birdGroup.add(tail);
    
    return birdGroup;
}

// Parse CSV data
let flightData = [];

// Add ocean
function createOcean() {
    const oceanGeometry = new THREE.PlaneGeometry(400, 400, 32, 32);
    const oceanMaterial = new THREE.MeshPhongMaterial({
        color: 0x3090C7, // Lighter, more subtle blue color
        transparent: true,
        opacity: 0.3, // Increased transparency
        side: THREE.DoubleSide,
        flatShading: false // Remove the flat shading effect
    });
    
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -15;
    
    // Make ocean receive shadows but not cast them
    ocean.receiveShadow = true;
    ocean.castShadow = false;
    
    scene.add(ocean);
    
    // Add surface reference line similar to the reference image
    addSurfaceReferenceLine();
}

// Add a surface reference line like in the reference image
function addSurfaceReferenceLine() {
    // Create points for the wavy line
    const points = [];
    const lineLength = 250;
    const segments = 100;
    
    for (let i = 0; i < segments; i++) {
        const x = (i / segments) * lineLength - lineLength / 2;
        const y = -5; // Above the ocean surface
        const z = 0;
        
        // Add gentle wave effect
        const waveY = Math.sin(i * 0.2) * 0.5;
        
        points.push(new THREE.Vector3(x, y + waveY, z));
    }
    
    // Create geometry from points
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Create dashed line material
    const lineMaterial = new THREE.LineDashedMaterial({
        color: 0xCCCCCC,
        linewidth: 1,
        scale: 1,
        dashSize: 3,
        gapSize: 1,
    });
    
    // Create line and compute line distances for dashes
    const line = new THREE.Line(lineGeometry, lineMaterial);
    line.computeLineDistances();
    
    scene.add(line);
    
    // Add vertical reference lines similar to the ones in panels C and D
    addVerticalReferenceLines();
}

// Add vertical reference lines with markers
function addVerticalReferenceLines() {
    // Create material for vertical lines
    const vertLineMaterial = new THREE.LineDashedMaterial({
        color: 0x00ff00,
        linewidth: 1,
        scale: 1,
        dashSize: 1,
        gapSize: 1,
    });
    
    // Create vertical reference line for section C
    const vertLine1Points = [];
    const lineHeight = 40;
    
    // Create line points from bottom to top
    for (let y = -15; y < lineHeight - 15; y += 1) {
        vertLine1Points.push(new THREE.Vector3(30, y, 0));
    }
    
    const vertLine1Geometry = new THREE.BufferGeometry().setFromPoints(vertLine1Points);
    const vertLine1 = new THREE.Line(vertLine1Geometry, vertLineMaterial);
    vertLine1.computeLineDistances();
    scene.add(vertLine1);
    
    // Create small markers along the vertical line (green cubes)
    const markerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    
    for (let y = -10; y < lineHeight - 15; y += 5) {
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(30, y, 0);
        scene.add(marker);
    }
    
    // Create a second vertical reference line for section D
    const vertLine2Points = [];
    
    // Create line points from bottom to top
    for (let y = -15; y < lineHeight - 15; y += 1) {
        vertLine2Points.push(new THREE.Vector3(-20, y, 20));
    }
    
    const vertLine2Geometry = new THREE.BufferGeometry().setFromPoints(vertLine2Points);
    const vertLine2 = new THREE.Line(vertLine2Geometry, vertLineMaterial);
    vertLine2.computeLineDistances();
    scene.add(vertLine2);
    
    // Create small markers along the second vertical line
    for (let y = -10; y < lineHeight - 15; y += 5) {
        const marker = new THREE.Mesh(markerGeometry.clone(), markerMaterial);
        marker.position.set(-20, y, 20);
        scene.add(marker);
    }
}

// Function to create dynamic ground reference that follows the flight path
function createDynamicGroundReference(positions) {
    if (!positions || positions.length === 0) return;
    
    // Calculate bounding box of the flight path
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    positions.forEach(pos => {
        minX = Math.min(minX, pos.x);
        maxX = Math.max(maxX, pos.x);
        minZ = Math.min(minZ, pos.z);
        maxZ = Math.max(maxZ, pos.z);
    });
    
    // Add padding around the flight path
    const padding = Math.max((maxX - minX), (maxZ - minZ)) * 0.2; // 20% padding
    minX -= padding;
    maxX += padding;
    minZ -= padding;
    maxZ += padding;
    
    const width = maxX - minX;
    const height = maxZ - minZ;
    
    // Create extended ocean/ground plane
    const groundGeometry = new THREE.PlaneGeometry(width, height, 64, 64);
    const groundMaterial = new THREE.MeshPhongMaterial({
        color: 0x2E8B57, // Sea green color for ocean
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        flatShading: false
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0; // Set at sea level (0m altitude)
    ground.position.x = (minX + maxX) / 2; // Center on flight path
    ground.position.z = (minZ + maxZ) / 2; // Center on flight path
    
    ground.receiveShadow = true;
    ground.castShadow = false;
    
    scene.add(ground);
    
    // Add grid lines for better reference
    createGroundGrid(minX, maxX, minZ, maxZ);
}

// Function to create grid lines on the ground
function createGroundGrid(minX, maxX, minZ, maxZ) {
    const gridMaterial = new THREE.LineDashedMaterial({
        color: 0x4682B4, // Steel blue for grid lines
        linewidth: 1,
        scale: 1,
        dashSize: 2,
        gapSize: 1,
        transparent: true,
        opacity: 0.3
    });
    
    const gridSpacing = Math.max((maxX - minX), (maxZ - minZ)) / 20; // 20 grid lines
    
    // Create vertical grid lines (parallel to Z-axis)
    for (let x = minX; x <= maxX; x += gridSpacing) {
        const points = [
            new THREE.Vector3(x, 0, minZ),
            new THREE.Vector3(x, 0, maxZ)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, gridMaterial);
        line.computeLineDistances();
        scene.add(line);
    }
    
    // Create horizontal grid lines (parallel to X-axis)
    for (let z = minZ; z <= maxZ; z += gridSpacing) {
        const points = [
            new THREE.Vector3(minX, 0, z),
            new THREE.Vector3(maxX, 0, z)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, gridMaterial);
        line.computeLineDistances();
        scene.add(line);
    }
}


// Function to create the geographic map
function createMap(gpsData) {
    if (!gpsData || gpsData.length === 0) {
        console.error('No GPS data provided to createMap');
        return;
    }
    
    console.log('Creating map with', gpsData.length, 'GPS points');
    
    // Make sure map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        throw new Error('Map container not found');
    }
    
    // If map already exists, remove it first
    if (window.map) {
        console.log('Removing existing map instance');
        try {
            window.map.remove();
        } catch (e) {
            console.warn('Error removing old map:', e);
        }
        window.map = null;
    }
    
    // Calculate center and bounds of the flight path
    let minLat = Infinity, maxLat = -Infinity;
    let minLon = Infinity, maxLon = -Infinity;
    
    gpsData.forEach(point => {
        minLat = Math.min(minLat, point.lat);
        maxLat = Math.max(maxLat, point.lat);
        minLon = Math.min(minLon, point.lon);
        maxLon = Math.max(maxLon, point.lon);
    });
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    
    console.log('Map center:', centerLat, centerLon);
    
    // Initialize map
    try {
        map = L.map('map').setView([centerLat, centerLon], 10);
        console.log('Map created successfully');
    } catch (error) {
        console.error('Error creating Leaflet map:', error);
        throw error;
    }
    
    // Add OpenStreetMap tile layer (free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Create layer groups
    flightPathLayer = L.layerGroup().addTo(map);
    markersLayer = L.layerGroup().addTo(map);
    mapHighlightLayer = L.layerGroup().addTo(map); // Layer for highlighting selected segments
    
    // Add flight path
    createMapFlightPath(gpsData);
    
    // Add markers at key points
    createMapMarkers(gpsData);
    
    // Fit map to show entire flight path
    const bounds = L.latLngBounds([minLat, minLon], [maxLat, maxLon]);
    map.fitBounds(bounds, { padding: [10, 10] });
}

// Function to create flight path on map with altitude-based colors
function createMapFlightPath(gpsData) {
    if (!gpsData || gpsData.length === 0) return;
    
    // Sample points for performance (every 10th point)
    const sampleInterval = Math.max(1, Math.floor(gpsData.length / 1000));
    const sampledData = gpsData.filter((_, index) => index % sampleInterval === 0);
    
    // Create path segments with altitude-based colors
    for (let i = 0; i < sampledData.length - 1; i++) {
        const point1 = sampledData[i];
        const point2 = sampledData[i + 1];
        
        // Get color based on current parameter
        const value1 = point1[currentColorParameter] || 0;
        const value2 = point2[currentColorParameter] || 0;
        const avgValue = (value1 + value2) / 2;
        const color = getParameterColor(avgValue, currentColorParameter);
        
        // Create polyline segment
        const segment = L.polyline([
            [point1.lat, point1.lon],
            [point2.lat, point2.lon]
        ], {
            color: color,
            weight: 3,
            opacity: 0.8
        });
        
        // Add popup with parameter info
        const parameterName = currentColorParameter.charAt(0).toUpperCase() + currentColorParameter.slice(1);
        const unit = currentColorParameter === 'altitude' ? 'm' : 
                    currentColorParameter === 'pressure' ? ' hPa' : '°C';
        segment.bindPopup(`
            <strong>Flight Segment</strong><br>
            ${parameterName}: ${avgValue.toFixed(1)}${unit}<br>
            Category: ${getParameterCategoryName(avgValue, currentColorParameter)}
        `);
        
        // Add hover tooltip with detailed statistics
        const tooltipContent = createTooltipContent(point1, point2, avgValue);
        segment.bindTooltip(tooltipContent, {
            permanent: false,
            direction: 'top',
            offset: [0, -10],
            opacity: 0.9,
            className: 'map-tooltip'
        });
        
        // Add hover effects
        segment.on('mouseover', function(e) {
            this.setStyle({
                weight: 6,
                opacity: 1.0
            });
        });
        
        segment.on('mouseout', function(e) {
            this.setStyle({
                weight: 3,
                opacity: 0.8
            });
        });
        
        flightPathLayer.addLayer(segment);
    }
}

// Function to create detailed tooltip content for map path segments
function createTooltipContent(point1, point2, avgValue) {
    const timestamp1 = new Date(point1.timestamp);
    const timestamp2 = new Date(point2.timestamp);
    
    // Calculate distance between points (approximate)
    const distance = calculateDistance(point1.lat, point1.lon, point2.lat, point2.lon);
    
    // Calculate time difference
    const timeDiff = (timestamp2 - timestamp1) / 1000; // in seconds
    
    // Calculate speed (if time difference > 0)
    const speed = timeDiff > 0 ? (distance / timeDiff) * 3.6 : 0; // km/h
    
    // Format time
    const timeStr = timestamp1.toLocaleTimeString();
    
    // Get all parameter values
    const altitude1 = point1.altitude || 0;
    const altitude2 = point2.altitude || 0;
    const avgAltitude = (altitude1 + altitude2) / 2;
    
    const pressure1 = point1.pressure || 0;
    const pressure2 = point2.pressure || 0;
    const avgPressure = (pressure1 + pressure2) / 2;
    
    const temp1 = point1.temperature || 0;
    const temp2 = point2.temperature || 0;
    const avgTemp = (temp1 + temp2) / 2;
    
    const mx1 = point1.mx || 0;
    const my1 = point1.my || 0;
    const mz1 = point1.mz || 0;
    const mx2 = point2.mx || 0;
    const my2 = point2.my || 0;
    const mz2 = point2.mz || 0;
    
    const ax1 = point1.ax || 0;
    const ay1 = point1.ay || 0;
    const az1 = point1.az || 0;
    const ax2 = point2.ax || 0;
    const ay2 = point2.ay || 0;
    const az2 = point2.az || 0;
    
    return `
        <div style="font-size: 10px; line-height: 1.25;">
            <div style="margin-bottom: 4px;"><strong>📊 Flight Data:</strong></div>
            <div style="margin-bottom: 3px;">Alt: ${avgAltitude.toFixed(0)}m • Press: ${avgPressure.toFixed(1)}hPa</div>
            <div style="margin-bottom: 6px;">Temp: ${avgTemp.toFixed(1)}°C • Speed: ${speed.toFixed(1)}km/h</div>
            
            <div style="margin-bottom: 3px;"><strong>🧲 Magnetometer (µT):</strong></div>
            <div style="margin-bottom: 6px;">Mx: ${((mx1 + mx2) / 2).toFixed(2)} • My: ${((my1 + my2) / 2).toFixed(2)} • Mz: ${((mz1 + mz2) / 2).toFixed(2)}</div>
            
            <div style="margin-bottom: 3px;"><strong>📈 Accelerometer (g):</strong></div>
            <div>Ax: ${((ax1 + ax2) / 2).toFixed(2)} • Ay: ${((ay1 + ay2) / 2).toFixed(2)} • Az: ${((az1 + az2) / 2).toFixed(2)}</div>
        </div>
    `;
}

// Function to calculate distance between two GPS coordinates (in meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Generic function to get color based on parameter value
function getParameterColor(value, parameter = currentColorParameter) {
    const boundaries = parameterBoundaries[parameter];
    if (!boundaries) return '#FFAA00';
    
    const colorMaps = {
        altitude: {
            low: '#0066CC',
            mediumLow: '#00AA66',
            medium: '#FFAA00',
            mediumHigh: '#FF6600',
            high: '#CC0033'
        },
        pressure: {
            low: '#8e44ad',
            mediumLow: '#3498db',
            medium: '#17a2b8',
            mediumHigh: '#20c997',
            high: '#28a745'
        },
        temperature: {
            low: '#0066ff',
            mediumLow: '#00ccff',
            medium: '#ffcc00',
            mediumHigh: '#ff6600',
            high: '#ff0000'
        }
    };
    
    const colors = colorMaps[parameter];
    if (!colors) return '#FFAA00';
    
    if (value <= boundaries.low) {
        return colors.low;
    } else if (value <= boundaries.mediumLow) {
        return colors.mediumLow;
    } else if (value <= boundaries.medium) {
        return colors.medium;
    } else if (value <= boundaries.mediumHigh) {
        return colors.mediumHigh;
    } else {
        return colors.high;
    }
}

// Function to get color based on altitude (legacy support)
function getAltitudeColor(altitude) {
    return getParameterColor(altitude, 'altitude');
}

// Function to create markers at key points
function createMapMarkers(gpsData) {
    if (!gpsData || gpsData.length === 0) return;
    
    // Add start marker
    const startPoint = gpsData[0];
    const startMarker = L.marker([startPoint.lat, startPoint.lon], {
        title: 'Flight Start'
    }).bindPopup(`
        <strong>🛫 Flight Start</strong><br>
        Coordinates: ${startPoint.lat.toFixed(6)}, ${startPoint.lon.toFixed(6)}<br>
        Altitude: ${startPoint.altitude.toFixed(1)}m<br>
        Pressure: ${startPoint.pressure.toFixed(1)} hPa
    `);
    markersLayer.addLayer(startMarker);
    
    // Add end marker
    const endPoint = gpsData[gpsData.length - 1];
    const endMarker = L.marker([endPoint.lat, endPoint.lon], {
        title: 'Flight End'
    }).bindPopup(`
        <strong>🛬 Flight End</strong><br>
        Coordinates: ${endPoint.lat.toFixed(6)}, ${endPoint.lon.toFixed(6)}<br>
        Altitude: ${endPoint.altitude.toFixed(1)}m<br>
        Pressure: ${endPoint.pressure.toFixed(1)} hPa
    `);
    markersLayer.addLayer(endMarker);
    
    // Add markers for extreme altitudes
    let maxAltPoint = gpsData[0];
    let minAltPoint = gpsData[0];
    
    gpsData.forEach(point => {
        if (point.altitude > maxAltPoint.altitude) maxAltPoint = point;
        if (point.altitude < minAltPoint.altitude) minAltPoint = point;
    });
    
    // Highest point marker
    if (maxAltPoint !== startPoint && maxAltPoint !== endPoint) {
        const highMarker = L.marker([maxAltPoint.lat, maxAltPoint.lon], {
            title: 'Highest Point'
        }).bindPopup(`
            <strong>⬆️ Highest Point</strong><br>
            Coordinates: ${maxAltPoint.lat.toFixed(6)}, ${maxAltPoint.lon.toFixed(6)}<br>
            Altitude: ${maxAltPoint.altitude.toFixed(1)}m<br>
            Pressure: ${maxAltPoint.pressure.toFixed(1)} hPa
        `);
        markersLayer.addLayer(highMarker);
    }
    
    // Lowest point marker
    if (minAltPoint !== startPoint && minAltPoint !== endPoint && minAltPoint !== maxAltPoint) {
        const lowMarker = L.marker([minAltPoint.lat, minAltPoint.lon], {
            title: 'Lowest Point'
        }).bindPopup(`
            <strong>⬇️ Lowest Point</strong><br>
            Coordinates: ${minAltPoint.lat.toFixed(6)}, ${minAltPoint.lon.toFixed(6)}<br>
            Altitude: ${minAltPoint.altitude.toFixed(1)}m<br>
            Pressure: ${minAltPoint.pressure.toFixed(1)} hPa
        `);
        markersLayer.addLayer(lowMarker);
    }
}

// Chart variables
let magnetometerChart = null;
let accelerometerChart = null;

// Map variables
let map = null;
let flightPathLayer = null;
let markersLayer = null;
let mapHighlightLayer = null; // New layer for highlighting selected segments

// Time selection variables
let selectedTimeRange = null;
let originalChartData = {
    magnetometer: null,
    accelerometer: null,
    altitude: null,
    pressure: null,
    temperature: null
};
let isSelectingTime = false;

// Store all parameter data for chart switching
let allParameterData = {
    timeLabels: [],
    magnetometer: { mx: [], my: [], mz: [] },
    accelerometer: { ax: [], ay: [], az: [] },
    altitude: [],
    pressure: [],
    temperature: []
};

// Function to handle time range selection
function onTimeRangeSelected(startIndex, endIndex, sourceChart) {
    console.log(`Time range selected: index ${startIndex} to ${endIndex}`);
    console.log(`Path segments available: ${window.pathSegments ? window.pathSegments.length : 'NONE'}`);
    selectedTimeRange = { startIndex: startIndex, endIndex: endIndex };
    
    // Update both charts with the selected time range
    updateChartsWithTimeRange(startIndex, endIndex);
    
    // Focus camera on corresponding 3D path segment
    focusCameraOnTimeRange(startIndex, endIndex);
    
    // Calculate GPS data indices for map highlighting
    if (flightData && flightData.positions && originalChartData.magnetometer) {
        const totalDataPoints = flightData.positions.length;
        const actualStartIndex = Math.floor((startIndex / originalChartData.magnetometer.timeLabels.length) * totalDataPoints);
        const actualEndIndex = Math.min(Math.floor((endIndex / originalChartData.magnetometer.timeLabels.length) * totalDataPoints), totalDataPoints - 1);
        
        // Highlight the corresponding segment on the map with GPS indices
        highlightMapTimeRange(actualStartIndex, actualEndIndex);
    }
}

// Function to update both charts with selected time range
function updateChartsWithTimeRange(startIndex, endIndex) {
    if (!originalChartData.magnetometer || !originalChartData.accelerometer) return;
    
    // Filter magnetometer data by index range
    const magData = filterDataByIndexRange(originalChartData.magnetometer, startIndex, endIndex);
    updateMagnetometerChart(magData);
    
    // Filter accelerometer data by index range
    const accelData = filterDataByIndexRange(originalChartData.accelerometer, startIndex, endIndex);
    updateAccelerometerChart(accelData);
}

// Function to filter data by index range
function filterDataByIndexRange(data, startIndex, endIndex) {
    const filtered = {
        timeLabels: [],
        datasets: data.datasets.map(dataset => ({
            ...dataset,
            data: []
        }))
    };
    
    for (let i = startIndex; i <= endIndex && i < data.timeLabels.length; i++) {
        filtered.timeLabels.push(data.timeLabels[i]);
        data.datasets.forEach((dataset, datasetIndex) => {
            filtered.datasets[datasetIndex].data.push(dataset.data[i]);
        });
    }
    
    return filtered;
}

// Function to focus camera on time range in 3D visualization
function focusCameraOnTimeRange(startIndex, endIndex) {
    if (!flightData || !flightData.positions) return;
    
    // Use the provided indices directly (they correspond to data points)
    const totalDataPoints = flightData.positions.length;
    const actualStartIndex = Math.floor((startIndex / originalChartData.magnetometer.timeLabels.length) * totalDataPoints);
    const actualEndIndex = Math.min(Math.floor((endIndex / originalChartData.magnetometer.timeLabels.length) * totalDataPoints), totalDataPoints - 1);
    
    if (actualStartIndex >= actualEndIndex) return;
    
    // Get the segment of positions for this time range
    const segmentPositions = flightData.positions.slice(actualStartIndex, actualEndIndex + 1);
    
    if (segmentPositions.length === 0) return;
    
    // Calculate midpoint of the segment
    const midpoint = new THREE.Vector3();
    segmentPositions.forEach(pos => midpoint.add(pos));
    midpoint.divideScalar(segmentPositions.length);
    
    // Calculate bounding box for appropriate camera distance
    const boundingBox = new THREE.Box3();
    segmentPositions.forEach(pos => boundingBox.expandByPoint(pos));
    
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Position camera CLOSER to zoom IN on the segment (reduced distance)
    const currentDirection = new THREE.Vector3();
    currentDirection.subVectors(camera.position, controls.target).normalize();
    
    // Use a much smaller distance to zoom IN on the segment
    const distance = Math.max(maxDim * 1.2, 5); // Reduced multiplier from 2 to 1.2, min from 10 to 5
    const newCameraPosition = new THREE.Vector3();
    newCameraPosition.copy(midpoint).add(currentDirection.multiplyScalar(distance));
    
    // Smoothly transition camera
    camera.position.copy(newCameraPosition);
    camera.lookAt(midpoint);
    controls.target.copy(midpoint);
    
    // Position bird at the midpoint
    if (bird) {
        bird.position.copy(midpoint);
    }
    
    // Highlight the selected segment with purple color
    highlightTimeRangeSegment(actualStartIndex, actualEndIndex);
}

// Store original materials for restoration
let originalSegmentMaterials = [];

// Function to highlight the selected time range segment
function highlightTimeRangeSegment(startIndex, endIndex) {
    if (!window.pathSegments) {
        console.log("No path segments found");
        return;
    }
    
    console.log(`Highlighting segments for range ${startIndex} to ${endIndex}`);
    console.log(`Total path segments: ${window.pathSegments.length}`);
    
    // Store original materials if not already stored
    if (originalSegmentMaterials.length === 0) {
        originalSegmentMaterials = window.pathSegments.map(segment => {
            return {
                material: segment.mesh.material,
                opacity: segment.mesh.material.opacity
            };
        });
        console.log(`Stored ${originalSegmentMaterials.length} original materials`);
    }
    
    // Calculate which segments are affected by the time range
    const segmentLength = Math.max(15, Math.floor(flightData.positions.length / 200));
    const startSegmentIndex = Math.floor(startIndex / segmentLength);
    const endSegmentIndex = Math.floor(endIndex / segmentLength);
    
    console.log(`Segment range: ${startSegmentIndex} to ${endSegmentIndex}`);
    
    // Highlight segments in the selected range with purple and dim others
    let highlightedCount = 0;
    let dimmedCount = 0;
    
    window.pathSegments.forEach((segment, i) => {
        if (i >= startSegmentIndex && i <= endSegmentIndex) {
            // Use purple material for selected segments
            segment.mesh.material = purpleSelectionMaterial;
            segment.mesh.visible = true;
            highlightedCount++;
        } else {
            // Create a copy of the original material and reduce opacity
            if (originalSegmentMaterials[i]) {
                const dimmedMaterial = originalSegmentMaterials[i].material.clone();
                dimmedMaterial.opacity = 0.6; // Higher opacity so it's more visible
                dimmedMaterial.transparent = true;
                segment.mesh.material = dimmedMaterial;
                segment.mesh.visible = true;
                dimmedCount++;
            }
        }
    });
    
    console.log(`Highlighting complete: ${highlightedCount} highlighted, ${dimmedCount} dimmed`);
}

// Function to reset time selection
function resetTimeSelection() {
    selectedTimeRange = null;
    
    // Clean up all selection overlays
    const allCanvases = document.querySelectorAll('canvas');
    allCanvases.forEach(canvas => {
        cleanupSelectionOverlays(canvas);
    });
    
    // Restore original chart data
    if (originalChartData.magnetometer) {
        updateMagnetometerChart(originalChartData.magnetometer);
    }
    if (originalChartData.accelerometer) {
        updateAccelerometerChart(originalChartData.accelerometer);
    }
    
    // Reset segment highlighting - restore original materials and opacity
    if (window.pathSegments && originalSegmentMaterials.length > 0) {
        window.pathSegments.forEach((segment, i) => {
            // Restore original material
            if (originalSegmentMaterials[i]) {
                segment.mesh.material = originalSegmentMaterials[i].material;
                segment.mesh.material.opacity = originalSegmentMaterials[i].opacity;
                segment.mesh.material.transparent = true;
                segment.mesh.visible = true;
            }
        });
        console.log("Reset all segments to original state");
    }
    
    // Clear map highlights
    if (mapHighlightLayer) {
        mapHighlightLayer.clearLayers();
        console.log("Cleared map highlights");
    }
}

// Global reset function - resets entire application to initial state
function globalReset() {
    console.log("Performing global reset...");
    
    // Reset time selection
    resetTimeSelection();
    
    // Reset chart parameters to default
    const chart1Select = document.getElementById('chart1Parameter');
    const chart2Select = document.getElementById('chart2Parameter');
    if (chart1Select && chart1Select.value !== 'magnetometer') {
        chart1Select.value = 'magnetometer';
        chart1Select.dispatchEvent(new Event('change'));
    }
    if (chart2Select && chart2Select.value !== 'accelerometer') {
        chart2Select.value = 'accelerometer';
        chart2Select.dispatchEvent(new Event('change'));
    }
    
    // Reset 3D visualization parameter to altitude
    const activeParamBtn = document.querySelector('.parameter-btn.active');
    if (activeParamBtn && activeParamBtn.getAttribute('data-parameter') !== 'altitude') {
        const altitudeBtn = document.querySelector('.parameter-btn[data-parameter="altitude"]');
        if (altitudeBtn) {
            altitudeBtn.click();
        }
    }
    
    // Reset 3D camera view if possible
    if (window.camera && window.controls) {
        // Reset camera position to a default view
        window.camera.position.set(0, 500, 1000);
        window.controls.target.set(0, 0, 0);
        window.controls.update();
    }
    
    // Reset map view to show full path
    if (window.map && window.currentGpsData && window.currentGpsData.length > 0) {
        const bounds = L.latLngBounds(
            window.currentGpsData.map(point => [point.latitude, point.longitude])
        );
        window.map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    console.log("Global reset completed");
}

// Floating Menu Functions
function toggleFloatingMenu() {
    const floatingMenu = document.getElementById('floatingMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    
    if (floatingMenu && menuBackdrop) {
        const isVisible = floatingMenu.classList.contains('show');
        
        if (isVisible) {
            closeFloatingMenu();
        } else {
            openFloatingMenu();
        }
    }
}

function openFloatingMenu() {
    const floatingMenu = document.getElementById('floatingMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    
    if (floatingMenu) {
        floatingMenu.classList.remove('hidden');
        floatingMenu.classList.add('show');
    }
    
    if (menuBackdrop) {
        menuBackdrop.classList.remove('hidden');
        menuBackdrop.classList.add('show');
    }
}

function closeFloatingMenu() {
    const floatingMenu = document.getElementById('floatingMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    
    if (floatingMenu) {
        floatingMenu.classList.remove('show');
        setTimeout(() => {
            floatingMenu.classList.add('hidden');
        }, 300);
    }
    
    if (menuBackdrop) {
        menuBackdrop.classList.remove('show');
        setTimeout(() => {
            menuBackdrop.classList.add('hidden');
        }, 300);
    }
}

// Function to return to upload screen (for Upload New CSV button)
function returnToUploadScreen() {
    console.log("Returning to upload screen...");
    
    // Hide main container
    const mainContainer = document.getElementById('mainContainer');
    if (mainContainer) {
        mainContainer.classList.add('hidden');
    }
    
    // Hide floating menu button and close menu
    const floatingMenuBtn = document.getElementById('floatingMenuBtn');
    const floatingMenu = document.getElementById('floatingMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    
    if (floatingMenuBtn) {
        floatingMenuBtn.classList.add('hidden');
    }
    if (floatingMenu) {
        floatingMenu.classList.remove('show');
        floatingMenu.classList.add('hidden');
    }
    if (menuBackdrop) {
        menuBackdrop.classList.remove('show');
        menuBackdrop.classList.add('hidden');
    }
    
    // Show welcome screen
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        welcomeScreen.classList.remove('hidden');
    }
    
    // Reset file input
    const fileInput = document.getElementById('csvFileInput');
    const fileInfo = document.getElementById('fileInfo');
    if (fileInput) {
        fileInput.value = '';
    }
    if (fileInfo) {
        fileInfo.textContent = 'No file selected';
    }
    
    // Stop animation loop
    if (typeof animationFrameId !== 'undefined' && animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // Clean up Three.js scene if it exists
    if (scene) {
        // Remove all objects from scene
        while(scene.children.length > 0) {
            const object = scene.children[0];
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
            scene.remove(object);
        }
        scene = null;
    }
    
    // Clean up renderer
    if (renderer) {
        if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer.dispose();
        renderer = null;
    }
    
    // Reset Three.js variables
    camera = null;
    controls = null;
    bird = null;
    
    // Clean up map
    if (window.map) {
        console.log('Cleaning up existing map');
        try {
            window.map.remove();
        } catch (e) {
            console.warn('Error removing map during cleanup:', e);
        }
        window.map = null;
    }
    if (typeof map !== 'undefined' && map !== null) {
        try {
            map.remove();
        } catch (e) {
            console.warn('Error removing global map during cleanup:', e);
        }
        map = null;
    }
    
    // Clean up charts
    if (window.chart1Instance) {
        window.chart1Instance.destroy();
        window.chart1Instance = null;
    }
    if (window.chart2Instance) {
        window.chart2Instance.destroy();
        window.chart2Instance = null;
    }
    
    // Clear canvas elements to ensure fresh start
    const magnetometerCanvas = document.getElementById('magnetometerChart');
    const accelerometerCanvas = document.getElementById('accelerometerChart');
    if (magnetometerCanvas) {
        const ctx = magnetometerCanvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, magnetometerCanvas.width, magnetometerCanvas.height);
        }
    }
    if (accelerometerCanvas) {
        const ctx = accelerometerCanvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, accelerometerCanvas.width, accelerometerCanvas.height);
        }
    }
    
    // DON'T clear map container HTML - Leaflet needs the div element
    // The map instance was already removed above with map.remove()
    
    // DON'T clear 3D container HTML yet - will be cleared in initThreeJS
    // The renderer was already cleaned up above
    
    // Clear global data
    window.sensorData = null;
    window.flightData = null;
    window.allParameterData = null;
    window.originalChartData = null;
    window.pathSegments = null;
    window.currentGpsData = null;
    
    // Reset global variables at module level
    if (typeof flightData !== 'undefined') {
        flightData = [];
    }
    if (typeof allParameterData !== 'undefined') {
        allParameterData = {
            timeLabels: [],
            magnetometer: { mx: [], my: [], mz: [] },
            accelerometer: { ax: [], ay: [], az: [] },
            altitude: [],
            pressure: [],
            temperature: []
        };
    }
    if (typeof originalChartData !== 'undefined') {
        originalChartData = {
            magnetometer: null,
            accelerometer: null,
            altitude: null,
            pressure: null,
            temperature: null
        };
    }
    
    // Reset map-related variables
    if (typeof flightPathLayer !== 'undefined' && flightPathLayer !== null) {
        try {
            flightPathLayer.clearLayers();
        } catch (e) {
            console.warn('Error clearing flight path layer:', e);
        }
        flightPathLayer = null;
    }
    if (typeof markersLayer !== 'undefined' && markersLayer !== null) {
        try {
            markersLayer.clearLayers();
        } catch (e) {
            console.warn('Error clearing markers layer:', e);
        }
        markersLayer = null;
    }
    if (typeof mapHighlightLayer !== 'undefined' && mapHighlightLayer !== null) {
        try {
            mapHighlightLayer.clearLayers();
        } catch (e) {
            console.warn('Error clearing highlight layer:', e);
        }
        mapHighlightLayer = null;
    }
    
    // Reset chart selection variables
    if (typeof selectedTimeRange !== 'undefined') {
        selectedTimeRange = null;
    }
    if (typeof isSelectingTime !== 'undefined') {
        isSelectingTime = false;
    }
    
    // Reset segment variables
    if (typeof currentSegmentIndex !== 'undefined') {
        currentSegmentIndex = 0;
    }
    if (typeof pathPercentage !== 'undefined') {
        pathPercentage = 0;
    }
    if (typeof originalSegmentMaterials !== 'undefined') {
        originalSegmentMaterials = [];
    }
    
    // Reset hover line variables
    if (typeof magnetometerHoverLine !== 'undefined') {
        magnetometerHoverLine = null;
    }
    if (typeof accelerometerHoverLine !== 'undefined') {
        accelerometerHoverLine = null;
    }
    
    // Reset parameter boundaries
    if (typeof parameterBoundaries !== 'undefined') {
        parameterBoundaries = {
            altitude: { min: 0, max: 100 },
            pressure: { min: 980, max: 1020 },
            temperature: { min: -10, max: 30 }
        };
    }
    if (typeof currentColorParameter !== 'undefined') {
        currentColorParameter = 'altitude';
    }
    
    // Cancel any ongoing Web Worker
    if (dataWorker) {
        dataWorker.terminate();
        dataWorker = null;
    }
    
    // Reset loading display
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'block';
        loadingDiv.innerText = 'Loading flight data...';
    }
    
    console.log("Returned to upload screen, all state cleared, ready for new CSV");
}

// Function to extract all parameter data from CSV
function extractAllParameterData(data) {
    const timeLabels = [];
    const magnetometer = { mx: [], my: [], mz: [] };
    const accelerometer = { ax: [], ay: [], az: [] };
    const altitude = [];
    const pressure = [];
    const temperature = [];
    
    // Process all records (skip header)
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row.datetime && 
            row.Mx !== undefined && row.My !== undefined && row.Mz !== undefined &&
            row.Ax !== undefined && row.Ay !== undefined && row.Az !== undefined &&
            row.Pressure !== undefined && row.Temperature !== undefined) {
            
            // Parse datetime string to Date object
            const datetime = new Date(row.datetime);
            timeLabels.push(datetime);
            
            // Magnetometer data
            magnetometer.mx.push(parseFloat(row.Mx));
            magnetometer.my.push(parseFloat(row.My));
            magnetometer.mz.push(parseFloat(row.Mz));
            
            // Accelerometer data
            accelerometer.ax.push(parseFloat(row.Ax));
            accelerometer.ay.push(parseFloat(row.Ay));
            accelerometer.az.push(parseFloat(row.Az));
            
            // Environmental data
            const pressureVal = parseFloat(row.Pressure);
            pressure.push(pressureVal);
            temperature.push(parseFloat(row.Temperature));
            
            // For now, use a temporary altitude calculation - we'll fix it after processing all data
            altitude.push(0); // Placeholder
        }
    }
    
    // Calculate altitude from pressure after all data is processed
    if (pressure.length > 0) {
        const maxPressure = Math.max(...pressure.filter(p => !isNaN(p)));
        for (let i = 0; i < pressure.length; i++) {
            altitude[i] = pressureToAltitude(pressure[i], maxPressure);
        }
    }
    
    // Sample data for performance if too many points
    const maxDataPoints = 10000;
    if (timeLabels.length > maxDataPoints) {
        const step = Math.floor(timeLabels.length / maxDataPoints);
        const sampledData = {
            timeLabels: [],
            magnetometer: { mx: [], my: [], mz: [] },
            accelerometer: { ax: [], ay: [], az: [] },
            altitude: [],
            pressure: [],
            temperature: []
        };
        
        for (let i = 0; i < timeLabels.length; i += step) {
            sampledData.timeLabels.push(timeLabels[i]);
            sampledData.magnetometer.mx.push(magnetometer.mx[i]);
            sampledData.magnetometer.my.push(magnetometer.my[i]);
            sampledData.magnetometer.mz.push(magnetometer.mz[i]);
            sampledData.accelerometer.ax.push(accelerometer.ax[i]);
            sampledData.accelerometer.ay.push(accelerometer.ay[i]);
            sampledData.accelerometer.az.push(accelerometer.az[i]);
            sampledData.altitude.push(altitude[i]);
            sampledData.pressure.push(pressure[i]);
            sampledData.temperature.push(temperature[i]);
        }
        
        // Recalculate altitude for sampled data
        if (sampledData.pressure.length > 0) {
            const maxPressure = Math.max(...sampledData.pressure.filter(p => !isNaN(p)));
            for (let i = 0; i < sampledData.pressure.length; i++) {
                sampledData.altitude[i] = pressureToAltitude(sampledData.pressure[i], maxPressure);
            }
        }
        
        return sampledData;
    }
    
    return {
        timeLabels,
        magnetometer,
        accelerometer,
        altitude,
        pressure,
        temperature
    };
}

// Function to create chart data based on parameter selection
function createChartDataForParameter(parameter) {
    const data = allParameterData;
    
    switch (parameter) {
        case 'magnetometer':
            return {
                timeLabels: data.timeLabels,
                datasets: [{
                    label: 'Mx (μT)',
                    data: data.magnetometer.mx,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 1,
                    pointRadius: 0
                }, {
                    label: 'My (μT)',
                    data: data.magnetometer.my,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 1,
                    pointRadius: 0
                }, {
                    label: 'Mz (μT)',
                    data: data.magnetometer.mz,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    borderWidth: 1,
                    pointRadius: 0
                }]
            };
            
        case 'accelerometer':
            return {
                timeLabels: data.timeLabels,
                datasets: [{
                    label: 'Ax (g)',
                    data: data.accelerometer.ax,
                    borderColor: 'rgb(255, 159, 64)',
                    backgroundColor: 'rgba(255, 159, 64, 0.1)',
                    borderWidth: 1,
                    pointRadius: 0
                }, {
                    label: 'Ay (g)',
                    data: data.accelerometer.ay,
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.1)',
                    borderWidth: 1,
                    pointRadius: 0
                }, {
                    label: 'Az (g)',
                    data: data.accelerometer.az,
                    borderColor: 'rgb(255, 205, 86)',
                    backgroundColor: 'rgba(255, 205, 86, 0.1)',
                    borderWidth: 1,
                    pointRadius: 0
                }]
            };
            
        case 'altitude':
            return {
                timeLabels: data.timeLabels,
                datasets: [{
                    label: 'Altitude (m)',
                    data: data.altitude,
                    borderColor: 'rgb(0, 102, 204)',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0
                }]
            };
            
        case 'pressure':
            return {
                timeLabels: data.timeLabels,
                datasets: [{
                    label: 'Pressure (hPa)',
                    data: data.pressure,
                    borderColor: 'rgb(142, 68, 173)',
                    backgroundColor: 'rgba(142, 68, 173, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0
                }]
            };
            
        case 'temperature':
            return {
                timeLabels: data.timeLabels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: data.temperature,
                    borderColor: 'rgb(255, 102, 0)',
                    backgroundColor: 'rgba(255, 102, 0, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0
                }]
            };
            
        default:
            return null;
    }
}

// Function to create a generic parameter chart
function createParameterChart(canvasId, parameter, titleId) {
    // Hide all hover lines immediately
    if (typeof magnetometerHoverLine !== 'undefined' && magnetometerHoverLine) {
        magnetometerHoverLine.style.display = 'none';
    }
    if (typeof accelerometerHoverLine !== 'undefined' && accelerometerHoverLine) {
        accelerometerHoverLine.style.display = 'none';
    }
    
    let canvas = document.getElementById(canvasId);
    let ctx = canvas.getContext('2d');
    const chartData = createChartDataForParameter(parameter);
    
    if (!chartData) return;
    
    // Update title
    const titleElement = document.getElementById(titleId);
    if (titleElement) {
        const parameterName = parameter.charAt(0).toUpperCase() + parameter.slice(1);
        titleElement.textContent = `${parameterName} vs Time`;
    }
    
    // Determine y-axis label based on parameter
    let yAxisLabel = '';
    switch (parameter) {
        case 'magnetometer':
            yAxisLabel = 'Magnetic Field (μT)';
            break;
        case 'accelerometer':
            yAxisLabel = 'Acceleration (g)';
            break;
        case 'altitude':
            yAxisLabel = 'Altitude (m)';
            break;
        case 'pressure':
            yAxisLabel = 'Pressure (hPa)';
            break;
        case 'temperature':
            yAxisLabel = 'Temperature (°C)';
            break;
    }
    
    // Destroy existing chart if it exists
    if (canvasId === 'magnetometerChart' && magnetometerChart) {
        magnetometerChart.destroy();
        magnetometerChart = null;
        // Clean up hover line
        if (magnetometerHoverLine) {
            magnetometerHoverLine.remove();
            magnetometerHoverLine = null;
        }
        // Clean up any remaining hover lines in the canvas parent
        const parent = canvas.parentElement;
        if (parent) {
            const oldHoverLines = parent.querySelectorAll('div[style*="rgba(34, 197, 94"]');
            oldHoverLines.forEach(line => line.remove());
        }
        // Clean up any selection overlays
        cleanupSelectionOverlays(canvas);
        // Remove all event listeners by cloning and replacing the canvas
        const newCanvas = canvas.cloneNode(true);
        canvas.parentNode.replaceChild(newCanvas, canvas);
        // Update canvas and ctx references
        canvas = newCanvas;
        ctx = newCanvas.getContext('2d');
    } else if (canvasId === 'accelerometerChart' && accelerometerChart) {
        accelerometerChart.destroy();
        accelerometerChart = null;
        // Clean up hover line
        if (accelerometerHoverLine) {
            accelerometerHoverLine.remove();
            accelerometerHoverLine = null;
        }
        // Clean up any remaining hover lines in the canvas parent
        const parent = canvas.parentElement;
        if (parent) {
            const oldHoverLines = parent.querySelectorAll('div[style*="rgba(34, 197, 94"]');
            oldHoverLines.forEach(line => line.remove());
        }
        // Clean up any selection overlays
        cleanupSelectionOverlays(canvas);
        // Remove all event listeners by cloning and replacing the canvas
        const newCanvas = canvas.cloneNode(true);
        canvas.parentNode.replaceChild(newCanvas, canvas);
        // Update canvas and ctx references
        canvas = newCanvas;
        ctx = newCanvas.getContext('2d');
    }
    
    // Ensure we have the current canvas reference and set dimensions
    const parentElement = canvas.parentElement;
    canvas.style.width = '100%';
    canvas.style.height = 'calc(100% - 80px)';
    
    // Set canvas dimensions based on parent container (use getBoundingClientRect for accurate dimensions)
    const parentRect = parentElement.getBoundingClientRect();
    const canvasWidth = Math.floor(parentRect.width) || 800; // Fallback to 800px
    const canvasHeight = Math.floor(parentRect.height - 80) || 400; // Fallback to 400px, account for controls
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Clear the canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.timeLabels,
            datasets: chartData.datasets
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            animation: false,
            transitions: {
                active: {
                    animation: {
                        duration: 0
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        displayFormats: {
                            millisecond: 'MMM dd HH:mm:ss',
                            second: 'MMM dd HH:mm:ss',
                            minute: 'MMM dd HH:mm',
                            hour: 'MMM dd HH:mm',
                            day: 'MMM dd HH:mm',
                            week: 'MMM dd',
                            month: 'MMM yyyy',
                            quarter: 'MMM yyyy',
                            year: 'yyyy'
                        }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 10,
                        font: {
                            size: 10,
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date and Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: yAxisLabel
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `${parameter.charAt(0).toUpperCase() + parameter.slice(1)} Data Over Time`
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 6,
                    displayColors: true,
                    titleFont: {
                        size: 12,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 11
                    },
                    padding: 8,
                    titleSpacing: 4,
                    bodySpacing: 4,
                    maxWidth: 200,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(3);
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            hover: {
                animationDuration: 0
            },
            elements: {
                point: {
                    hoverRadius: 0
                },
                line: {
                    tension: 0
                }
            }
        }
    });
    
    // Store chart reference
    if (canvasId === 'magnetometerChart') {
        magnetometerChart = chart;
    } else if (canvasId === 'accelerometerChart') {
        accelerometerChart = chart;
    }
    
    // Force chart resize after creation
    setTimeout(() => {
        chart.resize();
    }, 100);
    
    // Add time selection and hover line functionality
    addTimeSelectionToChart(chart, canvasId.replace('Chart', ''));
    addSynchronizedHoverLine(chart, canvasId.replace('Chart', ''));
    
    console.log(`${parameter} chart created with ${chartData.timeLabels.length} data points`);
}

// Function to setup parameter dropdown event listeners
function setupParameterDropdowns() {
    console.log('Setting up parameter dropdowns...');
    const chart1Dropdown = document.getElementById('chart1Parameter');
    const chart2Dropdown = document.getElementById('chart2Parameter');
    
    console.log('Chart1 dropdown found:', chart1Dropdown);
    console.log('Chart2 dropdown found:', chart2Dropdown);
    
    if (chart1Dropdown) {
        chart1Dropdown.addEventListener('change', (event) => {
            console.log('Chart1 parameter changed to:', event.target.value);
            const selectedParameter = event.target.value;
            createParameterChart('magnetometerChart', selectedParameter, 'chart1Title');
            
            // Update stored chart data for time selection functionality
            originalChartData.magnetometer = createChartDataForParameter(selectedParameter);
            
            // Remove focus from dropdown to prevent focus box appearance
            event.target.blur();
        });
        console.log('Chart1 dropdown event listener added');
    } else {
        console.error('Chart1 dropdown not found!');
    }
    
    if (chart2Dropdown) {
        chart2Dropdown.addEventListener('change', (event) => {
            console.log('Chart2 parameter changed to:', event.target.value);
            const selectedParameter = event.target.value;
            createParameterChart('accelerometerChart', selectedParameter, 'chart2Title');
            
            // Update stored chart data for time selection functionality
            originalChartData.accelerometer = createChartDataForParameter(selectedParameter);
            
            // Remove focus from dropdown to prevent focus box appearance
            event.target.blur();
        });
        console.log('Chart2 dropdown event listener added');
    } else {
        console.error('Chart2 dropdown not found!');
    }
}

// Function to create magnetometer chart
function createMagnetometerChart(data) {
    const ctx = document.getElementById('magnetometerChart').getContext('2d');
    
    // Extract time and magnetometer data
    const timeLabels = [];
    const mxData = [];
    const myData = [];
    const mzData = [];
    
    // Process all records (skip header)
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row.datetime && row.Mx !== undefined && row.My !== undefined && row.Mz !== undefined) {
            // Parse datetime string to Date object
            const datetime = new Date(row.datetime);
            timeLabels.push(datetime);
            mxData.push(parseFloat(row.Mx));
            myData.push(parseFloat(row.My));
            mzData.push(parseFloat(row.Mz));
        }
    }
    
    // Sample data for performance if too many points
    const maxDataPoints = 10000;
    let sampledTimeLabels = timeLabels;
    let sampledMxData = mxData;
    let sampledMyData = myData;
    let sampledMzData = mzData;
    
    if (timeLabels.length > maxDataPoints) {
        const step = Math.floor(timeLabels.length / maxDataPoints);
        sampledTimeLabels = [];
        sampledMxData = [];
        sampledMyData = [];
        sampledMzData = [];
        
        for (let i = 0; i < timeLabels.length; i += step) {
            sampledTimeLabels.push(timeLabels[i]);
            sampledMxData.push(mxData[i]);
            sampledMyData.push(myData[i]);
            sampledMzData.push(mzData[i]);
        }
    }
    
    // Store original data for time selection functionality
    originalChartData.magnetometer = {
        timeLabels: sampledTimeLabels,
        datasets: [{
            label: 'Mx (μT)',
            data: sampledMxData,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 1,
            pointRadius: 0
        }, {
            label: 'My (μT)',
            data: sampledMyData,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            borderWidth: 1,
            pointRadius: 0
        }, {
            label: 'Mz (μT)',
            data: sampledMzData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            borderWidth: 1,
            pointRadius: 0
        }]
    };

    magnetometerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sampledTimeLabels,
            datasets: originalChartData.magnetometer.datasets
        },
        options: {
            responsive: false, // Disable responsiveness to prevent redraws
            maintainAspectRatio: false,
            animation: false, // Disable animations to prevent loading appearance
            transitions: {
                active: {
                    animation: {
                        duration: 0
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        displayFormats: {
                            millisecond: 'MMM dd HH:mm:ss',
                            second: 'MMM dd HH:mm:ss',
                            minute: 'MMM dd HH:mm',
                            hour: 'MMM dd HH:mm',
                            day: 'MMM dd HH:mm',
                            week: 'MMM dd',
                            month: 'MMM yyyy',
                            quarter: 'MMM yyyy',
                            year: 'yyyy'
                        }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 10,
                        font: {
                            size: 10,
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date and Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Magnetic Field (μT)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Magnetometer Data Over Time'
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 6,
                    displayColors: true,
                    titleFont: {
                        size: 12,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 11
                    },
                    padding: 8,
                    titleSpacing: 4,
                    bodySpacing: 4,
                    maxWidth: 200,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(3);
                        }
                    }
                }
                // Custom selection plugin will be added via event listeners
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            hover: {
                animationDuration: 0 // Disable hover animations
            },
            elements: {
                point: {
                    hoverRadius: 0 // Disable point hover effects
                },
                line: {
                    tension: 0 // Disable line smoothing for better performance
                }
            }
        }
    });
    
    // Add click and drag selection to magnetometer chart
    addTimeSelectionToChart(magnetometerChart, 'magnetometer');
    
    // Add synchronized hover line functionality
    addSynchronizedHoverLine(magnetometerChart, 'magnetometer');
    
    console.log(`Magnetometer chart created with ${sampledTimeLabels.length} data points`);
}

// Function to create accelerometer chart
function createAccelerometerChart(data) {
    const ctx = document.getElementById('accelerometerChart').getContext('2d');
    
    // Extract time and accelerometer data
    const timeLabels = [];
    const axData = [];
    const ayData = [];
    const azData = [];
    
    // Process all records (skip header)
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row.datetime && row.Ax !== undefined && row.Ay !== undefined && row.Az !== undefined) {
            // Parse datetime string to Date object
            const datetime = new Date(row.datetime);
            timeLabels.push(datetime);
            axData.push(parseFloat(row.Ax));
            ayData.push(parseFloat(row.Ay));
            azData.push(parseFloat(row.Az));
        }
    }
    
    // Sample data for performance if too many points
    const maxDataPoints = 10000;
    let sampledTimeLabels = timeLabels;
    let sampledAxData = axData;
    let sampledAyData = ayData;
    let sampledAzData = azData;
    
    if (timeLabels.length > maxDataPoints) {
        const step = Math.floor(timeLabels.length / maxDataPoints);
        sampledTimeLabels = [];
        sampledAxData = [];
        sampledAyData = [];
        sampledAzData = [];
        
        for (let i = 0; i < timeLabels.length; i += step) {
            sampledTimeLabels.push(timeLabels[i]);
            sampledAxData.push(axData[i]);
            sampledAyData.push(ayData[i]);
            sampledAzData.push(azData[i]);
        }
    }
    
    // Store original data for time selection functionality
    originalChartData.accelerometer = {
        timeLabels: sampledTimeLabels,
        datasets: [{
            label: 'Ax (g)',
            data: sampledAxData,
            borderColor: 'rgb(255, 159, 64)',
            backgroundColor: 'rgba(255, 159, 64, 0.1)',
            borderWidth: 1,
            pointRadius: 0
        }, {
            label: 'Ay (g)',
            data: sampledAyData,
            borderColor: 'rgb(153, 102, 255)',
            backgroundColor: 'rgba(153, 102, 255, 0.1)',
            borderWidth: 1,
            pointRadius: 0
        }, {
            label: 'Az (g)',
            data: sampledAzData,
            borderColor: 'rgb(255, 205, 86)',
            backgroundColor: 'rgba(255, 205, 86, 0.1)',
            borderWidth: 1,
            pointRadius: 0
        }]
    };

    accelerometerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sampledTimeLabels,
            datasets: originalChartData.accelerometer.datasets
        },
        options: {
            responsive: false, // Disable responsiveness to prevent redraws
            maintainAspectRatio: false,
            animation: false, // Disable animations to prevent loading appearance
            transitions: {
                active: {
                    animation: {
                        duration: 0
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        displayFormats: {
                            millisecond: 'MMM dd HH:mm:ss',
                            second: 'MMM dd HH:mm:ss',
                            minute: 'MMM dd HH:mm',
                            hour: 'MMM dd HH:mm',
                            day: 'MMM dd HH:mm',
                            week: 'MMM dd',
                            month: 'MMM yyyy',
                            quarter: 'MMM yyyy',
                            year: 'yyyy'
                        }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 10,
                        font: {
                            size: 10,
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date and Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Acceleration (g)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Accelerometer Data Over Time'
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 6,
                    displayColors: true,
                    titleFont: {
                        size: 12,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 11
                    },
                    padding: 8,
                    titleSpacing: 4,
                    bodySpacing: 4,
                    maxWidth: 200,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(3);
                        }
                    }
                }
                // Custom selection plugin will be added via event listeners
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            hover: {
                animationDuration: 0 // Disable hover animations
            },
            elements: {
                point: {
                    hoverRadius: 0 // Disable point hover effects
                },
                line: {
                    tension: 0 // Disable line smoothing for better performance
                }
            }
        }
    });
    
    // Add click and drag selection to accelerometer chart
    addTimeSelectionToChart(accelerometerChart, 'accelerometer');
    
    // Add synchronized hover line functionality
    addSynchronizedHoverLine(accelerometerChart, 'accelerometer');
    
    console.log(`Accelerometer chart created with ${sampledTimeLabels.length} data points`);
}

// Function to update magnetometer chart with filtered data
function updateMagnetometerChart(filteredData) {
    if (!magnetometerChart || !filteredData) return;
    
    magnetometerChart.data.labels = filteredData.timeLabels;
    magnetometerChart.data.datasets = filteredData.datasets;
    magnetometerChart.update('none'); // No animation to prevent loading appearance
}

// Function to update accelerometer chart with filtered data
function updateAccelerometerChart(filteredData) {
    if (!accelerometerChart || !filteredData) return;
    
    accelerometerChart.data.labels = filteredData.timeLabels;
    accelerometerChart.data.datasets = filteredData.datasets;
    accelerometerChart.update('none'); // No animation to prevent loading appearance
}

// Function to add click and drag time selection to a chart
function addTimeSelectionToChart(chart, chartType) {
    const canvas = chart.canvas;
    let isSelecting = false;
    let selectionStart = null;
    let selectionEnd = null;
    let selectionOverlay = null;

    // Create selection overlay div
    function createSelectionOverlay() {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.backgroundColor = 'rgba(54, 162, 235, 0.2)'; // Translucent blue
        overlay.style.border = '1px solid rgba(54, 162, 235, 0.5)';
        overlay.style.borderTop = 'none';
        overlay.style.borderBottom = 'none';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '1000';
        overlay.style.boxSizing = 'border-box';
        overlay.setAttribute('data-selection-overlay', 'true');
        canvas.parentElement.style.position = 'relative';
        canvas.parentElement.appendChild(overlay);
        return overlay;
    }

    // Get time value from pixel position
    function getTimeFromPixel(pixelX) {
        const canvasRect = canvas.getBoundingClientRect();
        const chartArea = chart.chartArea;
        const relativeX = pixelX - canvasRect.left;
        
        if (relativeX < chartArea.left || relativeX > chartArea.right) {
            return null;
        }
        
        const xScale = chart.scales.x;
        // For time scales, get the actual time value instead of index
        const timeValue = xScale.getValueForPixel(relativeX);
        
        // Find the closest data index for this time value
        let closestIndex = 0;
        let minDiff = Math.abs(chart.data.labels[0].getTime() - timeValue);
        
        for (let i = 1; i < chart.data.labels.length; i++) {
            const diff = Math.abs(chart.data.labels[i].getTime() - timeValue);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }
        
        return closestIndex;
    }

    // Update selection overlay position and size
    function updateSelectionOverlay() {
        if (!selectionOverlay || selectionStart === null || selectionEnd === null) return;
        
        const canvasRect = canvas.getBoundingClientRect();
        const parentRect = canvas.parentElement.getBoundingClientRect();
        const chartArea = chart.chartArea;
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        
        // Get canvas offset relative to parent
        const canvasOffsetTop = canvasRect.top - parentRect.top;
        const canvasOffsetLeft = canvasRect.left - parentRect.left;
        
        // Get the time values for start and end indices
        const startTime = chart.data.labels[selectionStart];
        const endTime = chart.data.labels[selectionEnd];
        
        // Convert to pixel positions
        const startPixel = xScale.getPixelForValue(startTime);
        const endPixel = xScale.getPixelForValue(endTime);
        
        const left = Math.min(startPixel, endPixel);
        const right = Math.max(startPixel, endPixel);
        const width = right - left;
        
        // Use y-scale to get exact pixel positions for min/max values
        const topY = yScale.getPixelForValue(yScale.max);
        const bottomY = yScale.getPixelForValue(yScale.min);
        
        // Position overlay using precise y-scale bounds
        selectionOverlay.style.left = `${canvasOffsetLeft + left}px`;
        selectionOverlay.style.top = `${canvasOffsetTop + topY}px`;
        selectionOverlay.style.width = `${width}px`;
        selectionOverlay.style.height = `${bottomY - topY}px`;
    }

    // Mouse down event
    canvas.addEventListener('mousedown', (e) => {
        const timeIndex = getTimeFromPixel(e.clientX);
        if (timeIndex !== null) {
            isSelecting = true;
            selectionStart = timeIndex;
            selectionEnd = timeIndex;
            
            // Clean up any existing selection overlays first
            cleanupSelectionOverlays(canvas);
            
            // Create visual overlay
            selectionOverlay = createSelectionOverlay();
            
            // Prevent default chart interactions
            e.preventDefault();
            e.stopPropagation();
        }
    });

    // Mouse move event
    canvas.addEventListener('mousemove', (e) => {
        if (isSelecting && selectionStart !== null) {
            const timeIndex = getTimeFromPixel(e.clientX);
            if (timeIndex !== null) {
                selectionEnd = timeIndex;
                // Update visual overlay
                updateSelectionOverlay();
            }
        }
    });

    // Mouse up event
    canvas.addEventListener('mouseup', (e) => {
        if (isSelecting && selectionStart !== null && selectionEnd !== null) {
            const startTime = Math.min(selectionStart, selectionEnd);
            const endTime = Math.max(selectionStart, selectionEnd);
            
            // Only trigger selection if there's a meaningful range (at least 2 data points)
            if (Math.abs(endTime - startTime) >= 1) {
                onTimeRangeSelected(startTime, endTime, chartType);
            }
            
            // Clean up overlay
            if (selectionOverlay && selectionOverlay.parentElement) {
                selectionOverlay.parentElement.removeChild(selectionOverlay);
            }
        }
        
        isSelecting = false;
        selectionStart = null;
        selectionEnd = null;
        selectionOverlay = null;
    });

    // Mouse leave event - clean up if dragging outside canvas
    canvas.addEventListener('mouseleave', (e) => {
        if (isSelecting && selectionOverlay) {
            // Clean up overlay
            if (selectionOverlay.parentElement) {
                selectionOverlay.parentElement.removeChild(selectionOverlay);
            }
            isSelecting = false;
            selectionStart = null;
            selectionEnd = null;
            selectionOverlay = null;
        }
    });
}

// Variables to store hover line elements for synchronization
let magnetometerHoverLine = null;
let accelerometerHoverLine = null;

// Function to clean up ALL selection overlays aggressively
function cleanupSelectionOverlays(canvas) {
    const parent = canvas.parentElement;
    if (parent) {
        console.log('Aggressive cleanup of all overlays...');
        
        // Find and remove all potential selection overlay elements
        const allDivs = parent.querySelectorAll('div');
        allDivs.forEach(div => {
            const style = div.style;
            const computedStyle = window.getComputedStyle(div);
            
            // Check for ANY overlay characteristics - be very aggressive
            if (
                // Any rgba background
                style.backgroundColor.includes('rgba') ||
                computedStyle.backgroundColor.includes('rgba') ||
                
                // Any rgba border
                style.border.includes('rgba') ||
                style.borderLeft.includes('rgba') ||
                style.borderRight.includes('rgba') ||
                style.borderTop.includes('rgba') ||
                style.borderBottom.includes('rgba') ||
                
                // Absolute positioned with z-index
                (style.position === 'absolute' && (style.zIndex === '1000' || style.zIndex === '999')) ||
                
                // Pointer events none overlays
                (style.pointerEvents === 'none' && style.position === 'absolute') ||
                
                // Selection overlay identifiers
                div.hasAttribute('data-selection-overlay') ||
                div.classList.contains('selection-overlay')
            ) {
                // Don't remove dropdown containers or essential elements
                if (!div.querySelector('select') && !div.querySelector('label') && 
                    !div.textContent.includes('Parameter:') && 
                    !div.textContent.includes('Click and drag')) {
                    console.log('Removing overlay element:', div);
                    div.remove();
                }
            }
        });
    }
}

// Function to add synchronized hover line functionality to charts
function addSynchronizedHoverLine(chart, chartType) {
    const canvas = chart.canvas;
    let hoverLine = null;

    // Create hover line element
    function createHoverLine() {
        if (!hoverLine) {
            hoverLine = document.createElement('div');
            hoverLine.style.position = 'absolute';
            hoverLine.style.backgroundColor = 'rgba(34, 197, 94, 0.9)';
            hoverLine.style.width = '1px';
            hoverLine.style.border = 'none';
            hoverLine.style.boxShadow = 'none';
            hoverLine.style.margin = '0';
            hoverLine.style.padding = '0';
            hoverLine.style.pointerEvents = 'none';
            hoverLine.style.zIndex = '1001';
            hoverLine.style.display = 'none';
            canvas.parentElement.style.position = 'relative';
            canvas.parentElement.appendChild(hoverLine);
            
            // Store reference based on chart type
            if (chartType === 'magnetometer') {
                magnetometerHoverLine = hoverLine;
            } else if (chartType === 'accelerometer') {
                accelerometerHoverLine = hoverLine;
            }
        }
        return hoverLine;
    }

    // Function to show hover line at specific time position
    function showHoverLineAtTime(timeValue) {
        const chartArea = chart.chartArea;
        if (!chartArea) return;

        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        const pixelX = xScale.getPixelForValue(timeValue);
        
        if (pixelX >= chartArea.left && pixelX <= chartArea.right) {
            const line = createHoverLine();
            
            // Get canvas position relative to parent
            const canvasRect = canvas.getBoundingClientRect();
            const parentRect = canvas.parentElement.getBoundingClientRect();
            const canvasOffsetTop = canvasRect.top - parentRect.top;
            const canvasOffsetLeft = canvasRect.left - parentRect.left;
            
            // Use y-scale to get exact pixel positions for min/max values
            const topY = yScale.getPixelForValue(yScale.max);
            const bottomY = yScale.getPixelForValue(yScale.min);
            
            // Position line using precise y-scale bounds
            line.style.left = `${canvasOffsetLeft + pixelX}px`;
            line.style.top = `${canvasOffsetTop + topY}px`;
            line.style.height = `${bottomY - topY}px`;
            line.style.display = 'block';
        }
    }

    // Function to hide hover line
    function hideHoverLine() {
        if (hoverLine) {
            hoverLine.style.display = 'none';
        }
    }

    // Function to synchronize hover lines across both charts
    function syncHoverLines(timeValue, sourceChart) {
        // Ensure hover lines exist for both charts
        if (magnetometerChart && magnetometerChart !== sourceChart) {
            if (!magnetometerHoverLine) {
                // Create hover line for magnetometer chart if it doesn't exist
                const magCanvas = magnetometerChart.canvas;
                const magHoverLine = document.createElement('div');
                magHoverLine.style.position = 'absolute';
                magHoverLine.style.backgroundColor = 'rgba(34, 197, 94, 0.9)';
                magHoverLine.style.width = '1px';
                magHoverLine.style.border = 'none';
                magHoverLine.style.boxShadow = 'none';
                magHoverLine.style.margin = '0';
                magHoverLine.style.padding = '0';
                magHoverLine.style.pointerEvents = 'none';
                magHoverLine.style.zIndex = '1001';
                magHoverLine.style.display = 'none';
                magCanvas.parentElement.style.position = 'relative';
                magCanvas.parentElement.appendChild(magHoverLine);
                magnetometerHoverLine = magHoverLine;
            }
            showHoverLineOnChart(magnetometerChart, timeValue, magnetometerHoverLine);
        }
        if (accelerometerChart && accelerometerChart !== sourceChart) {
            if (!accelerometerHoverLine) {
                // Create hover line for accelerometer chart if it doesn't exist
                const accelCanvas = accelerometerChart.canvas;
                const accelHoverLine = document.createElement('div');
                accelHoverLine.style.position = 'absolute';
                accelHoverLine.style.backgroundColor = 'rgba(34, 197, 94, 0.9)';
                accelHoverLine.style.width = '1px';
                accelHoverLine.style.border = 'none';
                accelHoverLine.style.boxShadow = 'none';
                accelHoverLine.style.margin = '0';
                accelHoverLine.style.padding = '0';
                accelHoverLine.style.pointerEvents = 'none';
                accelHoverLine.style.zIndex = '1001';
                accelHoverLine.style.display = 'none';
                accelCanvas.parentElement.style.position = 'relative';
                accelCanvas.parentElement.appendChild(accelHoverLine);
                accelerometerHoverLine = accelHoverLine;
            }
            showHoverLineOnChart(accelerometerChart, timeValue, accelerometerHoverLine);
        }
    }

    // Function to show hover line on a specific chart
    function showHoverLineOnChart(targetChart, timeValue, targetHoverLine) {
        const chartArea = targetChart.chartArea;
        if (!chartArea || !targetHoverLine) return;

        const xScale = targetChart.scales.x;
        const yScale = targetChart.scales.y;
        const pixelX = xScale.getPixelForValue(timeValue);
        
        if (pixelX >= chartArea.left && pixelX <= chartArea.right) {
            // Get canvas position relative to parent
            const targetCanvas = targetChart.canvas;
            const canvasRect = targetCanvas.getBoundingClientRect();
            const parentRect = targetCanvas.parentElement.getBoundingClientRect();
            const canvasOffsetTop = canvasRect.top - parentRect.top;
            const canvasOffsetLeft = canvasRect.left - parentRect.left;
            
            // Use y-scale to get exact pixel positions for min/max values
            const topY = yScale.getPixelForValue(yScale.max);
            const bottomY = yScale.getPixelForValue(yScale.min);
            
            // Position line using precise y-scale bounds
            targetHoverLine.style.left = `${canvasOffsetLeft + pixelX}px`;
            targetHoverLine.style.top = `${canvasOffsetTop + topY}px`;
            targetHoverLine.style.height = `${bottomY - topY}px`;
            targetHoverLine.style.display = 'block';
        }
    }

    // Function to hide all hover lines
    function hideAllHoverLines() {
        if (magnetometerHoverLine) {
            magnetometerHoverLine.style.display = 'none';
        }
        if (accelerometerHoverLine) {
            accelerometerHoverLine.style.display = 'none';
        }
    }

    // Get time value from mouse position
    function getTimeFromMousePosition(event) {
        const canvasRect = canvas.getBoundingClientRect();
        const chartArea = chart.chartArea;
        const relativeX = event.clientX - canvasRect.left;
        
        if (relativeX < chartArea.left || relativeX > chartArea.right) {
            return null;
        }
        
        const xScale = chart.scales.x;
        return xScale.getValueForPixel(relativeX);
    }

    // Mouse move event handler
    canvas.addEventListener('mousemove', (event) => {
        const timeValue = getTimeFromMousePosition(event);
        if (timeValue !== null) {
            // Show hover line on current chart
            showHoverLineAtTime(timeValue);
            // Synchronize with other chart
            syncHoverLines(timeValue, chart);
        }
    });

    // Mouse leave event handler
    canvas.addEventListener('mouseleave', () => {
        hideAllHoverLines();
    });

    // Also hide lines when mouse enters the chart area but not over the chart itself
    canvas.addEventListener('mouseenter', () => {
        // This will be handled by mousemove, so we don't need to do anything here
    });
}

// Helper function to calculate altitude from barometric pressure
function pressureToAltitude(pressure, referencePressure = 1013.25) {
    // Standard atmospheric pressure formula
    // altitude = 44330 * (1 - (pressure/referencePressure)^(1/5.255))
    return 44330 * (1 - Math.pow(pressure / referencePressure, 1/5.255));
}

// Helper function to find the maximum pressure in dataset (for sea level reference)
function findMaxPressure(gpsData) {
    let maxPressure = 0;
    gpsData.forEach(gps => {
        if (gps.pressure && gps.pressure > maxPressure) {
            maxPressure = gps.pressure;
        }
    });
    return maxPressure || 1013.25; // fallback to standard if no pressure data
}

// Helper function to convert GPS coordinates to 3D positions
function convertGpsTo3D(gpsData) {
    if (gpsData.length === 0) return [];
    
    const positions = [];
    
    // Find the center point (first GPS coordinate as reference)
    const centerLon = gpsData[0].lon;
    const centerLat = gpsData[0].lat;
    
    // Use the maximum pressure in dataset as sea level reference (most realistic)
    const maxPressure = findMaxPressure(gpsData);
    const centerAlt = pressureToAltitude(maxPressure, maxPressure); // This will be 0 (sea level)
    
    // Earth radius in meters
    const earthRadius = 6371000;
    
    for (let i = 0; i < gpsData.length; i++) {
        const gps = gpsData[i];
        
        // Convert GPS coordinates to meters relative to center point
        const deltaLon = (gps.lon - centerLon) * Math.PI / 180;
        const deltaLat = (gps.lat - centerLat) * Math.PI / 180;
        const centerLatRad = centerLat * Math.PI / 180;
        
        // Calculate x, z positions in meters
        const x = deltaLon * earthRadius * Math.cos(centerLatRad);
        const z = deltaLat * earthRadius;
        
        // Use pressure-based altitude with dataset's max pressure as reference
        const pressureAlt = pressureToAltitude(gps.pressure || maxPressure, maxPressure);
        const y = (pressureAlt - centerAlt); // Use pressure-based altitude difference for Y
        
        // Scale down for visualization (GPS coordinates can span large distances)
        const scale = 0.001; // Adjust this scale factor as needed
        positions.push(new THREE.Vector3(x * scale, y, z * scale));
    }
    
    return positions;
}

// Helper function to blend GPS and accelerometer-based positions
function blendPositions(gpsPositions, accelPositions, blendFactor = 0.7) {
    if (gpsPositions.length === 0) return accelPositions;
    if (accelPositions.length === 0) return gpsPositions;
    
    const blendedPositions = [];
    const minLength = Math.min(gpsPositions.length, accelPositions.length);
    
    for (let i = 0; i < minLength; i++) {
        const blended = new THREE.Vector3();
        
        // Blend GPS (primary) with accelerometer (secondary) positions
        blended.lerpVectors(accelPositions[i], gpsPositions[i], blendFactor);
        
        blendedPositions.push(blended);
    }
    
    return blendedPositions;
}

// Helper functions to process accelerometer and magnetometer data
function integrateAcceleration(accelData, magData, dt) {
    const positions = [];
    let pos = new THREE.Vector3(0, 0, 0);
    let vel = new THREE.Vector3(0, 0, 0);
    
    // Parameters for sinusoidal motion to simulate bird's flight pattern
    const frequencyX = 0.05; // Frequency of lateral oscillation
    const frequencyY = 0.02; // Frequency of vertical oscillation
    const amplitudeX = 0.5;  // Amplitude of lateral oscillation
    const amplitudeY = 1.0;  // Amplitude of vertical oscillation
    
    // Factor to scale accelerometer influence
    const accelFactor = 2.0;
    
    // Generate path that resembles albatross patterns shown in image
    for (let i = 0; i < accelData.length; i++) {
        // Use both accelerometer and orientation data to create flight path
        
        // 1. Apply sinusoidal motion for natural bird flight
        const sinX = Math.sin(i * frequencyX) * amplitudeX;
        const sinY = Math.sin(i * frequencyY) * amplitudeY;
        
        // 2. Integrate acceleration with dampening
        const accelX = accelData[i].x * accelFactor;
        const accelY = accelData[i].y * accelFactor;
        const accelZ = accelData[i].z * accelFactor;
        
        // Add small acceleration from magnetometer for direction changes
        const magInfluence = 0.2;
        const magX = magData[i].x * magInfluence;
        const magY = magData[i].z * magInfluence; // Use Z component for vertical motion
        const magZ = magData[i].y * magInfluence;
        
        // Update velocity
        vel.x += (accelX + magX) * dt;
        vel.y += (accelY + magY + sinY) * dt;
        vel.z += (accelZ + magZ) * dt;
        
        // Apply dampening
        vel.x *= 0.98;
        vel.y *= 0.98;
        vel.z *= 0.98;
        
        // Update position
        pos.x += vel.x * dt + sinX;
        pos.y += vel.y * dt;
        pos.z += vel.z * dt;
        
        // Create occasional upward drafts and downward glides like real albatrosses
        if (i % 50 === 0) {
            vel.y += 0.5; // Simulate thermal lift
        } else if (i % 30 === 0) {
            vel.y -= 0.3; // Simulate descent during gliding
        }
        
        // Prevent going too far down
        if (pos.y < -5) {
            pos.y = -5;
            vel.y = Math.abs(vel.y) * 0.5; // Bounce slightly
        }
        
        // Create looping patterns similar to the image
        if (i % 100 === 0) {
            // Create tighter loops occasionally
            const loopAngle = (i / accelData.length) * Math.PI * 2;
            const loopRadius = 5 + Math.random() * 3;
            
            // Adjust path to create loops
            pos.x += Math.cos(loopAngle) * loopRadius * 0.1;
            pos.z += Math.sin(loopAngle) * loopRadius * 0.1;
        }
        
        positions.push(pos.clone());
    }
    
    return positions;
}

function calculateOrientation(positions, magData) {
    const orientations = [];
    
    for (let i = 0; i < positions.length; i++) {
        // Create quaternion for orientation
        const quaternion = new THREE.Quaternion();
        
        // Calculate direction of movement (look ahead to next position)
        const currentPos = positions[i];
        const nextIndex = (i + 1) % positions.length;
        const nextPos = positions[nextIndex];
        
        // Create direction vector
        const direction = new THREE.Vector3();
        direction.subVectors(nextPos, currentPos);
        
        // If movement is significant, align bird to direction of movement
        if (direction.length() > 0.001) {
            // Default forward direction for bird (z-axis)
            const up = new THREE.Vector3(0, 1, 0);
            const forward = new THREE.Vector3(0, 0, 1);
            
            // Create orientation matrix
            const matrix = new THREE.Matrix4();
            direction.normalize();
            
            // Adjust up direction based on magnetometer data (for roll)
            const magUp = new THREE.Vector3(magData[i].x, magData[i].z, magData[i].y);
            magUp.normalize();
            
            // Blend between world up and mag-based up
            up.lerp(magUp, 0.3);
            up.normalize();
            
            // Make sure up is perpendicular to direction
            const right = new THREE.Vector3();
            right.crossVectors(direction, up);
            right.normalize();
            
            // Recalculate up to ensure orthogonality
            up.crossVectors(right, direction);
            up.normalize();
            
            // Set matrix columns
            matrix.makeBasis(right, up, direction);
            
            // Extract quaternion from matrix
            quaternion.setFromRotationMatrix(matrix);
        }
        
        orientations.push(quaternion);
    }
    
    return orientations;
}

function smoothPath(positions, factor = 0.5) {
    const smoothed = [];
    smoothed.push(positions[0].clone()); // Keep first position
    
    // Apply smoothing to intermediate points
    for (let i = 1; i < positions.length - 1; i++) {
        const prev = positions[i - 1];
        const current = positions[i];
        const next = positions[i + 1];
        
        // Simple weighted average
        const smooth = new THREE.Vector3();
        smooth.addScaledVector(prev, factor * 0.5);
        smooth.addScaledVector(current, 1.0 - factor);
        smooth.addScaledVector(next, factor * 0.5);
        
        smoothed.push(smooth);
    }
    
    smoothed.push(positions[positions.length - 1].clone()); // Keep last position
    return smoothed;
}

function processData(data) {
    const accelData = [];
    const magData = [];
    const gpsData = [];
    
    // Extract acceleration, magnetometer, and GPS data
    for (let i = 1; i < data.length; i++) { // Skip header row
        const row = data[i];
        
        // Check if the row has valid data
        if (row.Ax !== undefined && row.Ay !== undefined && row.Az !== undefined && 
            row.Mx !== undefined && row.My !== undefined && row.Mz !== undefined &&
            row.lon !== undefined && row.lat !== undefined && row.Pressure !== undefined && 
            row.Temperature !== undefined) {
            
            accelData.push({
                x: parseFloat(row.Ax),
                y: parseFloat(row.Ay),
                z: parseFloat(row.Az)
            });
            
            magData.push({
                x: parseFloat(row.Mx),
                y: parseFloat(row.My),
                z: parseFloat(row.Mz)
            });
            
            // Store pressure and temperature data - altitude will be calculated later with proper reference
            const pressure = parseFloat(row.Pressure);
            const temperature = parseFloat(row.Temperature);
            
            gpsData.push({
                lon: parseFloat(row.lon),
                lat: parseFloat(row.lat),
                pressure: pressure, // Store pressure for altitude calculation
                temperature: temperature // Store temperature data
            });
        }
    }
    
    // Use all data points - no sampling/limiting
    let sampledAccelData = accelData;
    let sampledMagData = magData;
    let sampledGpsData = gpsData;
    
    // Calculate pressure-based altitudes using max pressure as sea level reference
    const maxPressure = findMaxPressure(sampledGpsData);
    sampledGpsData.forEach(gps => {
        gps.altitude = pressureToAltitude(gps.pressure, maxPressure);
    });
    
    console.log(`Processing ${accelData.length} data points from CSV (using all records)`);
    console.log(`Pressure range: ${Math.min(...sampledGpsData.map(g => g.pressure)).toFixed(1)} - ${Math.max(...sampledGpsData.map(g => g.pressure)).toFixed(1)} hPa`);
    console.log(`Temperature range: ${Math.min(...sampledGpsData.map(g => g.temperature)).toFixed(1)} - ${Math.max(...sampledGpsData.map(g => g.temperature)).toFixed(1)} °C`);
    console.log(`Altitude range: ${Math.min(...sampledGpsData.map(g => g.altitude)).toFixed(1)} - ${Math.max(...sampledGpsData.map(g => g.altitude)).toFixed(1)} m`);
    
    // Calculate positions using hybrid approach (GPS + Accelerometer + Magnetometer)
    const dt = 0.1; // Smaller time step for better integration
    
    // Get GPS-based positions
    const gpsPositions = convertGpsTo3D(sampledGpsData);
    
    // Get accelerometer-based positions (for fine motion details)
    let accelPositions = integrateAcceleration(sampledAccelData, sampledMagData, dt);
    
    // Blend GPS (coarse, accurate) with accelerometer (fine, detailed) positions
    let positions = blendPositions(gpsPositions, accelPositions, 0.8); // 80% GPS, 20% accelerometer
    
    // Apply smoothing to the path
    positions = smoothPath(positions, 0.6);
    
    // Calculate orientations based on path and magnetometer data
    const orientations = calculateOrientation(positions, sampledMagData);
    
    // Calculate parameter boundaries for all parameters and update color legend
    calculateParameterBoundaries(sampledGpsData);
    updateColorLegend(sampledGpsData);
    
    // Initialize parameter selection UI
    initParameterSelection();
    
    // Initialize legend toggle
    initLegendToggle();
    
    // Store global references for recoloring
    window.currentGpsData = sampledGpsData;
    window.totalPositions = positions.length;
    
    return {
        positions: positions,
        orientations: orientations,
        gpsData: sampledGpsData  // Include GPS data for parameter-based coloring
    };
}

// File upload handling
function updateProgressText(text) {
    const progressText = document.getElementById('progressText');
    if (progressText) {
        progressText.textContent = text;
    }
}

// Global variable for Web Worker
let dataWorker = null;

// Optimized data processing function that works with pre-processed data
function processDataOptimized(gpsData, accelerometerData, magnetometerData) {
    console.log(`Processing ${gpsData.length} optimized data points`);
    
    // Get GPS-based positions
    const gpsPositions = convertGpsTo3D(gpsData);
    
    // Convert accelerometer data to required format
    const accelData = [];
    for (let i = 0; i < accelerometerData.ax.length; i++) {
        accelData.push({
            x: accelerometerData.ax[i],
            y: accelerometerData.ay[i],
            z: accelerometerData.az[i]
        });
    }
    
    // Convert magnetometer data to required format
    const magData = [];
    for (let i = 0; i < magnetometerData.mx.length; i++) {
        magData.push({
            x: magnetometerData.mx[i],
            y: magnetometerData.my[i],
            z: magnetometerData.mz[i]
        });
    }
    
    // Get accelerometer-based positions (for fine motion details)
    const dt = 0.1;
    let accelPositions = integrateAcceleration(accelData, magData, dt);
    
    // Blend GPS (coarse, accurate) with accelerometer (fine, detailed) positions
    let positions = blendPositions(gpsPositions, accelPositions, 0.8);
    
    // Apply smoothing to the path
    positions = smoothPath(positions, 0.6);
    
    // Calculate orientations based on path and magnetometer data
    const orientations = calculateOrientation(positions, magData);
    
    // Calculate parameter boundaries for all parameters and update color legend
    calculateParameterBoundaries(gpsData);
    updateColorLegend(gpsData);
    
    // Initialize parameter selection UI
    initParameterSelection();
    
    return {
        positions: positions,
        orientations: orientations,
        gpsData: gpsData
    };
}

// Complete the visualization after data processing
function completeVisualization() {
    const processingOverlay = document.getElementById('processingOverlay');
    
    // Set initial bird position
    if (flightData && flightData.positions.length > 0) {
        bird.position.copy(flightData.positions[0]);
    }
    
    updateProgressText('Finalizing visualization...');
    
    // Hide loading message
    document.getElementById('loading').style.display = 'none';
    
    setTimeout(() => {
        processingOverlay.classList.remove('active');
        
        // Start animation
        animate();
        
        // Setup raycasting for tooltips
        setupTooltipRaycasting();
        
        // Initialize maximize buttons after all content is loaded
        initMaximizeButtons();
    }, 500);
}

function processUploadedCSV(file) {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const processingOverlay = document.getElementById('processingOverlay');
    const mainContainer = document.getElementById('mainContainer');
    
    // Hide welcome screen and show processing overlay
    welcomeScreen.classList.add('hidden');
    processingOverlay.classList.add('active');
    updateProgressText('Reading CSV file...');
    
    // Show main container first (but keep processing overlay on top)
    mainContainer.classList.remove('hidden');
    
    // Initialize Three.js scene
    updateProgressText('Initializing 3D visualization...');
    if (!initThreeJS()) {
        console.error('Failed to initialize Three.js');
        updateProgressText('Error initializing 3D scene');
        return;
    }
    
    // Check file size and determine target sample size
    const fileSizeMB = file.size / (1024 * 1024);
    let targetSize = 10000; // Default for large files
    
    if (fileSizeMB < 1) {
        targetSize = 50000; // Keep more data for small files
    } else if (fileSizeMB < 10) {
        targetSize = 20000;
    } else if (fileSizeMB < 50) {
        targetSize = 10000;
    } else {
        targetSize = 5000; // Aggressive sampling for very large files
    }
    
    console.log(`File size: ${fileSizeMB.toFixed(2)} MB, Target sample size: ${targetSize}`);
    updateProgressText(`Reading ${fileSizeMB.toFixed(1)} MB file...`);
    
    // Use streaming to parse large CSV files
    const streamedData = [];
    let rowCount = 0;
    let lastUpdateTime = Date.now();
    
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        worker: false, // We'll use our own worker
        step: function(row, parser) {
            streamedData.push(row.data);
            rowCount++;
            
            // Update progress every 500ms to avoid too many UI updates
            const now = Date.now();
            if (now - lastUpdateTime > 500) {
                updateProgressText(`Reading row ${rowCount.toLocaleString()}...`);
                lastUpdateTime = now;
            }
        },
        complete: function(results) {
            console.log(`Loaded ${streamedData.length} rows from CSV`);
            updateProgressText(`Processing ${streamedData.length.toLocaleString()} records...`);
            document.getElementById('loading').innerText = `Processing ${streamedData.length.toLocaleString()} records...`;
            
            // Store the raw data for tooltips (sampled version will be stored later)
            window.sensorData = streamedData;
            
            // Initialize Web Worker for heavy processing
            updateProgressText('Initializing data processor...');
            
            // Terminate existing worker if any
            if (dataWorker) {
                dataWorker.terminate();
            }
            
            dataWorker = new Worker('js/dataProcessor.worker.js');
            
            // Handle worker messages
            dataWorker.onmessage = function(e) {
                const { type, progress, message, data: processedData, error } = e.data;
                
                if (type === 'PROGRESS') {
                    updateProgressText(`${message} (${progress}%)`);
                } else if (type === 'COMPLETE') {
                    console.log(`Processed ${processedData.gpsData.length} points (${e.data.originalSize} original rows)`);
                    
                    try {
                        // Use processed data for charts and visualization
                        updateProgressText('Building charts...');
                        
                        // Convert time labels back to Date objects
                        const timeLabels = processedData.timeLabels.map(t => new Date(t));
                        
                        // Store in global allParameterData format
                        allParameterData = {
                            timeLabels: timeLabels,
                            magnetometer: processedData.magnetometer,
                            accelerometer: processedData.accelerometer,
                            altitude: processedData.altitude,
                            pressure: processedData.pressure,
                            temperature: processedData.temperature
                        };
                        
                        console.log('Parameter data extracted:', allParameterData);
                        
                        // Store original chart data for all parameters
                        originalChartData.magnetometer = createChartDataForParameter('magnetometer');
                        originalChartData.accelerometer = createChartDataForParameter('accelerometer');
                        originalChartData.altitude = createChartDataForParameter('altitude');
                        originalChartData.pressure = createChartDataForParameter('pressure');
                        originalChartData.temperature = createChartDataForParameter('temperature');
                        console.log('Chart data created for all parameters');
                        
                        // Create the charts with initial parameters
                        createParameterChart('magnetometerChart', 'magnetometer', 'chart1Title');
                        createParameterChart('accelerometerChart', 'accelerometer', 'chart2Title');
                        console.log('Parameter charts created');
                        
                        // Add event listeners for parameter selection dropdowns
                        setupParameterDropdowns();
                        console.log('Dropdown event listeners setup complete');
                        
                        updateProgressText('Building 3D flight path...');
                        
                        // Process 3D flight data with optimized data
                        flightData = processDataOptimized(processedData.gpsData, processedData.accelerometer, processedData.magnetometer);
                        createFlightPath(flightData.positions, flightData.gpsData);
                        
                        updateProgressText('Creating geographic map...');
                        
                        // Create the geographic map
                        createMap(flightData.gpsData);
                        
                        // Continue with visualization
                        completeVisualization();
                        
                    } catch (error) {
                        console.error('Error in visualization:', error);
                        console.error('Error stack:', error.stack);
                        console.error('Error details - Name:', error.name, 'Message:', error.message);
                        updateProgressText('Error creating visualization: ' + error.message);
                        
                        // Clean up and hide processing overlay immediately
                        const processingOverlay = document.getElementById('processingOverlay');
                        if (processingOverlay) {
                            processingOverlay.classList.remove('active');
                        }
                        
                        // Don't automatically return to welcome screen - let user see the error
                        alert('Error creating visualization: ' + error.message + '\n\nPlease check the browser console for details and try uploading again.');
                        
                        // Now return to welcome screen
                        setTimeout(() => {
                            returnToUploadScreen();
                        }, 500);
                    }
                    
                    // Cleanup worker
                    dataWorker.terminate();
                    dataWorker = null;
                    
                } else if (type === 'ERROR') {
                    console.error('Worker error:', error);
                    console.error('Worker error details:', e.data);
                    updateProgressText('Error processing data: ' + error);
                    
                    // Clean up processing overlay
                    const processingOverlay = document.getElementById('processingOverlay');
                    if (processingOverlay) {
                        processingOverlay.classList.remove('active');
                    }
                    
                    // Show error to user
                    alert('Error processing data: ' + error + '\n\nPlease try uploading again or check the browser console for details.');
                    
                    // Clean up worker
                    if (dataWorker) {
                        dataWorker.terminate();
                        dataWorker = null;
                    }
                    
                    // Return to upload screen
                    setTimeout(() => {
                        returnToUploadScreen();
                    }, 500);
                }
            };
            
            // Start processing with worker
            dataWorker.postMessage({
                type: 'PROCESS_CSV',
                data: {
                    csvData: streamedData,
                    targetSize: targetSize
                }
            });
        },
        error: function(error) {
            console.error('Error parsing CSV:', error);
            updateProgressText('Error parsing CSV file. Please try again.');
            setTimeout(() => {
                const processingOverlay = document.getElementById('processingOverlay');
                const welcomeScreen = document.getElementById('welcomeScreen');
                processingOverlay.classList.remove('active');
                welcomeScreen.classList.remove('hidden');
            }, 2000);
        }
    });
}

// Setup file upload event listeners
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('csvFileInput');
    const fileInfo = document.getElementById('fileInfo');
    const uploadArea = document.getElementById('uploadArea');
    const uploadBtn = document.querySelector('.upload-btn');
    
    // Button click triggers file input
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            fileInput.click();
        });
    }
    
    // File input change event
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            fileInfo.textContent = `Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
            processUploadedCSV(file);
        }
    });
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            fileInfo.textContent = `Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
            processUploadedCSV(file);
        } else {
            fileInfo.textContent = 'Please drop a valid CSV file';
        }
    });
});

// Function to calculate altitude boundaries based on data
// Function to calculate parameter boundaries based on GPS data
function calculateParameterBoundaries(gpsData) {
    if (!gpsData || gpsData.length === 0) return;
    
    const parameters = {
        altitude: 'altitude',
        pressure: 'pressure',
        temperature: 'temperature'
    };
    
    Object.keys(parameters).forEach(paramKey => {
        const dataKey = parameters[paramKey];
        let minVal = Infinity;
        let maxVal = -Infinity;
        
        gpsData.forEach(gps => {
            const value = gps[dataKey];
            if (value !== undefined && !isNaN(value)) {
                minVal = Math.min(minVal, value);
                maxVal = Math.max(maxVal, value);
            }
        });
        
        if (minVal === Infinity || maxVal === -Infinity) return;
        
        // Create 5 equal ranges
        const range = maxVal - minVal;
        const step = range / 5;
        
        parameterBoundaries[paramKey] = {
            low: minVal + step,
            mediumLow: minVal + step * 2,
            medium: minVal + step * 3,
            mediumHigh: minVal + step * 4,
            high: maxVal,
            min: minVal,
            max: maxVal
        };
        
        console.log(`${paramKey} boundaries calculated:`, parameterBoundaries[paramKey]);
    });
    
    // Update legacy reference
    altitudeBoundaries = parameterBoundaries.altitude;
}

// Function to calculate altitude boundaries based on GPS data (legacy support)
function calculateAltitudeBoundaries(gpsData) {
    calculateParameterBoundaries(gpsData);
}

// Generic function to get material based on parameter value
function getMaterialForParameter(value, parameter = currentColorParameter) {
    const boundaries = parameterBoundaries[parameter];
    const materials = materialSets[parameter];
    
    if (!boundaries || !materials) return materialSets.altitude.medium;
    
    if (value <= boundaries.low) {
        return materials.low;
    } else if (value <= boundaries.mediumLow) {
        return materials.mediumLow;
    } else if (value <= boundaries.medium) {
        return materials.medium;
    } else if (value <= boundaries.mediumHigh) {
        return materials.mediumHigh;
    } else {
        return materials.high;
    }
}

// Function to get material based on altitude (legacy support)
function getMaterialForAltitude(altitude) {
    return getMaterialForParameter(altitude, 'altitude');
}

// Generic function to get parameter category name
function getParameterCategoryName(value, parameter = currentColorParameter) {
    const boundaries = parameterBoundaries[parameter];
    if (!boundaries) return 'Medium';
    
    if (value <= boundaries.low) {
        return 'Low';
    } else if (value <= boundaries.mediumLow) {
        return 'Medium-Low';
    } else if (value <= boundaries.medium) {
        return 'Medium';
    } else if (value <= boundaries.mediumHigh) {
        return 'Medium-High';
    } else {
        return 'High';
    }
}

// Function to get altitude category name (legacy support)
function getAltitudeCategoryName(altitude) {
    return getParameterCategoryName(altitude, 'altitude');
}

// Function to update the color legend with parameter data
function updateColorLegend(gpsData) {
    if (!gpsData || gpsData.length === 0) return;
    
    const parameter = currentColorParameter;
    const boundaries = parameterBoundaries[parameter];
    if (!boundaries) return;
    
    const parameterName = parameter.charAt(0).toUpperCase() + parameter.slice(1);
    const unit = parameter === 'altitude' ? 'm' : 
                parameter === 'pressure' ? ' hPa' : '°C';
    
    // Update the parameter range display
    const rangeElement = document.getElementById('parameterRange');
    if (rangeElement) {
        rangeElement.innerHTML = `
            Total Range: ${boundaries.min.toFixed(1)}${unit} to ${boundaries.max.toFixed(1)}${unit}<br>
            <small>Colors based on ${parameter} ranges</small>
        `;
    }

    // Update legend title
    const titleElement = document.getElementById('legendTitle');
    if (titleElement) {
        titleElement.textContent = `${parameterName}-Based Flight Path`;
    }

    // Generate legend items dynamically
    const legendItemsContainer = document.getElementById('legendItems');
    if (legendItemsContainer) {
        const legendData = [
            { class: `${parameter}-low`, range: `${boundaries.min.toFixed(1)}${unit} - ${boundaries.low.toFixed(1)}${unit}`, label: `Low ${parameterName}` },
            { class: `${parameter}-medium-low`, range: `${boundaries.low.toFixed(1)}${unit} - ${boundaries.mediumLow.toFixed(1)}${unit}`, label: 'Medium-Low' },
            { class: `${parameter}-medium`, range: `${boundaries.mediumLow.toFixed(1)}${unit} - ${boundaries.medium.toFixed(1)}${unit}`, label: 'Medium' },
            { class: `${parameter}-medium-high`, range: `${boundaries.medium.toFixed(1)}${unit} - ${boundaries.mediumHigh.toFixed(1)}${unit}`, label: 'Medium-High' },
            { class: `${parameter}-high`, range: `${boundaries.mediumHigh.toFixed(1)}${unit} - ${boundaries.max.toFixed(1)}${unit}`, label: `High ${parameterName}` }
        ];

        legendItemsContainer.innerHTML = legendData.map(item => `
            <div class="legend-item">
                <div class="legend-color ${item.class}"></div>
                <div class="legend-text">
                    <strong>${item.label}</strong><br>
                    <small>${item.range}</small>
                </div>
            </div>
        `).join('');
    }
}

// Initialize parameter selection UI
function initParameterSelection() {
    const parameterButtons = document.querySelectorAll('.parameter-btn');
    
    parameterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            parameterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update current parameter
            const newParameter = button.dataset.parameter;
            if (newParameter && newParameter !== currentColorParameter) {
                currentColorParameter = newParameter;
                
                // Update legacy reference
                altitudeBoundaries = parameterBoundaries[currentColorParameter];
                
                // Re-render visualization with new parameter
                recolorVisualization();
            }
        });
    });
}

// Function to recolor the visualization based on the current parameter
function recolorVisualization() {
    // Update color legend
    updateColorLegend(window.currentGpsData);
    
    // Recolor 3D path segments
    if (window.pathSegments && window.currentGpsData) {
        window.pathSegments.forEach(segment => {
            const mesh = segment.mesh;
            const dataStartIndex = mesh.userData.dataStartIndex;
            const dataEndIndex = mesh.userData.dataEndIndex;
            
            // Calculate average parameter value for this segment
            let totalValue = 0;
            let valueCount = 0;
            
            const gpsData = window.currentGpsData;
            const segmentStartIndex = Math.floor((dataStartIndex / window.totalPositions) * gpsData.length);
            const segmentEndIndex = Math.min(Math.floor((dataEndIndex / window.totalPositions) * gpsData.length), gpsData.length - 1);
            
            for (let gpsIndex = segmentStartIndex; gpsIndex <= segmentEndIndex; gpsIndex++) {
                if (gpsData[gpsIndex] && gpsData[gpsIndex][currentColorParameter] !== undefined && !isNaN(gpsData[gpsIndex][currentColorParameter])) {
                    totalValue += gpsData[gpsIndex][currentColorParameter];
                    valueCount++;
                }
            }
            
            if (valueCount > 0) {
                const avgValue = totalValue / valueCount;
                mesh.material = getMaterialForParameter(avgValue, currentColorParameter);
            }
        });
    }
    
    // Recolor map path - update existing segments instead of recreating
    if (window.flightPathLayer && window.currentGpsData) {
        // Update existing path colors without clearing/recreating
        updateMapPathColors(window.currentGpsData);
    }
}

// Function to update map path colors without recreating the entire path
function updateMapPathColors(gpsData) {
    if (!window.flightPathLayer || !gpsData || gpsData.length === 0) return;
    
    // Get existing layers
    const layers = window.flightPathLayer.getLayers();
    
    // Sample points for performance (same as original creation)
    const sampleInterval = Math.max(1, Math.floor(gpsData.length / 1000));
    const sampledData = gpsData.filter((_, index) => index % sampleInterval === 0);
    
    // Update colors of existing segments
    layers.forEach((layer, index) => {
        if (index < sampledData.length - 1) {
            const point1 = sampledData[index];
            const point2 = sampledData[index + 1];
            
            // Get color based on current parameter
            const value1 = point1[currentColorParameter] || 0;
            const value2 = point2[currentColorParameter] || 0;
            const avgValue = (value1 + value2) / 2;
            const color = getParameterColor(avgValue, currentColorParameter);
            
            // Update the layer color
            layer.setStyle({ color: color });
            
            // Update popup content
            const parameterName = currentColorParameter.charAt(0).toUpperCase() + currentColorParameter.slice(1);
            const unit = currentColorParameter === 'altitude' ? 'm' : 
                        currentColorParameter === 'pressure' ? ' hPa' : '°C';
            layer.setPopupContent(`
                <strong>Flight Segment</strong><br>
                ${parameterName}: ${avgValue.toFixed(1)}${unit}<br>
                Category: ${getParameterCategoryName(avgValue, currentColorParameter)}
            `);
        }
    });
}

// Function to highlight selected time range on the map
function highlightMapTimeRange(startIndex, endIndex) {
    if (!mapHighlightLayer || !window.currentGpsData) {
        console.log("Map highlight layer or GPS data not available");
        return;
    }
    
    // Clear any existing highlights
    mapHighlightLayer.clearLayers();
    
    // Sample points for performance (same as original creation)
    const sampleInterval = Math.max(1, Math.floor(window.currentGpsData.length / 1000));
    const sampledData = window.currentGpsData.filter((_, index) => index % sampleInterval === 0);
    
    // Calculate which segments to highlight
    const startSegmentIndex = Math.floor(startIndex / sampleInterval);
    const endSegmentIndex = Math.floor(endIndex / sampleInterval);
    
    console.log(`Highlighting map segments ${startSegmentIndex} to ${endSegmentIndex}`);
    
    // Create highlighted segments
    const highlightedSegments = [];
    for (let i = startSegmentIndex; i <= endSegmentIndex && i < sampledData.length - 1; i++) {
        const point1 = sampledData[i];
        const point2 = sampledData[i + 1];
        
        // Create a thick, bright polyline for highlighting
        const highlightSegment = L.polyline([
            [point1.lat, point1.lon],
            [point2.lat, point2.lon]
        ], {
            color: '#00FF00', // Bright green
            weight: 8,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round'
        });
        
        // Add popup with time range info
        const startTime = new Date(point1.timestamp).toLocaleString();
        const endTime = new Date(point2.timestamp).toLocaleString();
        highlightSegment.bindPopup(`
            <strong>Selected Time Range</strong><br>
            Start: ${startTime}<br>
            End: ${endTime}<br>
            <em>Click to zoom to this segment</em>
        `);
        
        // Add click handler to zoom to this segment
        highlightSegment.on('click', function() {
            const bounds = L.latLngBounds([
                [point1.lat, point1.lon],
                [point2.lat, point2.lon]
            ]);
            map.fitBounds(bounds, { padding: [20, 20] });
        });
        
        mapHighlightLayer.addLayer(highlightSegment);
        highlightedSegments.push(highlightSegment);
    }
    
    // Zoom to the highlighted segment
    if (highlightedSegments.length > 0) {
        const firstSegment = highlightedSegments[0];
        const lastSegment = highlightedSegments[highlightedSegments.length - 1];
        
        // Get bounds of all highlighted segments
        const group = new L.featureGroup(highlightedSegments);
        const bounds = group.getBounds();
        
        // Zoom to the highlighted area with some padding
        map.fitBounds(bounds, { 
            padding: [30, 30],
            maxZoom: 15 // Don't zoom too close
        });
    }
    
    console.log(`Added ${highlightedSegments.length} highlighted map segments`);
}

// Initialize legend toggle functionality
function initLegendToggle() {
    const toggleButton = document.getElementById('legendToggle');
    const legend = document.getElementById('colorLegend');
    
    if (!toggleButton || !legend) return;
    
    // Set initial state - legend is hidden by default
    let isLegendVisible = false;
    
    toggleButton.addEventListener('click', () => {
        isLegendVisible = !isLegendVisible;
        
        if (isLegendVisible) {
            // Show legend
            legend.classList.remove('hidden');
            toggleButton.textContent = 'Hide Legend';
        } else {
            // Hide legend
            legend.classList.add('hidden');
            toggleButton.textContent = 'Show Legend';
        }
    });
    
    // Set initial button text
    toggleButton.textContent = isLegendVisible ? 'Hide Legend' : 'Show Legend';
}

// Create flight path from positions
function createFlightPath(positions, gpsData = null) {
    // Create path geometry
    const pathGeometry = new THREE.BufferGeometry();
    
    // Extract positions as flat array
    const pointsArray = [];
    positions.forEach(pos => {
        pointsArray.push(pos.x, pos.y, pos.z);
    });
    
    // Set positions attribute
    pathGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointsArray, 3));
    
    // Create segments group and keep reference to it
    const segmentsGroup = new THREE.Group();
    window.pathSegments = []; // Store references to path segments
    
    // Create a curve for the entire path
    const path = new THREE.CatmullRomCurve3(positions);
    
    // Use segments to create the flight path
    // Adjust segment length based on data size for better performance
    const segmentLength = Math.max(15, Math.floor(positions.length / 200)); // Dynamic segment length
    console.log(`Using segment length of ${segmentLength} points per segment`);
    
    for (let i = 0; i < positions.length - 1; i += segmentLength) {
        // Create a sub-path for this segment
        const segmentPositions = positions.slice(i, i + segmentLength + 1);
        
        if (segmentPositions.length < 2) continue;
        
        // Create a curve for this segment
        const segmentCurve = new THREE.CatmullRomCurve3(segmentPositions);
        
        // Create a flat ribbon instead of a tube
        // Optimize ribbon detail based on segment size
        const numPoints = Math.min(segmentPositions.length * 2, 100); // Limit ribbon points for performance
        const ribbonWidth = 1.2; // Width of the ribbon
        
        // Create ribbon geometry
        const ribbonGeometry = new THREE.BufferGeometry();
        const ribbonPositions = [];
        const ribbonUVs = [];
        
        // Generate points for the ribbon
        for (let j = 0; j <= numPoints; j++) {
            const t = j / numPoints;
            const point = segmentCurve.getPoint(t);
            
            // Get tangent vector at this point
            const tangent = segmentCurve.getTangent(t);
            
            // Create a normal vector perpendicular to the tangent
            // Use primarily horizontal orientation for a flatter appearance
            const normal = new THREE.Vector3();
            normal.crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
            
            // Adjust normal to be more horizontal for flatter ribbon
            normal.y *= 0.2; // Reduce vertical component
            normal.normalize();
            
            // Create two points for ribbon width
            const leftPoint = point.clone().addScaledVector(normal, -ribbonWidth / 2);
            const rightPoint = point.clone().addScaledVector(normal, ribbonWidth / 2);
            
            // Add points to ribbon
            ribbonPositions.push(
                leftPoint.x, leftPoint.y, leftPoint.z,
                rightPoint.x, rightPoint.y, rightPoint.z
            );
            
            // Add UVs for texture mapping
            ribbonUVs.push(0, t, 1, t);
        }
        
        // Create indices for triangles
        const indices = [];
        const vertexCount = numPoints * 2 + 2;
        
        for (let j = 0; j < numPoints * 2; j += 2) {
            indices.push(
                j, j + 1, j + 2,
                j + 2, j + 1, j + 3
            );
        }
        
        // Add attributes to geometry
        ribbonGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ribbonPositions, 3));
        ribbonGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(ribbonUVs, 2));
        ribbonGeometry.setIndex(indices);
        ribbonGeometry.computeVertexNormals();
        
        // Determine material based on altitude data
        let segmentMaterial = altitudeMaterials.medium; // Default material
        
        if (gpsData && gpsData.length > 0) {
            // Calculate the GPS data index corresponding to this segment
            const segmentStartIndex = Math.floor((i / positions.length) * gpsData.length);
            const segmentEndIndex = Math.min(Math.floor(((i + segmentLength) / positions.length) * gpsData.length), gpsData.length - 1);
            
            // Calculate average altitude for this segment
            let totalValue = 0;
            let valueCount = 0;
            
            for (let gpsIndex = segmentStartIndex; gpsIndex <= segmentEndIndex; gpsIndex++) {
                if (gpsData[gpsIndex] && gpsData[gpsIndex][currentColorParameter] !== undefined && !isNaN(gpsData[gpsIndex][currentColorParameter])) {
                    totalValue += gpsData[gpsIndex][currentColorParameter];
                    valueCount++;
                }
            }
            
            if (valueCount > 0) {
                const avgValue = totalValue / valueCount;
                segmentMaterial = getMaterialForParameter(avgValue, currentColorParameter);
            }
        }
        
        // Create mesh for this segment
        const segmentMesh = new THREE.Mesh(ribbonGeometry, segmentMaterial);
        
        // Store the start index in the original data for tooltip information
        segmentMesh.userData.dataStartIndex = i;
        segmentMesh.userData.dataEndIndex = Math.min(i + segmentLength, positions.length - 1);
        
        segmentsGroup.add(segmentMesh);
        
        // Calculate midpoint for positioning the bird
        const midIndex = Math.floor(segmentPositions.length / 2);
        const midpoint = segmentPositions[midIndex].clone();
        
        // Store segment information for navigation
        window.pathSegments.push({
            mesh: segmentMesh,
            positions: segmentPositions,
            midpoint: midpoint,
            index: Math.floor(i / segmentLength)
        });
    }
    
    scene.add(segmentsGroup);
    
    // Add green markers at regular intervals to represent observation points
    const markerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    
    // Add markers - adjust interval based on data size (max 50 markers)
    const markerInterval = Math.max(100, Math.floor(positions.length / 50));
    console.log(`Adding markers every ${markerInterval} positions`);
    
    for (let i = 0; i < positions.length; i += markerInterval) {
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(positions[i]);
        scene.add(marker);
    }
    
    // Create dynamic ground reference that covers the entire flight path
    createDynamicGroundReference(positions);
    
    // Initialize path navigation UI
    initPathNavigation();
}

// Variables for navigation
let currentSegmentIndex = 0; // Track the current segment
let pathPercentage = 0; // Track the current position percentage
let animationFrameId = null; // Track animation frame for cleanup

// Animation loop
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    // Safety checks
    if (!renderer || !scene || !camera || !controls) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        return;
    }
    
    // Update controls
    controls.update();
    
    // Render the scene
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    // Safety check
    if (!camera || !renderer) return;
    
    // Check if we're in fullscreen mode
    if (currentFullscreenSection) {
        // Handle fullscreen resize
        switch (currentFullscreenSection.type) {
            case '3d':
                handleFullscreen3D();
                break;
            case 'map':
                handleFullscreenMap();
                break;
            case 'magnetometer':
            case 'accelerometer':
                handleFullscreenChart(currentFullscreenSection.type);
                break;
        }
    } else {
        // Normal grid layout resize
        // Update camera aspect ratio for 25% layout (2x2 grid)
        camera.aspect = (window.innerWidth * 0.5) / (window.innerHeight * 0.5);
        camera.updateProjectionMatrix();
        
        // Update renderer size for 25% layout (2x2 grid)
        renderer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);
        
        // Resize charts if they exist
        if (magnetometerChart) {
            magnetometerChart.resize();
        }
        if (accelerometerChart) {
            accelerometerChart.resize();
        }
        
        // Resize map if it exists
        if (map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }
});

// Initialize path segment navigation
// Store event listener references to allow cleanup
let navEventListeners = {
    prevSegment: null,
    nextSegment: null,
    floatingMenuBtn: null,
    closeMenuBtn: null,
    menuBackdrop: null,
    menuUploadBtn: null,
    menuResetBtn: null
};

function initPathNavigation() {
    const segmentButtonsContainer = document.getElementById('segmentButtons');
    const pathSegments = window.pathSegments;
    
    // Clear existing buttons
    segmentButtonsContainer.innerHTML = '';
    
    // Remove old event listeners before adding new ones
    const prevBtn = document.getElementById('prevSegment');
    const nextBtn = document.getElementById('nextSegment');
    
    if (prevBtn && navEventListeners.prevSegment) {
        prevBtn.removeEventListener('click', navEventListeners.prevSegment);
    }
    if (nextBtn && navEventListeners.nextSegment) {
        nextBtn.removeEventListener('click', navEventListeners.nextSegment);
    }
    
    // Set up next/prev buttons with new listeners
    navEventListeners.prevSegment = () => {
        currentSegmentIndex = (currentSegmentIndex - 1 + pathSegments.length) % pathSegments.length;
        focusOnSegment(currentSegmentIndex);
    };
    navEventListeners.nextSegment = () => {
        currentSegmentIndex = (currentSegmentIndex + 1) % pathSegments.length;
        focusOnSegment(currentSegmentIndex);
    };
    
    if (prevBtn) prevBtn.addEventListener('click', navEventListeners.prevSegment);
    if (nextBtn) nextBtn.addEventListener('click', navEventListeners.nextSegment);
    
    // Set up floating menu - only if not already set up
    const floatingMenuBtn = document.getElementById('floatingMenuBtn');
    const floatingMenu = document.getElementById('floatingMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const menuUploadBtn = document.getElementById('menuUploadBtn');
    const menuResetBtn = document.getElementById('menuResetBtn');
    
    // Remove old listeners
    if (floatingMenuBtn && navEventListeners.floatingMenuBtn) {
        floatingMenuBtn.removeEventListener('click', navEventListeners.floatingMenuBtn);
    }
    if (closeMenuBtn && navEventListeners.closeMenuBtn) {
        closeMenuBtn.removeEventListener('click', navEventListeners.closeMenuBtn);
    }
    if (menuBackdrop && navEventListeners.menuBackdrop) {
        menuBackdrop.removeEventListener('click', navEventListeners.menuBackdrop);
    }
    if (menuUploadBtn && navEventListeners.menuUploadBtn) {
        menuUploadBtn.removeEventListener('click', navEventListeners.menuUploadBtn);
    }
    if (menuResetBtn && navEventListeners.menuResetBtn) {
        menuResetBtn.removeEventListener('click', navEventListeners.menuResetBtn);
    }
    
    // Create new listeners
    navEventListeners.floatingMenuBtn = () => toggleFloatingMenu();
    navEventListeners.closeMenuBtn = () => closeFloatingMenu();
    navEventListeners.menuBackdrop = () => closeFloatingMenu();
    navEventListeners.menuUploadBtn = () => {
        closeFloatingMenu();
        setTimeout(() => returnToUploadScreen(), 200);
    };
    navEventListeners.menuResetBtn = () => {
        closeFloatingMenu();
        setTimeout(() => globalReset(), 200);
    };
    
    // Attach new listeners
    if (floatingMenuBtn) {
        floatingMenuBtn.classList.remove('hidden');
        floatingMenuBtn.addEventListener('click', navEventListeners.floatingMenuBtn);
    }
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', navEventListeners.closeMenuBtn);
    }
    if (menuBackdrop) {
        menuBackdrop.addEventListener('click', navEventListeners.menuBackdrop);
    }
    if (menuUploadBtn) {
        menuUploadBtn.addEventListener('click', navEventListeners.menuUploadBtn);
    }
    if (menuResetBtn) {
        menuResetBtn.addEventListener('click', navEventListeners.menuResetBtn);
    }
    
    console.log('Path navigation initialized');
    
    // Initialize with the first segment
    if (pathSegments && pathSegments.length > 0) {
        focusOnSegment(0);
    }
}

// Focus on a specific path segment
function focusOnSegment(segmentIndex, positionBird = true) {
    const pathSegments = window.pathSegments;
    
    if (segmentIndex >= 0 && segmentIndex < pathSegments.length) {
        const segment = pathSegments[segmentIndex];
        currentSegmentIndex = segmentIndex; // Update current segment index
        
        // Position bird on the segment first if positionBird is true
        if (positionBird) {
            positionBirdOnSegment(segment);
        }
        
        // Calculate look-at point by averaging positions in the segment
        const lookAt = new THREE.Vector3();
        segment.positions.forEach(pos => {
            lookAt.add(pos);
        });
        lookAt.divideScalar(segment.positions.length);
        
        // Instead of repositioning camera, maintain current distance and just update the target
        // Calculate the current distance from camera to its target
        const currentDistance = camera.position.distanceTo(controls.target);
        
        // Calculate direction from new target to maintain the same relative position
        const currentDirection = new THREE.Vector3();
        currentDirection.subVectors(camera.position, controls.target).normalize();
        
        // Position camera at the same distance and direction relative to the new bird position
        const newCameraPosition = new THREE.Vector3();
        newCameraPosition.copy(bird.position).add(currentDirection.multiplyScalar(currentDistance));
        
        // Smoothly transition camera position and target
        camera.position.copy(newCameraPosition);
        camera.lookAt(bird.position);
        
        // Update orbit controls target to follow the bird
        controls.target.copy(bird.position);
        
        // Highlight the active segment by increasing its opacity
        pathSegments.forEach((segment, i) => {
            if (i === segmentIndex) {
                segment.mesh.material.opacity = 1.0;
            } else {
                segment.mesh.material.opacity = 0.3;
            }
        });
    }
}

// Position the bird on the current segment
function positionBirdOnSegment(segment) {
    if (!bird) return;
    
    // Position at the midpoint of the segment
    bird.position.copy(segment.midpoint);
    
    // Orient the bird in the direction of the segment
    if (segment.positions.length > 1) {
        // Get direction from start to end of segment
        const startPos = segment.positions[0];
        const endPos = segment.positions[segment.positions.length - 1];
        const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
        
        // Create orientation based on direction
        const up = new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(direction, up).normalize();
        up.crossVectors(right, direction).normalize();
        
        const matrix = new THREE.Matrix4().makeBasis(right, up, direction);
        bird.quaternion.setFromRotationMatrix(matrix);
    }
}

// Create sample flight path if CSV fails to load
function createSampleFlightPath() {
    // Generate path mimicking albatross flight patterns from the reference image
    const positions = [];
    const numPoints = 800;
    
    for (let i = 0; i < numPoints; i++) {
        const t = i / numPoints * Math.PI * 15;
        
        // Create figure-8 loops with vertical variations - similar to albatross patterns
        let x, y, z;
        
        // Sequence of patterns based on the reference image
        const pattern = Math.floor(i / (numPoints / 8));
        
        switch (pattern) {
            case 0: // Initial loop pattern (A in the reference image)
                const loopRadius = 10;
                const loopProgress = (i % (numPoints / 8)) / (numPoints / 8) * Math.PI * 2;
                x = loopRadius * Math.cos(loopProgress);
                y = 5 + 2 * Math.sin(loopProgress * 2);
                z = loopRadius * Math.sin(loopProgress);
                break;
                
            case 1: // Second loop (A in the reference image)
                const loop2Radius = 9;
                const loop2Progress = (i % (numPoints / 8)) / (numPoints / 8) * Math.PI * 2;
                x = 15 + loop2Radius * Math.cos(loop2Progress);
                y = 5 + 2 * Math.sin(loop2Progress * 2);
                z = loop2Radius * Math.sin(loop2Progress);
                break;
                
            case 2: // Single tight loop (B in the reference image)
                const tightLoopRadius = 8;
                const tightLoopProgress = (i % (numPoints / 8)) / (numPoints / 8) * Math.PI * 2;
                x = 30 + tightLoopRadius * Math.cos(tightLoopProgress);
                y = 10 + 3 * Math.sin(tightLoopProgress);
                z = tightLoopRadius * Math.sin(tightLoopProgress);
                break;
                
            case 3: // Vertical pattern with sharp turns (C in the reference image)
                const vProgress = (i % (numPoints / 8)) / (numPoints / 8);
                if (vProgress < 0.2) {
                    // Descending
                    x = 40;
                    y = 10 - vProgress * 50;
                    z = 0;
                } else if (vProgress < 0.4) {
                    // First turn
                    const turnProgress = (vProgress - 0.2) / 0.2;
                    x = 40 - turnProgress * 10;
                    y = 0;
                    z = turnProgress * 10;
                } else if (vProgress < 0.6) {
                    // Ascending
                    const upProgress = (vProgress - 0.4) / 0.2;
                    x = 30;
                    y = upProgress * 10;
                    z = 10;
                } else if (vProgress < 0.8) {
                    // Middle turn
                    const midTurnProgress = (vProgress - 0.6) / 0.2;
                    x = 30 + midTurnProgress * 10;
                    y = 10;
                    z = 10 - midTurnProgress * 20;
                } else {
                    // Final turn
                    const finalTurnProgress = (vProgress - 0.8) / 0.2;
                    x = 40;
                    y = 10 - finalTurnProgress * 10;
                    z = -10 + finalTurnProgress * 10;
                }
                break;
                
            case 4: // Vertical pattern with sharp turns (D in the reference image)
                const vProgress2 = (i % (numPoints / 8)) / (numPoints / 8);
                if (vProgress2 < 0.2) {
                    // Descending
                    x = -10;
                    y = 10 - vProgress2 * 50;
                    z = 30;
                } else if (vProgress2 < 0.4) {
                    // First turn
                    const turnProgress = (vProgress2 - 0.2) / 0.2;
                    x = -10 + turnProgress * 10;
                    y = -10;
                    z = 30 - turnProgress * 10;
                } else if (vProgress2 < 0.6) {
                    // Ascending
                    const upProgress = (vProgress2 - 0.4) / 0.2;
                    x = 0;
                    y = -10 + upProgress * 20;
                    z = 20;
                } else if (vProgress2 < 0.8) {
                    // Middle turn
                    const midTurnProgress = (vProgress2 - 0.6) / 0.2;
                    x = 0 - midTurnProgress * 10;
                    y = 10;
                    z = 20 + midTurnProgress * 10;
                } else {
                    // Final turn
                    const finalTurnProgress = (vProgress2 - 0.8) / 0.2;
                    x = -10;
                    y = 10 - finalTurnProgress * 10;
                    z = 30;
                }
                break;
                
            case 5: // Large loop pattern (similar to A in reference image)
                const largeLoopRadius = 15;
                const largeLoopProgress = (i % (numPoints / 8)) / (numPoints / 8) * Math.PI * 2;
                x = -30 + largeLoopRadius * Math.cos(largeLoopProgress);
                y = 5 + 2 * Math.sin(largeLoopProgress * 2);
                z = largeLoopRadius * Math.sin(largeLoopProgress);
                break;
                
            case 6: // Vertical diving and rising (mixture of C/D in reference image)
                const diveProgress = (i % (numPoints / 8)) / (numPoints / 8);
                if (diveProgress < 0.3) {
                    // Descending sharply
                    x = -20 + diveProgress * 20;
                    y = 10 - diveProgress * 30;
                    z = -20;
                } else if (diveProgress < 0.7) {
                    // Bottom curve
                    const curveProgress = (diveProgress - 0.3) / 0.4 * Math.PI;
                    x = -14 + 8 * Math.cos(curveProgress);
                    y = -10;
                    z = -20 + 8 * Math.sin(curveProgress);
                } else {
                    // Rising sharply
                    const riseProgress = (diveProgress - 0.7) / 0.3;
                    x = -6 - riseProgress * 10;
                    y = -10 + riseProgress * 20;
                    z = -12;
                }
                break;
                
            case 7: // Final circling pattern
                const finalLoopRadius = 12;
                const finalLoopProgress = (i % (numPoints / 8)) / (numPoints / 8) * Math.PI * 2;
                x = -40 + finalLoopRadius * Math.cos(finalLoopProgress);
                y = 5 + 2 * Math.sin(finalLoopProgress);
                z = -30 + finalLoopRadius * Math.sin(finalLoopProgress);
                break;
        }
        
        positions.push(new THREE.Vector3(x, y, z));
    }
    
    // Smooth the path
    const smoothedPositions = smoothPath(positions, 0.6);
    
    // Create orientations based on path direction
    const fakeData = [];
    for (let i = 0; i < smoothedPositions.length; i++) {
        fakeData.push({ x: Math.random() - 0.5, y: Math.random() - 0.5, z: Math.random() - 0.5 });
    }
    
    const orientations = calculateOrientation(smoothedPositions, fakeData);
    
    flightData = {
        positions: smoothedPositions,
        orientations: orientations
    };
    
    createFlightPath(smoothedPositions, null); // No GPS data for sample path
}

// Set up raycasting for tooltip hover effects
function setupTooltipRaycasting() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tooltipElement = document.getElementById('tooltip');
    
    // Calculate mouse position in normalized device coordinates
    function onMouseMove(event) {
        // Get the 3D container's bounding rectangle (top-left quarter of screen)
        const containerRect = containerElement.getBoundingClientRect();
        
        // Check if mouse is within the 3D visualization area
        if (event.clientX >= containerRect.left && event.clientX <= containerRect.right &&
            event.clientY >= containerRect.top && event.clientY <= containerRect.bottom) {
            
            // Calculate mouse position relative to the 3D container
            const relativeX = event.clientX - containerRect.left;
            const relativeY = event.clientY - containerRect.top;
            
            // Convert to normalized device coordinates (-1 to +1) for the 3D area only
            mouse.x = (relativeX / containerRect.width) * 2 - 1;
            mouse.y = -(relativeY / containerRect.height) * 2 + 1;
            
            // Update the raycasting check
            checkIntersection();
        } else {
            // Hide tooltip when mouse is outside 3D area
            tooltipElement.style.display = 'none';
        }
    }
    
    // Check for intersections with path segments
    function checkIntersection() {
        // Update the raycaster with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);
        
        // Calculate objects intersecting the picking ray
        if (!window.pathSegments) return;
        
        const meshes = window.pathSegments.map(segment => segment.mesh);
        const intersects = raycaster.intersectObjects(meshes);
        
        if (intersects.length > 0) {
            // Get the first intersected segment
            const intersectedObject = intersects[0].object;
            const startIndex = intersectedObject.userData.dataStartIndex;
            const endIndex = intersectedObject.userData.dataEndIndex;
            
            // Get data for this segment
            const segmentData = getSensorDataForSegment(startIndex, endIndex);
            
            // Update and show tooltip
            updateTooltip(segmentData, event.clientX, event.clientY);
            tooltipElement.style.display = 'block';
        } else {
            // Hide tooltip when not hovering over a segment
            tooltipElement.style.display = 'none';
        }
    }
    
    // Get average sensor data for the segment
    function getSensorDataForSegment(startIndex, endIndex) {
        if (!window.sensorData || window.sensorData.length === 0) {
            return { height: 'N/A', ax: 'N/A', ay: 'N/A', az: 'N/A', mx: 'N/A', my: 'N/A', mz: 'N/A', pressure: 'N/A', temperature: 'N/A', time: 'N/A' };
        }
        
        // Calculate average values for the segment
        let sumHeight = 0, sumAx = 0, sumAy = 0, sumAz = 0, sumMx = 0, sumMy = 0, sumMz = 0, sumPressure = 0, sumTemperature = 0;
        let count = 0;
        let firstDateTime = null;
        
        // Assume height is stored in the y position
        const positions = flightData.positions;
        
        // Convert segment indices to data indices
        // Since we may have downsampled data, find appropriate indices
        const dataLength = window.sensorData.length;
        const positionsLength = positions.length;
        const dataStartIndex = Math.floor((startIndex / positionsLength) * dataLength);
        const dataEndIndex = Math.floor((endIndex / positionsLength) * dataLength);
        
        for (let i = dataStartIndex; i <= Math.min(dataEndIndex, dataLength - 1); i++) {
            const data = window.sensorData[i];
            
            // Check if data has the required properties
            if (data) {
                // Get height from positions
                if (startIndex < positions.length) {
                    sumHeight += positions[startIndex].y;
                }
                
                // Get accelerometer data
                if (data.Ax !== undefined) sumAx += data.Ax;
                if (data.Ay !== undefined) sumAy += data.Ay;
                if (data.Az !== undefined) sumAz += data.Az;
                
                // Get magnetometer data
                if (data.Mx !== undefined) sumMx += data.Mx;
                if (data.My !== undefined) sumMy += data.My;
                if (data.Mz !== undefined) sumMz += data.Mz;
                
                // Get pressure data if available
                if (data.Pressure !== undefined) sumPressure += data.Pressure;
                
                // Get temperature data if available
                if (data.Temperature !== undefined) sumTemperature += data.Temperature;
                
                // Capture the first datetime for this segment
                if (firstDateTime === null && data.datetime !== undefined) {
                    firstDateTime = data.datetime;
                }
                
                count++;
            }
        }
        
        // Calculate averages
        const avgHeight = count > 0 ? (sumHeight / count).toFixed(2) : 'N/A';
        const avgAx = count > 0 ? (sumAx / count).toFixed(2) : 'N/A';
        const avgAy = count > 0 ? (sumAy / count).toFixed(2) : 'N/A';
        const avgAz = count > 0 ? (sumAz / count).toFixed(2) : 'N/A';
        const avgMx = count > 0 ? (sumMx / count).toFixed(2) : 'N/A';
        const avgMy = count > 0 ? (sumMy / count).toFixed(2) : 'N/A';
        const avgMz = count > 0 ? (sumMz / count).toFixed(2) : 'N/A';
        const avgPressure = count > 0 ? (sumPressure / count).toFixed(2) : 'N/A';
        const avgTemperature = count > 0 ? (sumTemperature / count).toFixed(2) : 'N/A';
        const formattedTime = firstDateTime ? new Date(firstDateTime).toLocaleString() : 'N/A';
        
        return {
            height: avgHeight,
            ax: avgAx,
            ay: avgAy,
            az: avgAz,
            mx: avgMx,
            my: avgMy,
            mz: avgMz,
            pressure: avgPressure,
            temperature: avgTemperature,
            time: formattedTime
        };
    }
    
    // Update tooltip position and content
    function updateTooltip(data, x, y) {
        // Set tooltip position
        tooltipElement.style.left = (x + 10) + 'px';
        tooltipElement.style.top = (y + 10) + 'px';
        
        // Update tooltip content with a table for better formatting
        tooltipElement.innerHTML = `
            <table>
                <tr><th>Time:</th><td>${data.time}</td></tr>
                <tr><th>Height:</th><td>${data.height} m</td></tr>
                <tr><th>Temperature:</th><td>${data.temperature}°C</td></tr>
                <tr><th>Accelerometer:</th><td>X: ${data.ax}, Y: ${data.ay}, Z: ${data.az}</td></tr>
                <tr><th>Magnetometer:</th><td>X: ${data.mx}, Y: ${data.my}, Z: ${data.mz}</td></tr>
                <tr><th>Pressure:</th><td>${data.pressure} hPa</td></tr>
            </table>
        `;
    }
    
    // Add mouse move event listener
    window.addEventListener('mousemove', onMouseMove, false);
}

// Update which segment is highlighted based on bird position
function updateSegmentHighlighting(positionIndex) {
    if (!window.pathSegments) return;
    
    // Calculate which segment this position belongs to
    const segmentLength = 15; // Same value used when creating segments
    const segmentIndex = Math.floor(positionIndex / segmentLength);
    
    // Highlight only the current segment
    window.pathSegments.forEach((segment, i) => {
        if (i === segmentIndex) {
            segment.mesh.material.opacity = 1.0;
        } else {
            segment.mesh.material.opacity = 0.3;
        }
    });
}

// Fullscreen functionality
let currentFullscreenSection = null;
let originalSectionStates = new Map();

// Initialize maximize button functionality
function initMaximizeButtons() {
    console.log('Initializing maximize buttons...');
    const maximizeButtons = document.querySelectorAll('.maximize-btn');
    console.log('Found', maximizeButtons.length, 'maximize buttons');
    
    maximizeButtons.forEach((button, index) => {
        console.log(`Setting up button ${index}:`, button.dataset.section);
        button.addEventListener('click', (e) => {
            console.log('Maximize button clicked:', button.dataset.section);
            e.stopPropagation();
            e.preventDefault();
            
            const sectionType = button.dataset.section;
            const section = button.closest('.section-3d, .section-map, .graph-section');
            
            console.log('Section found:', section ? section.className : 'null');
            
            if (section) {
                toggleFullscreen(section, sectionType);
            } else {
                console.error('No section found for button:', sectionType);
            }
        });
    });
    
    // Add escape key handler to exit fullscreen
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentFullscreenSection) {
            exitFullscreen();
        }
    });
}

// Toggle fullscreen for a section
function toggleFullscreen(section, sectionType) {
    console.log('Toggling fullscreen for:', sectionType, 'Current fullscreen:', currentFullscreenSection);
    if (currentFullscreenSection) {
        // Already in fullscreen, exit
        exitFullscreen();
    } else {
        // Enter fullscreen
        enterFullscreen(section, sectionType);
    }
}

// Enter fullscreen mode
function enterFullscreen(section, sectionType) {
    const mainContainer = document.querySelector('.main-container');
    
    // Store original state
    originalSectionStates.set('mainContainer', {
        className: mainContainer.className,
        style: mainContainer.style.cssText
    });
    
    // Add fullscreen classes
    mainContainer.classList.add('has-fullscreen');
    section.classList.add('section-fullscreen');
    
    currentFullscreenSection = {
        element: section,
        type: sectionType
    };
    
    // Handle specific section types
    setTimeout(() => {
        switch (sectionType) {
            case '3d':
                handleFullscreen3D();
                break;
            case 'map':
                handleFullscreenMap();
                break;
            case 'magnetometer':
            case 'accelerometer':
                handleFullscreenChart(sectionType);
                break;
        }
    }, 50); // Small delay to ensure CSS transitions complete
}

// Exit fullscreen mode
function exitFullscreen() {
    if (!currentFullscreenSection) return;
    
    const mainContainer = document.querySelector('.main-container');
    const section = currentFullscreenSection.element;
    
    // Remove fullscreen classes
    section.classList.remove('section-fullscreen');
    mainContainer.classList.remove('has-fullscreen');
    
    // Restore original state
    const originalState = originalSectionStates.get('mainContainer');
    if (originalState) {
        mainContainer.className = originalState.className;
        mainContainer.style.cssText = originalState.style;
    }
    
    // Handle specific section restoration
    setTimeout(() => {
        switch (currentFullscreenSection.type) {
            case '3d':
                restore3D();
                break;
            case 'map':
                restoreMap();
                break;
            case 'magnetometer':
            case 'accelerometer':
                restoreChart(currentFullscreenSection.type);
                break;
        }
        
        currentFullscreenSection = null;
        originalSectionStates.clear();
    }, 50); // Small delay to ensure CSS transitions complete
}

// Handle 3D visualization fullscreen
function handleFullscreen3D() {
    if (!renderer || !camera) return;
    
    // Update renderer size to full screen
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update controls
    if (controls) {
        controls.update();
    }
}

// Restore 3D visualization to grid layout
function restore3D() {
    if (!renderer || !camera) return;
    
    // Update renderer size back to quarter screen
    renderer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);
    
    // Update camera aspect ratio
    camera.aspect = (window.innerWidth * 0.5) / (window.innerHeight * 0.5);
    camera.updateProjectionMatrix();
    
    // Update controls
    if (controls) {
        controls.update();
    }
}

// Handle map fullscreen
function handleFullscreenMap() {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
}

// Restore map to grid layout
function restoreMap() {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
}

// Handle chart fullscreen
function handleFullscreenChart(chartType) {
    let chart = null;
    
    if (chartType === 'magnetometer' && magnetometerChart) {
        chart = magnetometerChart;
    } else if (chartType === 'accelerometer' && accelerometerChart) {
        chart = accelerometerChart;
    }
    
    if (chart) {
        setTimeout(() => {
            chart.resize();
        }, 100);
    }
}

// Restore chart to grid layout
function restoreChart(chartType) {
    let chart = null;
    
    if (chartType === 'magnetometer' && magnetometerChart) {
        chart = magnetometerChart;
    } else if (chartType === 'accelerometer' && accelerometerChart) {
        chart = accelerometerChart;
    }
    
    if (chart) {
        setTimeout(() => {
            chart.resize();
        }, 100);
    }
}

// Note: initMaximizeButtons() is called after data loads and DOM elements are created

