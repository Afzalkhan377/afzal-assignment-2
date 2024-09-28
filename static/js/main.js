let kmeansData;
let currentCentroids = [];
let manualMode = false; // Track if manual mode is enabled
let mouseX, mouseY; // Variables to hold mouse position

function plotData(data, centroids) {
    let traces = [{
        x: data.map(d => d[0]),
        y: data.map(d => d[1]),
        mode: 'markers',
        type: 'scatter',
        marker: { color: 'rgba(0, 0, 255, 0.5)', size: 6 },
        name: 'Data Points'
    }];

    if (centroids.length > 0) {
        traces.push({
            x: centroids.map(c => c[0]),
            y: centroids.map(c => c[1]),
            mode: 'markers',
            type: 'scatter',
            marker: {
                color: 'red',
                size: 14,
                symbol: 'cross'
            },
            name: 'Centroids'
        });
    }

    let layout = {
        title: "KMeans Clustering",
        clickmode: 'event+select',
        showlegend: true
    };

    let config = {
        displayModeBar: false
    };

    Plotly.newPlot('plot', traces, layout, config).then(() => {
        if (manualMode) {
            // Attach click event for placing centroids
            document.getElementById('plot').on('click', function(event) {
                const coords = getClickedCoordinates(event);
                const x = coords.x;
                const y = coords.y;

                addManualCentroid(x, y); // Add the centroid at the clicked position
            });
        }
    });
}

document.getElementById('plot').onmousemove = function(event) {
    if (manualMode) {
        const coords = getClickedCoordinates(event);
        mouseX = coords.x;
        mouseY = coords.y;
    }
};

// Capture the "Enter" key press for placing centroids in manual mode
document.addEventListener('keydown', function(event) {
    if (manualMode && event.key === 'Enter') {
        addManualCentroid(mouseX, mouseY); // Place centroid at the mouse position
    }
});

// Function to convert clicked pixel coordinates to data coordinates
function getClickedCoordinates(event) {
    const plotElement = document.getElementById('plot');
    const boundingRect = plotElement.getBoundingClientRect();
    const xPixel = event.clientX - boundingRect.left;
    const yPixel = event.clientY - boundingRect.top;

    // Use Plotly's built-in method for accurate data-to-pixel conversion
    const xaxis = document.getElementById('plot')._fullLayout.xaxis;
    const yaxis = document.getElementById('plot')._fullLayout.yaxis;

    const xData = xaxis.p2d(xPixel); // Convert x from pixels to data coordinates
    const yData = yaxis.p2d(yPixel); // Convert y from pixels to data coordinates

    return { x: xData, y: yData };
}




function addManualCentroid(x, y) {
    const k = parseInt(document.getElementById('k').value); // Get the required number of centroids
    if (currentCentroids.length < k) {
        currentCentroids.push([x, y]); // Add new centroid
        plotData(kmeansData, currentCentroids); // Update the plot
        updateButtonStates(); // Enable KMeans buttons if all centroids are placed
        updateStatus(`Centroid ${currentCentroids.length} placed.`);
    } else {
        updateStatus(`All ${k} centroids have been placed.`);
    }
}

function enableKMeansButtons() {
    document.getElementById('step-kmeans').disabled = false;
    document.getElementById('converge-kmeans').disabled = false;
}


// Fetch dataset
document.getElementById('generate-dataset').addEventListener('click', function() {
    fetch('/generate_dataset', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            kmeansData = data.data;
            currentCentroids = [];
            manualMode = false;
            plotData(kmeansData, []);
        });
});

// Initialize KMeans
document.getElementById('initialize-kmeans').addEventListener('click', function() {
    const k = document.getElementById('k').value;
    const method = document.getElementById('method').value;

    fetch('/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ k, method })
    })
    .then(response => response.json())
    .then(data => {
        currentCentroids = data.centroids;  // Should be an empty array for Manual mode
        if (method === 'Manual') {
            manualMode = true;
            alert("Hover over the plot and press Enter to select your centroids.");
        } else {
            manualMode = false;
            plotData(kmeansData, currentCentroids);  // Only plot if non-manual mode
        }
    });
});



// Step through KMeans
document.getElementById('step-kmeans').addEventListener('click', function() {
    console.log('Sending centroids:', currentCentroids);  // Log centroids before sending
    fetch('/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },  // Ensure JSON content-type
        body: JSON.stringify({ centroids: currentCentroids })  // Ensure centroids are sent
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("Error:", data.error);
        } else {
            currentCentroids = data.centroids;
            plotData(kmeansData, currentCentroids);
        }
    });
});

document.getElementById('converge-kmeans').addEventListener('click', function() {
    console.log('Sending centroids:', currentCentroids);  // Log centroids before sending
    fetch('/run_to_convergence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },  // Ensure JSON content-type
        body: JSON.stringify({ centroids: currentCentroids })  // Send centroids
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("Error:", data.error);
        } else {
            currentCentroids = data.centroids;
            plotData(kmeansData, currentCentroids);
        }
    });
});



// Reset KMeans
document.getElementById('reset-kmeans').addEventListener('click', function() {
    fetch('/reset', { method: 'POST' })
        .then(() => {
            currentCentroids = [];
            manualMode = false;
            plotData(kmeansData, []);
        });
});

// Helper functions
function updateButtonStates() {
    const k = parseInt(document.getElementById('k').value);
    const stepButton = document.getElementById('step-kmeans');
    const convergeButton = document.getElementById('converge-kmeans');

    // Only enable buttons once all centroids are placed
    stepButton.disabled = currentCentroids.length < k;
    convergeButton.disabled = currentCentroids.length < k;
}



function updateStatus(message) {
    document.getElementById('status').textContent = message;
}
