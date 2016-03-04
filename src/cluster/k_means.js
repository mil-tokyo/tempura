// The MIT License (MIT)

// Copyright (c) 2014 Machine Intelligence Laboratory (The University of Tokyo)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

(function(nodejs, $M, Tempura){

    if (nodejs) {
    	require('./cluster');
    	require('../utils/utils');
    	require('../utils/statistics');
    }

    var $S = Tempura.Utils.Statistics;

    function k_means(X, n_clusters, init, n_jobs, maxiter, tol){
	var X_mean = $M.sumEachCol(X).times(1.0 / X.rows);
	X = $M.sub(X, X_mean);

	var x_squared_norms = Tempura.Metrics.Pairwise.row_norms(X, true);

	if(n_jobs=1){
	    var results = _kmeans_single(X, n_clusters, x_squared_norms, init, maxiter, tol);
	    var cluster_centers_ = results.cluster_centers_;
	    var labels_ = results.labels_;
	}
	else{
	    throw new Error("not implemented");
	}
	cluster_centers_ = $M.add(cluster_centers_,X_mean);
	return { cluster_centers_ : cluster_centers_, labels_: labels_}
    }

    function _kmeans_single(X, n_clusters, squared_norms, init, maxiter, tol){
	var n_features = X.cols;
	var init_results = _init_centroids(X, n_clusters, init);

	var centers = init_results.centers;
	var labels = init_results.labels;

	var centers_old = new $M(n_clusters, n_features).zeros();


	for(var i=0; i<maxiter; i++){
	    labels = _labels_inertia(X, centers);
	    centers = _calc_centers(X, labels, n_clusters);
	    if(Tempura.Metrics.Pairwise.row_norms($M.sub(centers, centers_old)) <= tol){
		break
	    }
	    centers_old = centers;
	}

	return { cluster_centers_ : centers, labels_: labels }
    }


    function _labels_inertia(X, centers){
	var n_samples = X.rows
	var k = centers.rows
	var all_distances = Tempura.Metrics.Pairwise.euclidean_distances(centers, X, true);
	var mindist = new $M(n_samples, 1).zeros(100000);
	var labels = new $M(n_samples, 1).zeros(-1);

	for(var center_id=0; center_id<k; center_id++){
	    var dist = $M.getRow(all_distances, center_id);
	    for(var i=0; i<n_samples; i++){
		if(dist.data[i] < mindist.data[i]){
		    mindist.data[i] = dist.data[i];
		    labels.data[i] = center_id;
		}
	    }
	}
	return labels
    }


    function _calc_centers(X, labels, n_clusters){
	var n_samples = X.rows
	var n_features = X.cols
	var centers = new $M(n_clusters, n_features).zeros();
	for(var k=0; k<n_clusters; k++){
	    var n = 0
	    var means = new $M(1, n_features);
	    for(var i=0; i<n_samples; i++){
		if(labels.data[i] == k){
		    means = $M.add(means, $M.getRow(X, i));
		    n += 1;
		}
	    }
	    if(n == 0){
		throw new Error("the number of class should be more than 1");
	    }
	    set_row(centers, means.times(1.0 / n), k);
	}
	return centers
    }


    Tempura.Cluster.Kmeans = function(n_clusters, init, n_jobs, maxiter, tol) {
	if(n_clusters === undefined) n_clusters = 8;
	if(init === undefined) init = "kmeans++";
	if(n_jobs === undefined) n_jobs = 1;
	if(maxiter === undefined) maxiter = 300;
	if(tol === undefined) tol = 0.001;

	this.n_clusters = n_clusters;
	this.init = init;
	this.n_jobs = n_jobs;
	this.maxiter = maxiter;
	this.tol = tol;
    };


    Tempura.Cluster.Kmeans.prototype.fit = function(X){
	X = this._check_fit_data(X);
	var results = k_means(X, this.n_clusters, this.init, this.n_jobs, this.maxiter, this.tol);
	this.cluster_centers_ = results["cluster_centers_"];
	this.labels_ = results["labels_"];
	return this;
    }


    Tempura.Cluster.Kmeans.prototype._check_fit_data = function(X){
	'Verify that the number of samples given is larger than k'
	if(X.rows < this.n_clusters){
	    throw new Error('n_samples=' + X.rows + ' should be >= n_clusters='  + this.n_clusters);
	}
	console.log("input:")
	X.print();
	return X;
    }

    function _init_centroids(X, n_clusters, init){
	var n_samples = X.rows;
	var n_features = X.cols;
	var labels = new $M(n_samples, 1).zeros(-1);
	var centers = new $M(n_clusters, n_features).zeros();

	if(init == "random"){
	    var init_sample_ind = $S.randperm(n_clusters);
	    for(var c=0; c<n_clusters; c++){
		var index = init_sample_ind[c];
		labels.data[index] = c;
		set_row(centers, $M.getRow(X, index), c);
	    }
	}

	else if(init == "kmeans++"){
	    var old_index = $S.choice(new $M(n_samples, 1).range());
	    var all_distances = Tempura.Metrics.Pairwise.euclidean_distances(X, X);

	    for(var c=0; c<n_clusters; c++){
		setCol(all_distances, new $M(all_distances.rows, 1).zeros(), old_index);

		var dist = $M.getRow(all_distances, old_index);
		dist.times(1.0/$M.sum(dist));

		var random_value = Math.random();
		var dist_cumsum = 0;
		for(var i=0; i<dist.length; i++){
		dist_cumsum += dist.data[i];
		    if(random_value <= dist_cumsum){
			index = i;
			break;
		    }
		}
		labels.data[index] = c;
		set_row(centers, $M.getRow(X, index), c);
		old_index = index;
	    }
	}

	else{
            throw new Error("the init parameter for the k-means should be 'k-means++' or 'random'" + init + "was passed.");
	}
	return {centers : centers, labels : labels}

    }


    function set_row(X, row, i){
	var cols = X.cols;
	if(X.row_wise){
	    for(var j=0; j<cols; j++){
		X.data[i*cols + j] = row.data[j];
	    }
	}
	else{
	    throw new Error("not implemented");
	}
	return X
    }

    function setCol(X, col, j){
    var rows = X.rows;
	var cols = X.cols;
	if(X.row_wise){
	    for(var i=0; i<rows; i++){
		X.data[i*cols + j] = col.data[i];
	    }
	}
    else{
	throw new Error("not implemented")
    }

	return X
    }
})(typeof window === 'undefined', Sushi.Matrix, Tempura);
