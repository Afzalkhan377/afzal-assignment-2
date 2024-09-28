from flask import Flask, render_template, jsonify, request
from kmeans_algorithm import KMeansClustering
from data.dataset import generate_dataset
import numpy as np  # <-- This line imports numpy
app = Flask(__name__)

# Global variables for dataset and algorithm state
dataset = generate_dataset()
kmeans = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_dataset', methods=['POST'])
def generate_new_dataset():
    global dataset
    dataset = generate_dataset()  # Generate a new dataset each time
    return jsonify({'data': dataset.tolist()})  # Convert the NumPy array to list for JSON


@app.route('/initialize', methods=['POST'])
def initialize_kmeans():
    global kmeans
    k = int(request.json['k'])
    method = request.json['method']

    # Log dataset and method to ensure initialization
    print(f"Initializing KMeans with method {method} and k={k}")

    if method == 'Manual':
        # Initialize KMeans without centroids for manual mode
        kmeans = KMeansClustering(dataset, k, method)
        print(f"KMeans initialized: {kmeans}")
        return jsonify({'centroids': []})  # Centroids will be selected manually
    else:
        # Other methods initialize centroids here
        kmeans = KMeansClustering(dataset, k, method)
        print(f"KMeans initialized with centroids: {kmeans.centroids}")
        return jsonify({'centroids': kmeans.centroids.tolist()})




@app.route('/step', methods=['POST'])
def step_through_kmeans():
    global kmeans
    centroids = request.json.get('centroids', None)

    if kmeans is None:
        return jsonify({'error': 'KMeans not initialized'}), 400
    
    if centroids is None:
        return jsonify({'error': 'Centroids not provided'}), 400  # Ensure centroids are sent

    # Manually update the centroids
    kmeans.centroids = np.array(centroids)
    done, clusters = kmeans.step()
    
    return jsonify({
        'done': done,
        'clusters': clusters.tolist(),
        'centroids': kmeans.centroids.tolist()
    })



@app.route('/run_to_convergence', methods=['POST'])
def run_to_convergence():
    global kmeans
    centroids = request.json.get('centroids', None)

    if kmeans is None:
        return jsonify({'error': 'KMeans not initialized'}), 400

    if centroids is None:
        return jsonify({'error': 'Centroids not provided'}), 400

    # Manually update centroids
    kmeans.centroids = np.array(centroids)
    done, clusters = kmeans.run_to_convergence()

    return jsonify({
        'done': done,
        'clusters': clusters.tolist(),
        'centroids': kmeans.centroids.tolist()
    })



@app.route('/reset', methods=['POST'])
def reset_kmeans():
    global kmeans
    kmeans = None
    return jsonify({'status': 'reset'})

if __name__ == '__main__':
    app.run(debug=True)
