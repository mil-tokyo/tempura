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
$S.meanStd = function( center, normalize, X, y ) {
	if (center) {
		var X_mean = $M.sumEachCol(X).times( 1.0 / X.rows );
		X = $M.sub( X, X_mean );
		var X_std = new $M( 1, X.cols );
		if (normalize) {
			var X_var = $M.sumEachCol( $M.mulEach(X,X) );
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
		var y_mean = $M.sumEachCol(y).times( 1.0 / y.rows );
		y = $M.sub( y, y_mean );
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
$S.exp = function(X) {
	if (!X instanceof $M) {
		var output = Math.exp(X);
	} else {
		var output = new $M(X.rows, X.cols);
		if (X.row_wise) {
			for (var row=0; row<X.rows; row++) {
				for (var col=0; col<X.cols; col++) {
					output.set(row, col, Math.exp( X.data[row*X.cols+col] ));
				}
			}
		} else {
			for (var row=0; row<X.rows; row++) {
				for (var col=0; col<X.cols; col++) {
					output.set(row, col, Math.exp( X.data[col*X.rows+row] ));
				}
			}
		}
	}
	return output;
};

// covariance
$S.cov = function(X){
	var n_samples = X.rows;
	var mean = $M.sumEachCol(X).times( 1.0 / n_samples );
	X = $M.sub(X, mean);
	return $M.mul(X.t(), X).times( 1.0 / (n_samples - 1) )
};


/* activation funcs */

// sigmoid
$S.sigmoid = function(X) {
	if (!X instanceof $M) {
		var output = 1.0 / (1.0 + Math.exp(X));
	} else {
		var output = new $M(X.rows, X.cols);
		if (X.row_wise) {
			for (var row=0; row<X.rows; row++) {
				for (var col=0; col<X.cols; col++) {
					output.set(row, col, 1.0 / (1.0 + Math.exp( X.data[row*X.cols+col] )) );
				}
			}
		} else {
			for (var row=0; row<X.rows; row++) {
				for (var col=0; col<X.cols; col++) {
					output.set(row, col, 1.0 / (1.0 + Math.exp( X.data[col*X.rows+row] )) );
				}
			}
		}
	}
	return output;
};

// softmax
$S.softmax = function(X) { /* for given [n_dim, 1 or n_target] matrix */
	var exp_x = $Base.exp(X);
	var sum_exp_x = $M.sumEachCol( exp_x );
	var output = $M.divEach( exp_x, sum_exp_x );
	return output;
};
