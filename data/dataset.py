import numpy as np
import time

def generate_dataset(num_points=300, num_clusters=4):
    np.random.seed(int(time.time()))  # Set a random seed based on the current time
    centers = np.random.randn(num_clusters, 2) * 5
    data = []
    for center in centers:
        data.append(center + np.random.randn(num_points // num_clusters, 2))
    return np.vstack(data)
