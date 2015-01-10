var nodejs = (typeof window === 'undefined');

if (nodejs) {
    var AgentSmith = require('../../agent_smith/src/agent_smith');
    var AgentSmithML = require('../agent_smith_ml');
    require('./cluster');
}

var $M = AgentSmith.Matrix;

function k_means(X, n_clusters, init){
    var n_samples = X.rows;
    var n_features = X.cols;
    var init_mats = init_centroids(X, n_clusters, init);
    cluster_centers_ = init_mats[0];
    labels_ = init_mats[1];
    datanum_hist = init_mats[2];
    
    var sample_index_list = _.shuffle(_.range(n_samples));
    for(var i=0; i<n_samples; i++){
	var sample_ind = sample_index_list[i];
	if(labels_.data[sample_ind] != -1){
	    continue;
	}
	sample = get_row(X, sample_ind);
	var euc_dist = euclidian_distance(cluster_centers_, sample);
	var cls_ind = $M.argminEachCol(euc_dist).data[0];
	labels_.data[sample_ind] = cls_ind;
	var new_cls_mean = calc_new_mean(n_features, cluster_centers_, datanum_hist, sample, cls_ind);
	set_row(cluster_centers_, new_cls_mean, cls_ind);
	datanum_hist.data[cls_ind] += 1;
    }
    return { cluster_centers_ : cluster_centers_, labels_: labels_}
}

AgentSmithML.Cluster.Kmeans = function(n_clusters, init) {
    if(n_clusters === undefined) n_clusters = 8;
    if(init === undefined) init = "kmeans++";
    this.n_clusters = n_clusters;
    this.init = init;
};


AgentSmithML.Cluster.Kmeans.prototype.fit = function(X){
    X = this._check_fit_data(X);
    results = k_means(X, n_clusters=this.n_clusters, init=this.init);
    this.cluster_centers_ = results["cluster_centers_"];
    this.labels_ = results["labels_"];
    return this
}

    
AgentSmithML.Cluster.Kmeans.prototype._check_fit_data = function(X){
    //Verify that the number of samples given is larger than k
    if(X.rows < n_clusters){
	throw new Error('n_samples=' + X.rows + ' should be >= n_clusters='  + n_clusters);
    }
    return X
}

function calc_new_mean(n_features, mean_class, datanum_hist, sample, cls_ind){
    var cls_datanum = datanum_hist.data[cls_ind];
    var old_cls_mean = get_row(mean_class, cls_ind);
    var old_cls_sum = old_cls_mean.times(cls_datanum)
    var new_cls_sum = $M.add(old_cls_sum , sample)
    var tmp_row = new $M(1, n_features);
    tmp_row.zeros(cls_datanum + 1);
    var new_cls_mean = $M.divEach(new_cls_sum, tmp_row); 
    return new_cls_mean
}

function init_centroids(X, n_clusters, init){
    console.log("initializing cluster ...")
    var n_samples = X.rows;
    var n_features = X.cols;
    var assigned_class = new $M(n_samples, 1);
    var mean_class = new $M(n_clusters, n_features);
    var datanum_hist = new $M(n_clusters, 1);
    assigned_class.zeros(-1);
    mean_class.zeros();
    datanum_hist.zeros();

    if(init == "random"){
	var init_sample_ind = _.sample(_.range(n_samples), n_clusters);
	for(var c=0; c<n_clusters; c++){ 
	    var index = init_sample_ind[c];
	    assigned_class.data[index] = c;
	    datanum_hist[c] += 1;
	    set_row(mean_class, get_row(X, index), c);
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

		if(assigned_class.data[index] == -1){	    
		    break;
		}
	    }
	    
	    //var init_sample_ind = _.sample(remain_sample_ind, 1);
	    assigned_class.data[index] = c;
	    datanum_hist[c] += 1;
	    set_row(mean_class, get_row(X, index), c);
	    old_index = index;
	}
    }
    else{
        throw new Error("the init parameter for the k-means should be 'k-means++' or 'random'" + init + "was passed.");
    }
    
    return [mean_class, assigned_class, datanum_hist]
}


function get_row(X, i){
    cols = X.cols;
    newArr = new $M(1, cols);
    newArr.zeros();
    for(var j=0; j<cols; j++){
	newArr.data[j] = X.data[i*cols + j];
    }
    return newArr
}

function set_row(X, row, i){
    cols = X.cols;
    for(var j=0; j<cols; j++){
	X.data[i*cols + j] = row.data[j];
    }
    return X
}

function euclidian_distance(mat1, mat2){
    //console.log("EUC" + mat1 + '\n' + mat2 + '\n' + $M.sub(mat1, mat2));
    var submat = $M.sub(mat1, mat2);
    var dist = $M.sumEachRow($M.mulEach(submat, submat));
    return dist
}


