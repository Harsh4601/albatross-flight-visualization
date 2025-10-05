// Web Worker for processing large CSV files
// This offloads heavy computation from the main thread

// Note: PapaParse is not needed here as CSV parsing is done in the main thread
// The worker receives already-parsed data objects

// Calculate altitude from pressure
function pressureToAltitude(pressure, seaLevelPressure) {
    if (!pressure || !seaLevelPressure || pressure <= 0) return 0;
    return 44330 * (1 - Math.pow(pressure / seaLevelPressure, 1/5.255));
}

// Process data in chunks
function processDataChunk(chunk, maxPressure) {
    const processed = {
        positions: [],
        gpsData: [],
        magnetometer: { mx: [], my: [], mz: [] },
        accelerometer: { ax: [], ay: [], az: [] },
        altitude: [],
        pressure: [],
        temperature: [],
        timeLabels: []
    };
    
    for (let i = 0; i < chunk.length; i++) {
        const row = chunk[i];
        
        if (row.Ax !== undefined && row.Ay !== undefined && row.Az !== undefined && 
            row.Mx !== undefined && row.My !== undefined && row.Mz !== undefined &&
            row.lon !== undefined && row.lat !== undefined && row.Pressure !== undefined && 
            row.Temperature !== undefined) {
            
            // GPS data
            const pressure = parseFloat(row.Pressure);
            const temperature = parseFloat(row.Temperature);
            const altitude = pressureToAltitude(pressure, maxPressure);
            
            processed.gpsData.push({
                lon: parseFloat(row.lon),
                lat: parseFloat(row.lat),
                pressure: pressure,
                temperature: temperature,
                altitude: altitude
            });
            
            // Magnetometer
            processed.magnetometer.mx.push(parseFloat(row.Mx));
            processed.magnetometer.my.push(parseFloat(row.My));
            processed.magnetometer.mz.push(parseFloat(row.Mz));
            
            // Accelerometer
            processed.accelerometer.ax.push(parseFloat(row.Ax));
            processed.accelerometer.ay.push(parseFloat(row.Ay));
            processed.accelerometer.az.push(parseFloat(row.Az));
            
            // Environmental
            processed.pressure.push(pressure);
            processed.temperature.push(temperature);
            processed.altitude.push(altitude);
            
            // Time
            if (row.datetime) {
                processed.timeLabels.push(new Date(row.datetime).getTime());
            }
        }
    }
    
    return processed;
}

// Merge processed chunks
function mergeChunks(chunks) {
    const merged = {
        gpsData: [],
        magnetometer: { mx: [], my: [], mz: [] },
        accelerometer: { ax: [], ay: [], az: [] },
        altitude: [],
        pressure: [],
        temperature: [],
        timeLabels: []
    };
    
    chunks.forEach(chunk => {
        merged.gpsData.push(...chunk.gpsData);
        merged.magnetometer.mx.push(...chunk.magnetometer.mx);
        merged.magnetometer.my.push(...chunk.magnetometer.my);
        merged.magnetometer.mz.push(...chunk.magnetometer.mz);
        merged.accelerometer.ax.push(...chunk.accelerometer.ax);
        merged.accelerometer.ay.push(...chunk.accelerometer.ay);
        merged.accelerometer.az.push(...chunk.accelerometer.az);
        merged.altitude.push(...chunk.altitude);
        merged.pressure.push(...chunk.pressure);
        merged.temperature.push(...chunk.temperature);
        merged.timeLabels.push(...chunk.timeLabels);
    });
    
    return merged;
}

// Message handler
self.addEventListener('message', function(e) {
    const { type, data } = e.data;
    
    if (type === 'PROCESS_CSV') {
        const { csvData } = data;
        
        try {
            // Step 1: Find max pressure for altitude calculation
            self.postMessage({ type: 'PROGRESS', progress: 10, message: 'Analyzing pressure data...' });
            
            let maxPressure = 0;
            for (let i = 0; i < csvData.length; i++) {
                const pressure = parseFloat(csvData[i].Pressure);
                if (pressure && pressure > maxPressure) {
                    maxPressure = pressure;
                }
            }
            
            // Step 2: Process all data in chunks to allow progress updates
            self.postMessage({ type: 'PROGRESS', progress: 20, message: `Processing all ${csvData.length} records...` });
            
            const chunkSize = 5000; // Process in larger chunks for efficiency
            const chunks = [];
            
            for (let i = 0; i < csvData.length; i += chunkSize) {
                const chunk = csvData.slice(i, Math.min(i + chunkSize, csvData.length));
                const processed = processDataChunk(chunk, maxPressure);
                chunks.push(processed);
                
                // Update progress
                const progress = 20 + (i / csvData.length) * 70;
                self.postMessage({ 
                    type: 'PROGRESS', 
                    progress: Math.floor(progress),
                    message: `Processing ${Math.min(i + chunkSize, csvData.length)} of ${csvData.length} records...`
                });
            }
            
            // Step 3: Merge chunks
            self.postMessage({ type: 'PROGRESS', progress: 95, message: 'Finalizing data...' });
            const result = mergeChunks(chunks);
            
            // Send result back to main thread
            self.postMessage({ 
                type: 'COMPLETE', 
                data: result,
                totalRecords: csvData.length
            });
            
        } catch (error) {
            self.postMessage({ 
                type: 'ERROR', 
                error: error.message 
            });
        }
    }
});

