/* begin : tempura.js */
var Tempura = {};

if (typeof window === 'undefined') {
	(('global', eval)('this')).Tempura = Tempura;
	module.exports = Tempura;
}

/* end : tempura.js */

/* begin : cluster/cluster.js */
(function(nodejs, $M, Tempura){
    Tempura.Cluster = {};
})(typeof window === 'undefined', Sushi.Matrix, Tempura);


/* end : cluster/cluster.js */

/* begin : utils/utils.js */
(function(nodejs, $M, Tempura){
    Tempura.Utils = {};
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : utils/utils.js */

/* begin : utils/statistics.js */
/* --- util statistic --- */

(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
    	
    }
    
    // init
    Tempura.Utils.Statistics = {};
    var $S = Tempura.Utils.Statistics;
    
    
    /* preprocessing */
    
    // center and normalize
    $S.meanStd = function( center, normalize, X, y, ddof) {
    var ddof = (typeof ddof === "undefined") ? 1 : ddof;
	if (center) {
	    var X_mean = $M.sumEachCol(X).times( 1.0 / X.rows );
	    var tmpX = $M.sub( X, X_mean );
	    var X_std = new $M( 1, X.cols );
	    if (normalize) {
		var X_var = $M.sumEachCol($M.mulEach(tmpX,tmpX)).times( 1.0 / (X.rows - ddof));
		for (var i=0; i<X.cols; i++) {
		    var tmp = Math.sqrt( X_var.get(0,i) );
		    if (tmp !== 0) {
			X_std.set(0,i,tmp);
		    } else {
			X_std.set(0,i,1.0);
		    }
		}
		tmpX = $M.divEach( tmpX, X_std );
	    } else {
		X_std.zeros(1.0);
	    }
	    if(y){
		var y_mean = $M.sumEachCol(y).times( 1.0 / y.rows );
		var  tmpy = $M.sub( y, y_mean );
	    }
	    else{
		var tmpy = false;
		var y_mean = false;
	    }
	} else {
	    var tmpX = X.clone();
	    var tmpy = y.clone();
	    var X_mean = new $M( 1, X.cols ); X_mean.zeros();
	    var X_std = new $M( 1, X.cols ); X_mean.zeros(1.0);
	    var y_mean = new $M( 1, y.cols ); y_mean.zeros();
	}
	return { X:tmpX, y:tmpy, X_mean:X_mean, X_std:X_std, y_mean:y_mean }
    };
    
    // randperm
    $S.randperm = function(N) {
	var array = Array.apply(null, {length: N}).map(Number.call, Number);
	var last_ind = N, val, ind;
	while (last_ind) {
	    ind = Math.floor(Math.random() * last_ind--);
	    val = array[last_ind];
	    array[last_ind] = array[ind];
	    array[ind] = val;
	}
	return array
    }
    
    
    /* linear algebra */
    
    // substitution (effective linear algebra solution for triangle matrix)
    $S.fbSubstitution = function( triangle, target ) {
	var w = new $M( triangle.cols, target.cols );
	var alpha = Math.pow(10,-12);
	// forward substitution (ie. the triangle has lower shape)
	if ( triangle.get(0,triangle.cols-1) === 0 ) {
	    for (var t = 0; t<target.cols; t++) {
		for (var row = 0; row<target.rows; row++) {
		    var tmp = target.get(row,t);
		    for (var col=0; col<row; col++) {
			tmp = tmp - w.get(col,t) * triangle.get(row,col);
		    }
		    //console.log(tmp / triangle.get(row,row));
		    w.set( row, t, tmp / (triangle.get(row,row)+alpha));
		}
	    }
	} else {
	    // backward substitution
	    for (var t = 0; t<target.cols; t++) {
		for (var row = target.rows-1; -1<row; row--) {
		    var tmp = target.get(row,t);
		    for (var col=triangle.cols-1; row<col; col--) {
			tmp = tmp - w.get(col,t) * triangle.get(row,col);
		    }
		    w.set( row, t, tmp / (triangle.get(row,row)+alpha) );
			}
	    }
	}
	return w;
};
    
    
    /* mathmatics */
    
    // covariance
    $S.cov = function(X, bias){
	var n_samples = X.rows;
    var mean = $M.sumEachCol(X).times( 1.0 / n_samples );
	X = $M.sub(X, mean);
	var covs = $M.mul(X.t(), X)
	if(bias){
	    return covs.times( 1.0 / n_samples )
	}
	else{
	    return covs.times( 1.0 / (n_samples - 1) )
	}
    };
    
    // sqrt
    $S.sqrt = function(X){
	return X.clone().map(Math.sqrt)
    }
    
    // exp
    $S.exp = function(X) {
	return X.clone().map(Math.exp);
    }

    // exp
    $S.log = function(X) {
	return X.clone().map(Math.log);
    }
    
    // frac
    $S.frac = function(X){
	var ones = new $M(X.rows, X.cols);
	ones.zeros(1);
	return $M.divEach(ones, X)
    }
    
    
    /* activation funcs */
    
    // sigmoid
    $S.sigmoid = function(X) {
	return X.clone().map(function(datum){ return 1.0 / (1.0 + Math.exp(-datum))})
    }
    
    // softmax
    /* for given [n_sample, n_target] matrix */
    $S.softmax = function(X) {
	var max_val = $M.max(X); // avoid overflow
	var exp_x = $S.exp( X.map(function(datum){return datum-max_val}) );
	var sum_exp_x = $M.sumEachRow( exp_x );
	var output = $M.divEach( exp_x, sum_exp_x );
	return output;
    };
    
    
    $S.chomskyDecomposition = function(X){
	// decompose postive definite symmetric matrix X = QQ^T
	var svd_result = $M.svd(X);
	var U = svd_result.U
	var W = $M.diag($S.sqrt(svd_result.S))
	var Q = $M.mul(U, W);
	return Q
    };

    $S.choice = function(X){
	return X.data[Math.floor(Math.random() * X.length)]
    };
    
    $S.deleteRow = function(X, ind){
	var newM = new $M(X.rows - 1, X.cols);
	newM.syncData();
	if(X.row_wise){
	    var newi = 0;
	    for(var i=0; i<X.rows; i++){
		if(i == ind){
		    continue;
		}
		for(var j=0; j<X.cols; j++){
		    newM.data[newi * X.cols + j] = X.data[i * X.cols + j];
	    }
		newi += 1;
	    }
	}
	else{
	    var newi = 0;
	    for(var i=0; i<X.rows; i++){
		if(i == ind){
		    continue;
		}
		for(var j=0; j<X.cols; j++){
		    newM.data[newi * X.cols + j] = X.data[j * X.rows + i];
		}
		newi += 1;
	    }
	}
    return newM
    };
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : utils/statistics.js */

/* begin : cluster/k_means.js */
(function(nodejs, $M, Tempura){

    if (nodejs) {
    	
    	
    	
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



/* end : cluster/k_means.js */

/* begin : cross_decomposition/cross_decomposition.js */
(function(nodejs, $M, Tempura){
    Tempura.CrossDecomposition = {};
})(typeof window === 'undefined', Sushi.Matrix, Tempura);



/* end : cross_decomposition/cross_decomposition.js */

/* begin : cross_decomposition/cca.js */
(function(nodejs, $M, Tempura){
    if (nodejs) {
		
		
    }

    var $S = Tempura.Utils.Statistics;

    // http://nalab.mind.meiji.ac.jp/~mk/labo/text/generalized-eigenvalue-problem.pdf
    // http://case.f7.ems.okayama-u.ac.jp/statedu/hbw2-book/node82.html
    function cca(X, Y){
	var X_features = X.cols;
	var Y_features = Y.cols;
	if(X_features > Y_features){
	    throw new Error("X_features should be greater than Y_features");
	}
	
	var covs = $S.cov($M.hstack([X, Y]), false);
	var cov11 = $M.extract(covs, 0, 0, X_features, X_features);
	var cov12 = $M.extract(covs, 0, X_features, X_features, Y_features);
	var cov21 = cov12.t();
	var cov22 = $M.extract(covs, X_features, X_features, Y_features, Y_features);
	
	var R11 = $S.chomskyDecomposition(cov11);
	var R22 = $S.chomskyDecomposition(cov22);

	var svd_results_A = $M.svd($M.mul($M.mul(R11.inverse(), cov12), R22.t().inverse()).t());
	var lambda = svd_results_A.S;

	var A = $M.mul(R11.t().inverse(), svd_results_A.V);
	var B = $M.mul(cov22.inverse(), $M.mul(cov21, $M.divEach(A, lambda)));
    
	return { U : A, V : B, lambda : lambda }
    }

    Tempura.CrossDecomposition.CCA = function(n_components, scale) {
	this.n_components = typeof n_components === "undefined" ? 2 : n_components;
	this.scale = typeof scale === "undefined" ? true : scale;
    };

    Tempura.CrossDecomposition.CCA.prototype.fit = function(X, Y){
	if(this.n_components > Math.min(X.cols, Y.cols)){
	    throw new Error("n_components should be smaller than the number of features.");
	}

	if(X.rows != Y.rows){
	    throw new Error("the number of samples in X and Y should be the same.");
	}

	if(this.scale){
	    var X_meanStd = $S.meanStd(true, true, X, false, 1);
	    X = X_meanStd.X;
	    this.X_mean = X_meanStd.X_mean;
	    this.X_std = X_meanStd.X_std;

	    var Y_meanStd = $S.meanStd(true, true, Y, false, 1);
	    Y = Y_meanStd.X;
	    this.Y_mean = Y_meanStd.X_mean;
	    this.Y_std = Y_meanStd.X_std;
	}

	if(X.cols < Y.cols){
	    var cca_results = cca(X, Y);
	    this.X_projection = $M.extract(cca_results.U, 0, 0, X.cols, this.n_components);
	    this.Y_projection = $M.extract(cca_results.V, 0, 0, Y.cols, this.n_components);
	}
	else{
	    var cca_results = cca(Y, X);
	    this.X_projection = $M.extract(cca_results.V, 0, 0, X.cols, this.n_components);
	    this.Y_projection = $M.extract(cca_results.U, 0, 0, Y.cols, this.n_components);
	}
	return this;
    }

    Tempura.CrossDecomposition.CCA.prototype.transform = function(X, Y){	
	if(X.rows != Y.rows){
	    throw new Error("the number of samples in X and Y should be the same.");
	}
	
	if(X.cols != this.X_projection.rows || Y.cols != this.Y_projection.rows){
	    throw new Error("dimension of data is different from projection matrix");
	}
	
	if(this.scale){
	    X = $M.divEach($M.sub(X, this.X_mean), this.X_std);
	    Y = $M.divEach($M.sub(Y, this.Y_mean), this.Y_std);
	}
	var X_score = $M.mul(X, this.X_projection);
	var Y_score = $M.mul(Y, this.Y_projection);
	return {X_score : X_score, Y_score : Y_score};
    }
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : cross_decomposition/cca.js */

/* begin : decomposition/decomposition.js */
(function(nodejs, $M, Tempura){
    Tempura.Decomposition = {};
})(typeof window === 'undefined', Sushi.Matrix, Tempura);




/* end : decomposition/decomposition.js */

/* begin : decomposition/pca.js */
(function(nodejs, $M, Tempura){
    if (nodejs) {
    	
    }

    Tempura.Decomposition.PCA = function(n_components, whiten) {
	this.n_components = typeof n_components === "undefined" ? 1.0 : n_components;
	this.whiten = typeof whiten === "undefined" ? false : whiten
    };

    Tempura.Decomposition.PCA.prototype.fit = function(X){
	var n_samples = X.rows;
	var n_features = X.cols;
	this.mean_ = $M.sumEachCol(X).times(1.0 / n_samples).toRowWise();
	X = $M.sub(X, this.mean_).toRowWise();
	var svd_results = $M.svd(X);
	var U = svd_results.U;
	var S = svd_results.S;
	var V = svd_results.V.t();
	var explained_variance_ = $M.mulEach(S, S).times( 1.0 / n_samples );
	var explained_variance_ratio_ = explained_variance_.times( 1.0 / $M.sum(explained_variance_));
	if(this.whiten == true){
	    var components_ = $M.divEach( V,  S.t().times( 1.0 / Math.sqrt(n_samples)) );
	}
	else{
            var components_ = V;
	}
	
	var n_components = this.n_components;
	if( isNaN(n_components) ){
	    n_components = n_features;
	}
	else if( n_components == "mle" ){
	    if( n_samples < n_features ){
		throw new Error("n_components='mle' is only supported if n_samples >= n_features");
	    }
	    throw new Error("'mle' is not supported")
            n_components = _infer_dimension_(explained_variance_, n_samples, n_features);
	}
	else if(n_components < 0 || n_components > n_features){
            throw new ValueError("n_components=" + n_components + "invalid for n_features=" + n_features);
	}

	if(0 < n_components &&  n_components <= 1.0){
	    var ratio_cumsum = 0;
	    var components_ratio = n_components;
	    n_components = 0;
	    for(var i=0; i<explained_variance_ratio_.length; i++){
		n_components += 1;
		ratio_cumsum += explained_variance_ratio_.data[i];
		if(ratio_cumsum > components_ratio){
		    break
		}
	    }
	}
	
	if(n_components < n_features){
	    var noise_variance_ = $M.extract(explained_variance_, 0, n_components, 0, explained_variance_.cols - n_components);
	    this.noise_variance_ = $M.sumEachCol(noise_variance_).times( 1.0 / noise_variance_.rows)
	}
	else{
	    this.noise_variance_ = 0;
	}
	
	this.n_samples_ = n_samples;
	this.components_ = $M.extract(components_, 0, 0, n_components, components_.cols); 
	this.explained_variance_ = $M.extract(explained_variance_, 0, 0, n_components, explained_variance_.cols);
	this.explained_variance_ratio_ = $M.extract(explained_variance_ratio_, 0, 0, n_components, explained_variance_ratio_.cols);
	this.n_components_ = n_components
    }
    
    Tempura.Decomposition.PCA.prototype.transform = function(X){
	if(typeof this.mean_ !== "undefined"){
            X = $M.sub(X,this.mean_);
	}
	
	X = $M.mul(X, this.components_.t())
	return X;
    }

    
    function _infer_dimension_(explained_variance_, n_samples, n_features){
	throw new Error("not implemented");
    }
    
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : decomposition/pca.js */

/* begin : linear_model/linear_model.js */
(function(nodejs, $M, Tempura){
    Tempura.LinearModel = {};
})(typeof window === 'undefined', Sushi.Matrix, Tempura);


/* end : linear_model/linear_model.js */

/* begin : linear_model/base.js */
/* --- base --- */
(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
    	
    }
        
    // init
    Tempura.LinearModel.Base = {};
    var $Base = Tempura.LinearModel.Base;

    
    /* algorithms */

    // soft threshold
    $Base.softThreshold = function( target, gamma ) {
	if ( gamma < Math.abs(target) && 0 < target ) {
	    return target - gamma;
	} else if ( gamma < Math.abs(target) && target < 0 ) {
	    return target + gamma;
	} else {
	    return 0.0;
	}
    };
    
    // coorindate descent
    $Base.coordinateDescent = function( X, y, lambda, alpha, n_iter, tolerance ) {
	var w = new $M( X.cols, y.cols ); w.zeros();
	var errors = new $M( X.cols, y.cols );
	var c = $M.mul( X.t(), y );
	for (var iter=0; iter<n_iter; iter++) {
	    for (var row=0; row<X.cols; row++) {
		for (var col=0; col<y.cols; col++) {
		    var tmp = $M.dot( $M.mul( $M.getCol(X,row).t(), X).t(), $M.getCol(w,col));
		    var target = w.get(row,col) + c.get(row,col) - tmp;
		    var update = $Base.softThreshold( target, lambda*alpha ) / ( 1.0 + lambda*(1.0-alpha) );
		    var delta = Math.abs( update - w.get(row,col) );
		    errors.set(row,col,delta);
		    w.set(row,col,update);
		}
	    }
	    // check convergence
	    var err = $M.sumEachCol(errors);
	    for (var col = 0; col<y.cols; col++) {
		if (err.get(0,col) > tolerance) {
		    break;
		}
		if (col === (y.cols-1)) {
		    console.log('coordinate descent error has converged');
		    err.print();
		    return w;
		}
	    }
	}
	console.log('loop has repeated n_iter times');
	err.print();
	return w;
    };
    
    // binary activation
    $Base.binaryActivation = function(pred) { // if prediction is positive, set the value to 1, else set to -1
	var output = new $M(pred.rows, pred.cols);
	for (var row=0; row<pred.rows; row++) {
	    for (var col=0; col<pred.cols; col++) {
		if ( pred.get(row,col) > 0.0 ) {
		    output.set(row,col,1.0);
		} else {
		    output.set(row,col,-1.0);
		}
	    }
	}
	return output;
    }

})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : linear_model/base.js */

/* begin : utils/checkargs.js */
/* --- util statistic --- */
(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
    	
    }
    
    // init
    Tempura.Utils.Check = {};
    var $C = Tempura.Utils.Check;

    
    /* check arguments */
    
    // args numbers
    $C.checkArgc = function( argc, num ) {
	if (argc !== num) {
	    throw new Error('Should input the exact number of Sushi matrix');
	}
    };

    // typeof input
    $C.checkInstance = function( inst_list ) {
	for (var i=0; i<inst_list.length; i++) {
	    if (!inst_list[i] instanceof $M) {
		throw new Error('Some matrixes are not Sushi data format');
	    }
	}
    };
    
    // sample numbers (row)
    $C.checkSampleNum = function( inst_list ) {
	for (var i=0; i<inst_list.length-1; i++) {
	    if (inst_list[i].rows !== inst_list[i+1].rows) {
		throw new Error('The number of samples does not match');
	    }
	}
    };
    
    // data dimension expected (left column and right row)
    $C.checkDataDim = function( left, right ) {
	if ( left.cols !== right.rows ) {
		throw new Error('Data dimension does not match');
	}
    };
    
    // sample dimensions (col)
    $C.checkSampleDim = function( inst_list ) {
	for (var i=0; i<inst_list.length-1; i++) {
	    if (inst_list[i].cols !== inst_list[i+1].cols) {
		throw new Error('The number of dimensions does not match');
	    }
	}
    };
    
    // set data
    $C.checkHasData = function( inst_list ) {
	for (var i=0; i<inst_list.length; i++) {
	    if (inst_list.data === null) {
		throw new Error('No value has set to matrixes');
	    }
	}
    };
    
    // nan value
    $C.checkHasNan = function( inst_list ) {
	for (var i=0; i<inst_list.length; i++) {
	    if ( $M.hasNaN(inst_list[i]) ) {
		throw new Error('Cannot handle nan values in matrixes');
	    }
	}
    };
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : utils/checkargs.js */

/* begin : linear_model/lasso.js */
/* --- lasso regression --- */
(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
		
		
		
		
		
    }
    
    // alias
    var $S = Tempura.Utils.Statistics;
    var $C = Tempura.Utils.Check;
    var $Base = Tempura.LinearModel.Base;
    
    // init
    Tempura.LinearModel.Lasso = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.lambda = (typeof args.lambda === 'undefined') ? 1.0 : args.lambda;
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.normalize = (typeof args.normalize === 'undefined') ? true : args.normalize;
	this.n_iter = (typeof args.n_iter === 'undefined') ? 1000 : args.n_iter;
	this.tolerance = (typeof args.tolerance === 'undefined') ? 0.0001 : args.tolerance;
    };
    var $Lasso = Tempura.LinearModel.Lasso.prototype;
    
    // fit
    $Lasso.fit = function(X, y) {
	// check data property
	var inst_list = [X,y];
	$C.checkArgc( arguments.length, 2 );
	$C.checkInstance( inst_list );
	$C.checkSampleNum( inst_list );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// make data centered
	var meanStd = $S.meanStd( this.center, this.normalize, X, y);
	// coorindate descent
	var w = $Base.coordinateDescent( meanStd.X, meanStd.y, this.lambda, 1.0, this.n_iter, this.tolerance);
	// store variables
	this.weight = (this.center) ? $M.divEach( w, meanStd.X_std.t() ) : w;
	if (this.center) {
		this.intercept = $M.sub(meanStd.y_mean, $M.mul(meanStd.X_mean, this.weight));
	} else {
	    var tmp = new $M( 1, y.cols );
	    this.intercept = tmp.zeros();
	}
	return this
    };

    // predict
    $Lasso.predict = function(X) {
	// check data property
	var inst_list = [X];
	$C.checkInstance( inst_list );
	$C.checkDataDim( X, this.weight );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// estimate
	var pred = $M.add( $M.mul( X, this.weight ),  this.intercept );
	return pred
    };
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : linear_model/lasso.js */

/* begin : linear_model/linear_regression.js */
/* --- linear regression --- */
(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
		
		
		
		
    }
    
    // alias
    var $S = Tempura.Utils.Statistics;
    var $C = Tempura.Utils.Check;

    // init
    Tempura.LinearModel.LinearRegression = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.normalize = (typeof args.normalize === 'undefined') ? true : args.normalize;
	this.solver = (typeof args.solver === 'undefined') ? 'qr' : args.solver;
    };
    var $LinReg = Tempura.LinearModel.LinearRegression.prototype;
    
    // fit
    $LinReg.fit = function(X, y) {
	// check data property
	var inst_list = [X,y];
	$C.checkArgc( arguments.length, 2 );
	$C.checkInstance( inst_list );
	$C.checkSampleNum( inst_list );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// make data centered
	var meanStd = $S.meanStd( this.center, this.normalize, X, y);
	// solver
	if (this.solver === 'lsqr') { // nomal equation
	    var tmp = $M.mul( meanStd.X.t(), meanStd.X);
	    var w = $M.mul( $M.mul( tmp.inverse(), meanStd.X.t() ), meanStd.y );
	} else if (this.solver === 'qr') { // qr decomposition
	    if (X.rows >= X.cols) {
		var qr = $M.qr(meanStd.X);
		var q1 = $M.extract( qr.Q, 0, 0, X.rows, X.cols);
		var r1 = $M.extract( qr.R, 0, 0, X.cols, X.cols);
		var w = $S.fbSubstitution( r1, $M.mul( q1.t(), meanStd.y) );
	    } else {
		var svd = $M.svd(X.t());
		var U = svd.V; var V = svd.U
		var pseudo_inv = $M.mul($M.mul(V, $M.diag($S.frac(svd.S))), U.t());
		var w = $M.mul(pseudo_inv, meanStd.y);
	    }
	} else {
	    throw new Error('solver should be lsqr or qr, and others have not implemented');
	}
	
	// store variables
	this.weight = (this.center) ? $M.divEach( w, meanStd.X_std.t() ) : w;
	if (this.center) {
	    this.intercept = $M.sub(meanStd.y_mean, $M.mul(meanStd.X_mean, this.weight));
	} else {
	    var tmp = new $M( 1, y.cols );
	    this.intercept = tmp.zeros();
	}
	return this
    };
    
    // predict
    $LinReg.predict = function(X) {
	// check data property
	var inst_list = [X];
	$C.checkInstance( inst_list );
	$C.checkDataDim( X, this.weight );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// estimate
	var pred = $M.add( $M.mul( X, this.weight ),  this.intercept );
	return pred
    };

})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : linear_model/linear_regression.js */

/* begin : linear_model/logistic.js */
/* --- logistic --- */

(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
		
		
		
		
		
    }

    // alias
    var $S = Tempura.Utils.Statistics;
    var $C = Tempura.Utils.Check;
    var $Base = Tempura.LinearModel.Base;
    
    // init
    Tempura.LinearModel.Logistic = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.eta = (typeof args.eta === 'undefined') ? 0.01 : args.eta; // learning ratio for delta Error
	this.alpha = (typeof args.alpha === 'undefined') ? 0.0015 : args.alpha; // l2-regularization strength
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.n_iter = (typeof args.n_iter === 'undefined') ? 100 : args.n_iter;
    };
    var $Logistic = Tempura.LinearModel.Logistic.prototype;
    
    // fit
    $Logistic.fit = function(X, y) {
	// check data property
	var inst_list = [X,y];
	$C.checkArgc( arguments.length, 2 );
	$C.checkInstance( inst_list );
	$C.checkSampleNum( inst_list );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// train ( for now, activation:softmax, loss:cross entropy, optimization:gradient discent )
	var bias = new $M( X.rows, 1 ); bias.zeros(1.0);
	var X_dash = $M.hstack([ bias, X ]);
	var w = new $M( X_dash.cols , y.cols ); w.zeros();
	var error
	for (var iter=0; iter<this.n_iter; iter++) {
	    var pred = $M.sub( y, $S.softmax( $M.mul( X_dash, w ) ) );
	    var delta = $M.sub( $M.mul( X_dash.t(), pred ), w.clone().times(this.alpha) );
	    w.add( delta.times( this.eta ) );
	    if (iter == this.n_iter-1) {
		console.log('train finished (max_iteration has done)');
	    }
	}
	this.weight = w;
	return this
    };

    // predict
    $Logistic.predict = function(X) {
	// check data property
	var bias = new $M( X.rows, 1 ); bias.zeros(1.0);
	var X_dash = $M.hstack([ bias, X ]);
	var inst_list = [X_dash];
	$C.checkInstance( inst_list );
	$C.checkDataDim( X_dash, this.weight );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// estimate
	var pred = $S.softmax( $M.mul( X_dash, this.weight ) );
	return pred
    };
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : linear_model/logistic.js */

/* begin : linear_model/perceptron.js */
/* --- perceptron --- */

(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
		
		
		
		
		
    }
    
    // alias
    var $S = Tempura.Utils.Statistics;
    var $C = Tempura.Utils.Check;
    var $Base = Tempura.LinearModel.Base;
    
    // init
    Tempura.LinearModel.Perceptron = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.eta = (typeof args.eta === 'undefined') ? 1.0 : args.eta;
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.n_iter = (typeof args.n_iter === 'undefined') ? 100 : args.n_iter;
    };
    var $Perceptron = Tempura.LinearModel.Perceptron.prototype;
    
    // fit
    /* target y as a matrix of [n_samples, 1] */
    $Perceptron.fit = function(X, y) {
	// check data property
	var inst_list = [X,y];
	$C.checkArgc( arguments.length, 2 );
	$C.checkInstance( inst_list );
	$C.checkSampleNum( inst_list );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// train
	var meanStd = $S.meanStd( this.center, false, X, y );
	var w = new $M(X.cols,1); w.zeros();
	for (var iter=0; iter<this.n_iter; iter++) {
	    var flag = true;
	    for (var row=0; row<X.rows; row++) {
		var tmp = $M.getRow(meanStd.X,row).t();
		var pred = $M.dot(tmp, w);
		var target = y.get(row,0);
		if (pred*target > 0) { // correct
		    continue;
		} else { // mistake
		    flag = false;
		    w.add( tmp.times( this.eta * target ) );
		}
	    }
	    // check convergence
	    if (flag) {
		console.log('train finished (all samples are classified correctly)');
		break;
	    }
	    if (iter == this.n_iter-1) {
		console.log('train finished (max_iteration has done)');
	    }
	}
	this.weight = w;
	// store variables
	if (this.center) {
	    this.intercept = $M.sub(meanStd.y_mean, $M.mul(meanStd.X_mean, this.weight));
	} else {
	    var tmp = new $M( 1, y.cols );
	    this.intercept = tmp.zeros();
	}
	return this
    };
    
    // predict
    $Perceptron.predict = function(X) {
	// check data property
	var inst_list = [X];
	$C.checkInstance( inst_list );
	$C.checkDataDim( X, this.weight );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// estimate
	var pred = $Base.binaryActivation( $M.add( $M.mul( X, this.weight ),  this.intercept ) );
	return pred
    };
    
    $Perceptron.decisionFunction = function(X) {
	// check data property
	var inst_list = [X];
	$C.checkInstance( inst_list );
	$C.checkDataDim( X, this.weight );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// estimate
	var pred = $M.add( $M.mul( X, this.weight ),  this.intercept );
	
	return pred
	
    };
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : linear_model/perceptron.js */

/* begin : linear_model/ridge.js */
/* --- ridge regression --- */
(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
		
		
		
		
		
    }
    
    // alias
    var $S = Tempura.Utils.Statistics;
    var $C = Tempura.Utils.Check;
    var $Base = Tempura.LinearModel.Base;

    // init
    Tempura.LinearModel.Ridge = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.lambda = (typeof args.lambda === 'undefined') ? 1.0 : args.lambda;
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.normalize = (typeof args.normalize === 'undefined') ? true : args.normalize;
	this.solver = (typeof args.solver === 'undefined') ? 'cd' : args.solver;
	this.n_iter = (typeof args.n_iter === 'undefined') ? 1000 : args.n_iter;
	this.tolerance = (typeof args.tolerance === 'undefined') ? 0.0001 : args.tolerance;
    };
    var $Ridge = Tempura.LinearModel.Ridge.prototype;
    
    // fit
    $Ridge.fit = function(X, y) {
	// check data property
	var inst_list = [X,y];
	$C.checkArgc( arguments.length, 2 );
	$C.checkInstance( inst_list );
	$C.checkSampleNum( inst_list );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// make data centered
	var meanStd = $S.meanStd( this.center, this.normalize, X, y);
	// solver
	if (this.solver === 'lsqr') { // normal equation
	    var identity = $M.eye(X.cols);
		var tmp = $M.add( identity.times(this.lambda), $M.mul( meanStd.X.t(), meanStd.X) );
	    var w = $M.mul( $M.mul( tmp.inverse(), meanStd.X.t() ), meanStd.y );
	} else if ( this.solver === 'cd') { // coorinate discent
	    var w = $Base.coordinateDescent( meanStd.X, meanStd.y, this.lambda, 0.0, this.n_iter, this.tolerance);
	} else {
	    throw new Error('solver should be lsqr or cg, and others have not implemented');
	}
	// store variables
	this.weight = (this.center) ? $M.divEach( w, meanStd.X_std.t() ) : w;
	if (this.center) {
	    this.intercept = $M.sub(meanStd.y_mean, $M.mul(meanStd.X_mean, this.weight));
	} else {
	    var tmp = new $M( 1, y.cols );
	    this.intercept = tmp.zeros();
	}
	return this
    };
    
    // predict
    $Ridge.predict = function(X) {
	// check data property
	var inst_list = [X];
	$C.checkInstance( inst_list );
	$C.checkDataDim( X, this.weight );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// estimate
	var pred = $M.add( $M.mul( X, this.weight ),  this.intercept );
	return pred
    };

})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : linear_model/ridge.js */

/* begin : linear_model/sgd_regressor.js */
/* --- SGDRegressor --- */

(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
		
		
		
		
		
    }

    // alias
    var $S = Tempura.Utils.Statistics;
    var $C = Tempura.Utils.Check;
    var $Base = Tempura.LinearModel.Base;
    
    // init
    Tempura.LinearModel.SGDRegressor = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.algorithm = (typeof args.algorithm === 'undefined') ? 'sgdsvm' : args.algorithm;
	this.lambda = (typeof args.lambda === 'undefined') ? -1.0 : args.lambda; // expects 0 <= lambda
	this.n_iter = (typeof args.n_iter === 'undefined') ? 1000 : args.n_iter;
	this.t_zero = (typeof args.t_zero === 'undefined') ? 1.0 : args.t_zero; // to decide step size alpha
	this.aver = (typeof args.aver === 'undefined') ? true : args.aver;
    };
    var $SGDRegressor = Tempura.LinearModel.SGDRegressor.prototype;
    
    
    // fit
    /* data X as a matrix of [ n_sample, n_feature_dim ]
       target y as a matrix of [ n_sample, n_class ]
       init_w as [ n_feature_dim+1, n_class ] */
    $SGDRegressor.fit = function(X, y, init_w) {
	// check data property
	if (arguments.length == 2) {
	    var inst_list = [X,y];
	} else if (arguments.length == 3) {
	    var inst_list = [X, y, init_w];
	} else {
	    throw new Error('Should input the exact number of Sushi matrix');
	}
	$C.checkSampleNum( [X,y] );
	$C.checkInstance( inst_list );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	var n_sample = X.rows; var n_dim = X.cols; var n_class = y.cols
	// set lambda gamma
	if (this.lambda == 0.0) {
		var lambda = 0.0;
	    var gamma = (this.t_zero == 1.0) ? 0.1 : this.t_zero;
	} else {
	    var lambda = (this.lambda > 0.0) ? this.lambda : (1.0 / n_sample);
	    var gamma = 1.0 / (lambda * this.t_zero);
	}
	// initial weight
	if (typeof init_w === 'undefined') {
	    var w = new $M(n_dim+1,n_class); w.zeros();
	} else {
	    if ( (init_w.rows == n_dim+1) && (init_w.cols == n_class) ) {
		var w = init_w;
	    } else {
		throw new Error('the shape of init_w does not match');
	    }
	}
	// train
	var meanStd = $S.meanStd( true, true, X, false, 1);
	var bias = new $M( X.rows, 1 ); bias.zeros(1.0);
	var X_dash = $M.hstack([ meanStd.X, bias ]);
	var alpha = new $M(1,n_class); alpha.zeros(1.0); // learning ratio
	var true_cls = $M.argmaxEachRow(y); // class index matrix of given ground truth
	var is_averaging = false;
	for (var iter=0; iter<this.n_iter; iter++) {
	    var count = 1; // for counting positive samples
		// init averaging
	    if (this.aver && iter == this.n_iter-1) {
		var is_averaging = true;
		var beta = new $M(1,n_class); beta.zeros(1.0);
		var tau = new $M(1,n_class); tau.zeros();
		var w_hat = new $M(w.rows,w.cols);
		var t = 1.0;
	    }
	    // basic loop
	    var rind = $S.randperm(n_sample);
	    for (var ind=0; ind<n_sample; ind++) {
		var row = rind[ind];
		var sample = $M.getRow( X_dash, row ); // spot sample
		var pred = $M.mul( sample, $M.divEach( w, alpha ) );
		var c = true_cls.get(row,0); var y_pred = pred.get(0,c); pred.set(0,c,-10000);
		var s = $M.argmax(pred).col; var s_pred = pred.get(0,s);
		// loss func
			if (this.algorithm === 'sgdsvm') {
			    var loss = Math.max( 0.0, 1.0-(y_pred-s_pred) );
			} else if (this.algorithm === 'perceptron') {
			    var loss = y_pred-s_pred;
			} else {
			    throw new Error('Specify valid algorithm (sgdsvm or perceptron)');
			}
			// regularization
		if (lambda > 0.0) {
		    gamma = 1.0 / ( 1.0 / gamma + lambda );
		    alpha.times( 1.0 / ( 1.0 - gamma * lambda ));
		}
		// perceptron averaging case
		if ( this.algorithm==='perceptron' && is_averaging ) { t += 1.0; }
		// loss zero
		if ( this.algorithm==='sgdsvm' && loss==0.0 ) { count+=1; continue; }
		if ( this.algorithm==='perceptron' && loss>0.0 ) { count+=1; continue; }
		// update
		w.setCol( c, $M.add( $M.getCol(w,c), sample.clone().t().times( gamma * alpha.get(0,c) ) ) );
		w.setCol( s, $M.sub( $M.getCol(w,s), sample.clone().t().times( gamma * alpha.get(0,s) ) ) );
		// sgdsvm averaging case
		if ( this.algorithm==='sgdsvm' && is_averaging ) { t += 1.0; }
		// do averaging
		if (is_averaging) {
		    var eta = 1.0 / t;
		    beta.times( 1.0 / (1.0 - eta) );
		    w_hat.setCol( c, $M.sub( $M.getCol(w_hat,c), sample.clone().t().times( gamma * alpha.get(0,c) * tau.get(0,c) ) ) );
		    w_hat.setCol( s, $M.add( $M.getCol(w_hat,s), sample.clone().t().times( gamma * alpha.get(0,s) * tau.get(0,s) ) ) );
				tau.add( $M.divEach( beta, alpha ).times( eta ) );
		}
	    }
	    // check convergance
	    /* if ( count == n_sample ) {
	       console.log('all samples are correctly classifiered');
	       iter = this.n_iter-2;
	       } */
	    // max iteration
		if (iter == this.n_iter-1) {
		    console.log('train finished (max_iteration has done)');
		}
	}
	// store variables
	this.weight = (this.aver) ? $M.divEach( $M.add( $M.mulEach(w,tau), w_hat ), beta ) : $M.divEach( w, alpha );
	return this
    };
    
    // predict
    $SGDRegressor.predict = function(X) {
	// check data property
	var bias = new $M( X.rows, 1 ); bias.zeros(1.0);
	var X_dash = $M.hstack([ X, bias ]);
	var inst_list = [X_dash];
	$C.checkInstance( inst_list );
	$C.checkDataDim( X_dash, this.weight );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// estimate
	if (this.algorithm==='sgdsvm') {
	    // var pred = $S.softmax( $M.mul( X_dash, this.weight ) ); // for classifier
	    var pred = $M.mul( X_dash, this.weight );
	} else if (this.algorithm==='perceptron') {
	    // var pred = $Base.binaryActivation( $M.mul( X_dash, this.weight ) ); // for classifier
	    var pred = $M.mul( X_dash, this.weight );
	} else {
		throw new Error('algorithm not supported');
	}
	return pred
    };
    
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : linear_model/sgd_regressor.js */

/* begin : metrics/metrics.js */
(function(nodejs, $M, Tempura) {
	Tempura.Metrics = {};
})(typeof window === 'undefined', Sushi.Matrix, Tempura);



/* end : metrics/metrics.js */

/* begin : metrics/pairwise.js */
(function(nodejs, $M, Tempura) {
	if (nodejs) {
		
	}
	
	Tempura.Metrics.Pairwise = {
		euclidean_distances : function (X, Y, squared){
		    if(typeof squared === 'undefined') squared = false;
		    
		    // If vectors are given, convert them to matrices
		    if (typeof X.cols === 'undefined') {
			X = $M.fromArray([$M.toArray(X)]);
		    }
		    if (typeof Y.cols === 'undefined') {
			Y = $M.fromArray([$M.toArray(Y)]);
		    }
		    
		    var XX = Tempura.Metrics.Pairwise.row_norms(X, true);
		    var YY = Tempura.Metrics.Pairwise.row_norms(Y, true);
		    var distances = $M.mul(X, Y.t());
		    distances.times(-2);
		    distances = $M.add(distances, XX)
		    distances = $M.add(distances, YY.t())
		    distances.map(function max0(x){return Math.max(x,0);})
		    
		    if(squared == false){
			distances = distances.map(Math.sqrt);
			//throw new Error("Tempura.Metrics.euclidean_distances with option squared=false is not implemented");
		    }
		    return distances
		},
	    
		row_norms : function(X, squared){
			if (typeof squared === 'undefined') squared = false;
			var norms = $M.sumEachRow($M.mulEach(X, X));
			if(squared == false){
				//throw new Error("Tempura.Metrics.row_norms with option squared=false is not implemented");
			norms = norms.map(Math.sqrt);
			}
			return norms
		},

		col_norms : function(X, squared){
			if (typeof squared === 'undefined') squared = false;
			var norms = $M.sumEachCol($M.mulEach(X, X));
			if(squared == false){
				//throw new Error("Tempura.Metrics.row_norms with option squared=false is not implemented");
			norms = norms.map(Math.sqrt);
			}
			return norms
		}


	};
})(typeof window === 'undefined', Sushi.Matrix, Tempura);


/* end : metrics/pairwise.js */

/* begin : mixture/mixture.js */
(function(nodejs, $M, Tempura){
    Tempura.Mixture = {};
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : mixture/mixture.js */

/* begin : mixture/gmm.js */
(function(nodejs, $M, Tempura){
    if (nodejs) {
		
    }
    
    
    Tempura.Mixture.GMM = function(n_components, n_iter, thresh, min_covar) {
	this.n_components = typeof n_components === "undefined" ? 1 : n_components;
	this.n_iter = typeof n_iter === "undefined" ? 100 : n_iter;
	this.thresh = typeof thresh === "undefined" ? 0.01 : thresh;
	this.min_covar = typeof min_covar === "undefined" ? 0.001 : min_covar;
    };

    Tempura.Mixture.GMM.prototype.fit = function(X){
	var n_samples = X.rows;
	var n_features = X.cols;

	this.initParams(X);
	var oldLogLikelihood = 0
	var newLogLikelihood = 0
	for(var i=0; i<this.n_iter; i++){
	var responsibility = this.expectationStep(X);
	    if($M.hasNaN(responsibility)){
		this.showParams();
		throw new Error("responsibility has NaN value")
	    }
	    this.maximizationStep(X, responsibility);
	    newLogLikelihood = this.calcLogLikelihood(X);
	    console.log("LogLikelihood : " + newLogLikelihood)
	    if(checkConvergnce(oldLogLikelihood, newLogLikelihood, this.thresh)){
		break;
	    }
	    oldLogLikelihood = newLogLikelihood;
	}
	this.showParams();
	return this;
    }

    Tempura.Mixture.GMM.prototype.score = function(X){
	var n_samples = X.rows;
	var n_features = X.cols;
	likelihood = (new $M(n_samples, 1)).zeros();
	for(var i=0; i<n_samples; i++){
	    var x = $M.extract(X, i, 0, 1, n_features).t()
	    likelihood.data[i] = 0;
	    for(var k=0; k<this.n_components; k++){
		likelihood.data[i] += getGaussProbability(this.weights.data[k], this.means[k], this.covars[k], x);
	    }
	}
	return likelihood
    };

    Tempura.Mixture.GMM.prototype.calcLogLikelihood = function(X){
	var n_samples = X.rows;
	var n_features = X.cols;
	var loglikelihood = 0;
	for(var i=0; i<n_samples; i++){
	    var x = $M.extract(X, i, 0, 1, n_features).t()
	    var likelihood = 0;
	    for(var k=0; k<this.n_components; k++){
		//likelihood.data[k] += getGaussProbability(this.weights.data[k], this.means[k], this.covars[k], x);
		likelihood += getGaussProbability(this.weights.data[k], this.means[k], this.covars[k], x);
	    }
	    loglikelihood -= Math.log(likelihood);
	}
	return loglikelihood
    }

    Tempura.Mixture.GMM.prototype.expectationStep = function(X){
	var n_samples = X.rows;
	var n_features = X.cols;
	var responsibility = new $M(n_samples, this.n_components).zeros(0);
	
	for(var i=0; i<n_samples; i++){
	    var x = $M.extract(X, i, 0, 1, n_features).t();
	    for(var k=0; k<this.n_components; k++){
		var posterior = getGaussProbability(this.weights.data[k], this.means[k], this.covars[k], x);
		responsibility.set(i, k, posterior)
	    }
	}
	responsibility = $M.divEach(responsibility, $M.sumEachRow(responsibility))	
	return responsibility
    }
    
    Tempura.Mixture.GMM.prototype.maximizationStep = function(X, responsibility){
	var _beta = Math.pow(0.1,12);
	var n_samples = X.rows;
	var n_features = X.cols;
	var Nk = $M.sumEachCol(responsibility);
	this.weights = Nk.clone().times( 1.0 / n_samples);
	
	for(var k=0; k<this.n_components; k++){
	    this.means[k].zeros()
	    this.covars[k].zeros()
	}
	
	for(var i=0; i<n_samples; i++){
	    var x = $M.extract(X, i, 0, 1, n_features).t();
	    for(var k=0; k<this.n_components; k++){
		this.means[k].add(x.clone().times(responsibility.get(i, k)))
	    }
	}
	
	for(var k=0; k<this.n_components; k++){
	    this.means[k].times( 1.0 / Nk.get(0, k));
	}
	
	for(var i=0; i<n_samples; i++){
	    var x = $M.extract(X, i, 0, 1, n_features).t();
	    for(var k=0; k<this.n_components; k++){
		var sub = $M.sub(x, this.means[k]);
		this.covars[k].add($M.mul(sub, sub.t()).times( responsibility.get(i, k) ))
	    }
	    
	}
	
	for(var k=0; k<this.n_components; k++){
	    this.covars[k].times( 1.0 / Nk.data[k]);
	    this.covars[k].add($M.eye(n_features).times(_beta))
	}
	
    }
    
    Tempura.Mixture.GMM.prototype.initParams = function(X){
	var n_features = X.cols
	this.weights = new $M(1, this.n_components).zeros( 1.0 / this.n_components );
	this.means = [];
	this.covars = [];
	
	var kmeans = new Tempura.Cluster.Kmeans(this.n_components, "kmeans++");
	kmeans.fit(X)
	var init_means = kmeans.cluster_centers_;
	for(var k=0; k<this.n_components; k++){
	    var mean = $M.extract(init_means, k, 0, 1, n_features).t();
	    this.means.push(mean);
	    var covar = $M.add(Tempura.Utils.Statistics.cov(X), $M.eye(n_features).times(this.min_covar));
	    this.covars.push(covar);
	}	
    }
    
    Tempura.Mixture.GMM.prototype.showParams= function(){
	for(var k=0; k<this.n_components; k++){
	    console.log("component " + k);
	    console.log("weight :" + this.weights.data[k])
	    console.log("mean : ");
	    this.means[k].print();
	    console.log("covariance : ");
	    this.covars[k].print();
	    console.log();
	}
    }
    
    function getGaussProbability(weight, mean, covar, x){
	var m = x.rows;
	var sub = $M.sub(x, mean);
	var normalization_term = 1.0 / (Math.pow(Math.sqrt(2*Math.PI), m)* Math.sqrt(covar.det()));
	var gauss = Math.exp( -0.5 * $M.mul($M.mul(sub.t(), covar.inverse()), sub).data[0] )
	return weight * normalization_term * gauss 
    }
    
    function checkConvergnce(old_val, new_val, tol){
	if(Math.abs(old_val - new_val) < tol){
	    return true
	}
	return false
    }
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : mixture/gmm.js */

/* begin : neighbors/neighbors.js */
(function(nodejs, $M, Tempura) {
	Tempura.Neighbors = {};
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : neighbors/neighbors.js */

/* begin : neighbors/nearest_neighbors.js */
(function(nodejs, $M, Tempura) {
	
	if (nodejs) {
		
	}
	
	Tempura.Neighbors.NearestNeighbors = function(args) {
		if (typeof args === 'undefined') args = {};
		this.n_neighbors = typeof args.n_neighbors === 'undefined' ? 5	  : args.n_neighbors;
		this.radius	  = typeof args.radius	  === 'undefined' ? 1.0	: args.radius;
		this.algorithm   = typeof args.algorithm   === 'undefined' ? 'auto' : args.algorithm;
		this.leaf_size   = typeof args.leaf_size   === 'undefined' ? 30	 : args.leaf_size;
	}

	Tempura.Neighbors.NearestNeighbors.prototype.fit = function(X, y) {
		if (typeof X === 'undefined') throw new Error('X must be set');
		if (!(X instanceof $M)) throw new TypeError('X must be an instance of Sushi.Matrix');
		this._fit_X = X;
		this.y = typeof y === 'undefined' ? null : y;

		this._fit_method = this.algorithm;

		// TODO
		if (this._fit_method === 'auto') {
			this._fit_method = 'brute';
		}

		return this;
	}

	Tempura.Neighbors.NearestNeighbors.prototype.kneighbors = function(X, args) {
		if (!(X instanceof $M)) throw new TypeError('X must be an instance of Sushi.Matrix');

		if (typeof args === 'undefined') args = {};
		if (typeof args.n_neighbors === 'undefined') args.n_neighbors = this.n_neighbors;
		if (typeof args.return_distance === 'undefined') args.return_distance = true;

		if (this._fit_method === 'brute') {
			dist = Tempura.Metrics.Pairwise.euclidean_distances(X, this._fit_X, true); // TODO: Remove the restrict of metrics (euclidean_distances() is only supported now) and select metric dynamically

			// initialize indices arrays
			var indices = new Array(dist.rows);
			for (var row=0 ; row<dist.rows ; row++){
				indices[row] = new Array(dist.cols);
				for (var i=0 ; i<dist.cols ; i++){
					indices[row][i] = i;
				}
			}

			// sort
			for (var row=0 ; row<dist.rows ; row++){
				indices[row].sort(function(v1, v2){
					return dist.get(row,v1) - dist.get(row,v2);
				});
				indices[row] = indices[row].slice(0, args.n_neighbors);
			}

			if (args.return_distance) {
				var distances = new Array(dist.rows);
				for (var row=0 ; row<dist.rows ; row++){
					distances[row] = new Array(args.n_neighbors);
					for (var i=0; i<args.n_neighbors ; i++){
						distances[row][i] = Math.sqrt(dist.get(row,indices[row][i]));
					}
				}
				return [$M.fromArray(distances), $M.fromArray(indices)];
			} else {
				return $M.fromArray(indices);
			}
		} else {
			throw new Error('Invalid algorithm specified');
		}

	}

	Tempura.Neighbors.NearestNeighbors.prototype.radius_neighbors = function(X, radius, return_distance) {
		if (!(X instanceof $M)) throw new TypeError('X must be an instance of Sushi.Matrix');
		if (typeof radius === 'undefined') radius = this.radius;
		if (typeof return_distance === 'undefined') return_distance = true;

		throw new Error('Not implemented');
		if (this._fit_method === 'brute') {
			dist = Tempura.Metrics.Pairwise.euclidean_distances(X, this._fit_X, true); // TODO: Remove the restrict of metrics (euclidean_distances() is only supported now) and select metric dynamically

			// select indices whose distances are smaller than radius
			for (var row=0 ; row<dist.rows ; row++){
				for (var col=0 ; col<dist.cols ; col++){
					if (dist.get(row,col) < radius){

					}
				}
			}
		} else {
			throw new Error('Invalid algorithm specified');
		}
	}
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : neighbors/nearest_neighbors.js */

/* begin : neighbors/classification.js */
(function(nodejs, $M, Tempura) {
	if (nodejs) {
		
		
	}
	
	Tempura.Neighbors.KNeighborsClassifier = function(args) {
		if (typeof args === 'undefined') args = {};

		Tempura.Neighbors.NearestNeighbors.apply(this);

		this.n_neighbors = typeof args.n_neighbors === 'undefined' ? 5		 : args.n_neighbors;
		this.algorithm   = typeof args.algorithm   === 'undefined' ? 'auto'	: args.algorithm;
		this.leaf_size   = typeof args.leaf_size   === 'undefined' ? 30	 : args.leaf_size;
		this.weights	 = typeof args.weights	 === 'undefined' ? 'uniform' : args.weights;
	}

	Tempura.Neighbors.KNeighborsClassifier.prototype = Object.create(Tempura.Neighbors.NearestNeighbors.prototype, {
		constructor: {
			value: Tempura.Neighbors.KNeighborsClassifier,
			enumerabule: false,
			writable: true,
			configurable: true
		}
	});

	Tempura.Neighbors.KNeighborsClassifier.prototype.fit = function(X, y) {
		if (typeof X === 'undefined') throw new Error('X must be set');
		if (!(X instanceof $M)) throw new TypeError('X must be an instance of Sushi.Matrix');
		if (typeof y === 'undefined') throw new Error('y must be set');
		if (!(y instanceof $M)) throw new TypeError('y must be an instance of Sushi.Matrix');
		this._fit_X = X;
		this.y = y;

		this._fit_method = this.algorithm;

		// TODO
		if (this._fit_method === 'auto') {
			this._fit_method = 'brute';
		}

		return this;
	}

	Tempura.Neighbors.KNeighborsClassifier.prototype.predict = function(X) {
		var neigh = this.kneighbors(X);
		var weights = this._get_weights(neigh[0], this.weights);

		var sum = new $M(X.rows, $M.max(this.y)+1);
		var y = this.y;
		neigh[1].forEach(function(sample_id,k){
			var neigh_ind = neigh[1].get(sample_id,k);
			var class_id = y.get(0,neigh_ind);
			sum.set(sample_id, class_id, sum.get(sample_id, class_id)+weights.get(sample_id, k));
		});

		var res = $M.argmaxEachRow(sum);
		return res;
	}

	Tempura.Neighbors.KNeighborsClassifier.prototype._get_weights = function(dist, weights) {
		var ones = (new $M(dist.rows, dist.cols)).setEach(function(){ return 1;});
		if (weights === 'uniform' || weights === null || typeof weights === 'undefined') {
			return ones;
	//		return null;
		} else if (weights === 'distance') {
			return ones.divEach(dist);
		} else {
			throw TypeError('Unsupported weight type: ' + weights);
		}
	}
})(typeof window === 'undefined', Sushi.Matrix, Tempura);


/* end : neighbors/classification.js */

/* begin : utils/linspace.js */
(function(nodejs, $M, Tempura){
	Tempura.Utils.linspace = function(start, end, args){
		if (typeof args === 'undefined') args = {};
		var num        = typeof args.num      === 'undefined' ? 50      : args.num;
		var endpoint   = typeof args.endpoint === 'undefined' ? true    : args.endpoint;

		var range = end-start;
		var ret = new $M(num, 1);
		var num_ = endpoint ? num-1 : num;

		for (var i=0; i < num; i++){
			ret.set(i,0, start + range * i / num_);
		}

		return ret;
	}
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : utils/linspace.js */

/* begin : utils/meshgrid.js */
(function(nodejs, $M, Tempura){
	Tempura.Utils.meshgrid = function(xlist, ylist){
		var x_len = xlist.rows, y_len = ylist.rows;
		var mesh = new $M(x_len*y_len, 2);
		var i=0;
		for (var iy = 0; iy < ylist.length; iy++) {
			for (var ix = 0; ix < xlist.length ; ix++) {
				mesh.set(i,0,xlist.data[ix]);
				mesh.set(i,1,ylist.data[iy]);
				i++;
			}
		};

		return mesh;
	}
})(typeof window === 'undefined', Sushi.Matrix, Tempura);

/* end : utils/meshgrid.js */
