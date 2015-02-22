/* --- util statistic --- */

(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
    	require('./utils');
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
