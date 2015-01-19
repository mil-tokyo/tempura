/* --- util statistic --- */

// node
var nodejs = (typeof window === 'undefined');
if (nodejs) {
    var AgentSmith = require('../../agent_smith/src/agent_smith');
    var AgentSmithML = require('../agent_smith_ml');
    require('./utils');
}

// alias
var $M = AgentSmith.Matrix;

// init
AgentSmithML.Utils.Statistics = {};
var $S = AgentSmithML.Utils.Statistics;


/* preprocessing */

// center and normalize
$S.meanStd = function( center, normalize, X, y, ddof) {
    var ddof = (typeof ddof === "undefined") ? X.rows - 1 : ddof;
    if (center) {
	var X_mean = $M.sumEachCol(X).times( 1.0 / X.rows );
	X = $M.sub( X, X_mean );
	var X_std = new $M( 1, X.cols );
	if (normalize) {
	    var X_var = $M.sumEachCol($M.mulEach(X,X)).times( 1.0 / (X.rows - ddof));
	    for (var i=0; i<X.cols; i++) {
		var tmp = Math.sqrt( X_var.get(0,i) );
		if (tmp !== 0) {
		    X_std.set(0,i,tmp);
		} else {
		    X_std.set(0,i,1.0);
		}
	    }
	    X = $M.divEach( X, X_std );
	} else {
	    X_std.zeros(1.0);
	}
	if(y){
	    var y_mean = $M.sumEachCol(y).times( 1.0 / y.rows );
	    y = $M.sub( y, y_mean );
	}
	else{
	    y = false;
	    y_mean = false;
	}
    } else {
	var X_mean = new $M( 1, X.cols ); X_mean.zeros();
	var X_std = new $M( 1, X.cols ); X_mean.zeros(1.0);
	var y_mean = new $M( 1, y.cols ); y_mean.zeros();
    }
    return { X:X, y:y, X_mean:X_mean, X_std:X_std, y_mean:y_mean }
};


/* linear algebra */

// substitution (effective linear algebra solution for triangle matrix)
$S.fbSubstitution = function( triangle, target ) {
	var w = new $M( triangle.cols, target.cols );
	// forward substitution (ie. the triangle has lower shape)
	if ( triangle.get(0,triangle.cols-1) === 0 ) {
		for (var t = 0; t<target.cols; t++) {
			for (var row = 0; row<target.rows; row++) {
				var tmp = target.get(row,t);
				for (var col=0; col<row; col++) {
					tmp = tmp - w.get(col,t) * triangle.get(row,col);
				}
				w.set( row, t, tmp / triangle.get(row,row) );
			}
		}
	} else { // backward substitution
		for (var t = 0; t<target.cols; t++) {
			for (var row = target.rows-1; -1<row; row--) {
				var tmp = target.get(row,t);
				for (var col=triangle.cols-1; row<col; col--) {
					tmp = tmp - w.get(col,t) * triangle.get(row,col);
				}
				w.set( row, t, tmp / triangle.get(row,row) );
			}
		}
	}
	return w;
};


/* mathmatics */

// exp

// $S.exp = function(X) {
// 	if (!X instanceof $M) {
// 		var output = Math.exp(X);
// 	} else {
// 		var output = new $M(X.rows, X.cols);
// 		if (X.row_wise) {
// 			for (var row=0; row<X.rows; row++) {
// 				for (var col=0; col<X.cols; col++) {
// 					output.set(row, col, Math.exp( X.data[row*X.cols+col] ));
// 				}
// 			}
// 		} else {
// 			for (var row=0; row<X.rows; row++) {
// 				for (var col=0; col<X.cols; col++) {
// 					output.set(row, col, Math.exp( X.data[col*X.rows+row] ));
// 				}
// 			}
// 		}
// 	}
// 	return output;
// };

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


$S.sqrt = function(X){
    return X.clone().map(Math.sqrt)
}

$S.exp = function(X) {
    return X.clone().map(Math.exp);
}

$S.sigmoid = function(X) {
    return X.clone().map(function(datum){ return 1.0 / (1.0 + Math.exp(-datum))})
}

$S.frac = function(X){
    var ones = new $M(X.rows, X.cols);
    ones.zeros(1);
    return $M.divEach(ones, X)
}
/* activation funcs */

// sigmoid
// $S.sigmoid = function(X) {
// 	if (!X instanceof $M) {
// 		var output = 1.0 / (1.0 + Math.exp(-X));
// 	} else {
// 		var output = new $M(X.rows, X.cols);
// 		if (X.row_wise) {
// 			for (var row=0; row<X.rows; row++) {
// 				for (var col=0; col<X.cols; col++) {
// 					output.set(row, col, 1.0 / (1.0 + Math.exp( - X.data[row*X.cols+col] )) );
// 				}
// 			}
// 		} else {
// 			for (var row=0; row<X.rows; row++) {
// 				for (var col=0; col<X.cols; col++) {
// 					output.set(row, col, 1.0 / (1.0 + Math.exp( - X.data[col*X.rows+row] )) );
// 				}
// 			}
// 		}
// 	}
// 	return output;
// };

// softmax
/* for given [n_sample, n_target] matrix */
$S.softmax = function(X) {
	var max_val = $M.max(X); // avoid overflow
	var exp_x = $S.exp( X.map(function(datum){return datum-max_val}) );
	var sum_exp_x = $M.sumEachRow( exp_x );
	var output = $M.divEach( exp_x, sum_exp_x );
	return output;
};


$S.vstack = function(matrices, output) {
    if(typeof matrices != "object"){
	throw new Error("input should be list");
    }
    
    new_cols = matrices[0].cols
    new_rows = 0
    for(var i=0; i<matrices.length; i++){
	new_rows += matrices[i].rows;
	if(new_cols != matrices[i].cols){
	    throw new Error("the number of column of all matrices should be the same");
	}
    }

    var offset_row = 0;
    var newM = $M.newMatOrReuseMat(new_rows, new_cols, output);
    newM.syncData()
    for(var i=0; i<matrices.length; i++){
	var mat = matrices[i];
	if(mat.row_wise){
	    for(var row=0; row<mat.rows; row++){
		for(var col=0; col<mat.cols; col++){
		    newM.data[(offset_row + row) * mat.cols + col] = mat.data[row * mat.cols + col];
		}
	    }
	}
	else{
	    for(var row=0; row<mat.rows; row++){
		for(var col=0; col<mat.cols; col++){
		    newM.data[(offset_row + row) * mat.cols + col] = mat.data[col * mat.rows + row];
		}
	    }
	}
	offset_row += matrices[i].rows 
    }
    
    return newM
}


$S.chomskyDecomposition = function(X){
    // decompose postive definite symmetric matrix X = QQ^T
    var svd_result = $M.svd(X);
    var U = svd_result.U
    var W = $M.diag($S.sqrt(svd_result.S))
    var Q = $M.mul(U, W);
    return Q
}
