var nodejs = (typeof window === 'undefined');

if (nodejs) {
    var AgentSmith = require('../../agent_smith/src/agent_smith');
    var AgentSmithML = require('../agent_smith_ml');
    require('./cluster');
}

//require('../metric/pairwise');
var $M = AgentSmith.Matrix;


function k_means(X, n_clusters, init, n_jobs, maxiter, tol){
    X_mean = $M.sumEachCol(X).times(1.0 / X.rows);
    X = $M.sub(X, X_mean);

    x_squared_norms = row_norms(X, squared=true);

    if(n_jobs=1){
	results = _kmeans_single(X=X, n_clusters=n_clusters, squared_norms=x_squared_norms, init=init, maxiter=maxiter, tol=tol);
	cluster_centers_ = results["cluster_centers_"];
	labels_ = results["labels_"];
    }
    else{
	throw new Error("not implemented");
    }
    return { cluster_centers_ : cluster_centers_, labels_: labels_}
}

function _kmeans_single(X, n_clusters, squared_norms, init, maxiter, tol){
    var n_features = X.cols;
    var init_results = _init_centroids(X, n_clusters, init);
    var centers = init_results["centers"];
    var labels = init_results["labels"];
    var centers_old = new $M(n_clusters, n_features);
    centers_old.zeros();
    
    for(var i=0; i<maxiter; i++){
	labels = _labels_inertia(X, centers);
	centers = _calc_centers(X, labels, n_clusters);
	if(row_norms($M.sub(centers, centers_old)) <= 0.001){
	    break
	}
	centers_old = centers;
    }

    return { cluster_centers_ : centers, labels_: labels }
}


function _labels_inertia(X, centers){
    var n_samples = X.rows
    var k = centers.rows
    var all_distances = euclidean_distances(centers, X, squared=true);
    var mindist = new $M(n_samples, 1);
    mindist.zeros(100000);
    var labels = new $M(n_samples, 1);
    labels.zeros(-1);

    for(var center_id=0; center_id<k; center_id++){
	dist = get_row(all_distances, center_id);
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
    var centers = new $M(n_clusters, n_features);
    centers.zeros();
    for(var k=0; k<n_clusters; k++){
	var n = 0
	var means = new $M(1, n_features);
	for(var i=0; i<n_samples; i++){
	    if(labels.data[i] == k){
		means = $M.add(means, get_row(X, i));  
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


AgentSmithML.Cluster.Kmeans = function(n_clusters, init, n_jobs, maxiter, tol) {
    if(n_clusters === undefined) n_clusters = 8;
    if(init === undefined) init = "kmeans++";
    if(n_jobs === undefined) n_jobs = 1;
    if(maxiter === undefined) maxiter = 10;
    if(tol === undefined) tol = 0.1;

    this.n_clusters = n_clusters;
    this.init = init;
    this.n_jobs = n_jobs;
    this.maxiter = maxiter;
    this.tol = tol;
};


AgentSmithML.Cluster.Kmeans.prototype.fit = function(X){
    X = this._check_fit_data(X);
    results = k_means(X, n_clusters=this.n_clusters, init=this.init, n_jobs=this.n_jobs, maxiter=this.maxiter, tol=this.tol);
    this.cluster_centers_ = results["cluster_centers_"];
    this.labels_ = results["labels_"];
    return this
}

    
AgentSmithML.Cluster.Kmeans.prototype._check_fit_data = function(X){
    'Verify that the number of samples given is larger than k'
    if(X.rows < n_clusters){
	throw new Error('n_samples=' + X.rows + ' should be >= n_clusters='  + n_clusters);
    }
    console.log("input:")
    X.print();
    return X
}

function _init_centroids(X, n_clusters, init){
    var n_samples = X.rows;
    var n_features = X.cols;
    var labels = new $M(n_samples, 1);
    var centers = new $M(n_clusters, n_features);
    labels.zeros(-1);
    centers.zeros();

    if(init == "random"){
	var init_sample_ind = _.sample(_.range(n_samples), n_clusters);
	for(var c=0; c<n_clusters; c++){ 
	    var index = init_sample_ind[c];
	    labels.data[index] = c;
	    set_row(centers, get_row(X, index), c);
	}
    }

    else if(init == "kmeans++"){
	var old_index = _.sample(_.range(n_samples), 1);
	for(var c=0; c<n_clusters; c++){
	    var sample = get_row(X, old_index);
	    var dist = euclidian_distance(X, sample);
	    dist = dist.times(1.0 / $M.sum(dist));
	    while(1){
		var random_value = Math.random();
		var dist_cumsum = 0;
		for(var i=0; i<dist.length; i++){
		    dist_cumsum += dist.data[i];
		    if(random_value < dist_cumsum){
			index = i;
			break;
		    }
		}

		if(labels.data[index] == -1){   
		    break;
		}
	    }
	    
	    labels.data[index] = c;
	    set_row(centers, get_row(X, index), c);
	    old_index = index;
	}
    }

    else{
        throw new Error("the init parameter for the k-means should be 'k-means++' or 'random'" + init + "was passed.");
    }
    
    return {centers : centers, labels : labels}
}


function get_row(X, i){
    cols = X.cols;
    newarr = new $M(1, cols);
    newarr.zeros();
    for(var j=0; j<cols; j++){
	newarr.data[j] = X.data[i*cols + j];
    }
    return newarr
}

function set_row(X, row, i){
    cols = X.cols;
    for(var j=0; j<cols; j++){
	X.data[i*cols + j] = row.data[j];
    }
    return X
}

function euclidian_distance(mat1, mat2){
    var submat = $M.sub(mat1, mat2);
    var dist = $M.sumEachRow($M.mulEach(submat, submat));
    return dist
}


function euclidean_distances(X, Y, squared){
    if(squared === undefined) squared = false;
    if(squared == false){
        throw new Error("not implemented");
    }
    XX = row_norms(X, squared=true);
    YY = row_norms(Y, squared=true);
    var distances = $M.mul(X, Y.t());
    distances = distances.times(-2);
    distances = $M.add(distances, XX)
    distances = $M.add(distances, YY.t())
    return distances
}

function row_norms(X, squared){
    if(squared=false){
        throw new Error("not implemented");
    }
    var norms = $M.sumEachRow($M.mulEach(X, X));
    return norms
}

