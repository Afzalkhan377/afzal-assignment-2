import numpy as np
from scipy.spatial.distance import cdist

class KMeansClustering:
    def __init__(self, data, k, initialization_method):
        self.data = np.array(data)
        self.k = k
        self.initialization_method = initialization_method
        self.centroids = self.initialize_centroids()
        self.clusters = None
        self.done = False
        print(f"KMeans initialized with method {self.initialization_method} and centroids: {self.centroids}")

    def initialize_centroids(self):
        if self.initialization_method == 'Random':
            indices = np.random.choice(self.data.shape[0], self.k, replace=False)
            return self.data[indices]
        elif self.initialization_method == 'Farthest First':
            return self.farthest_first_initialization()
        elif self.initialization_method == 'KMeans++':
            return self.kmeans_plus_plus_initialization()
        return np.empty((0, 2))


    def farthest_first_initialization(self):
        centroids = [self.data[np.random.randint(self.data.shape[0])]]
        
        for _ in range(1, self.k):
            distances = cdist(self.data, centroids).min(axis=1)
            next_centroid = self.data[np.argmax(distances)]
            centroids.append(next_centroid)
        
        return np.array(centroids)

    def kmeans_plus_plus_initialization(self):
        centroids = [self.data[np.random.randint(self.data.shape[0])]]
        for _ in range(1, self.k):
            distances = np.min(cdist(self.data, centroids), axis=1)
            probs = distances ** 2 / np.sum(distances ** 2)
            next_centroid = self.data[np.random.choice(self.data.shape[0], p=probs)]
            centroids.append(next_centroid)
        return np.array(centroids)

    def step(self):
        if self.done:
            return True, self.clusters
        
        distances = cdist(self.data, self.centroids)
        self.clusters = np.argmin(distances, axis=1)

        new_centroids = []
        for i in range(self.k):
            cluster_data = self.data[self.clusters == i]
            if len(cluster_data) > 0: 
                new_centroids.append(cluster_data.mean(axis=0))
            else:
                new_centroids.append(self.centroids[i])
        
        new_centroids = np.array(new_centroids)
        
        if np.all(new_centroids == self.centroids):
            self.done = True
        else:
            self.centroids = new_centroids
        
        return self.done, self.clusters


    def run_to_convergence(self):
        while not self.done:
            self.step()
        return self.done, self.clusters
