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
    var ddof = (typeof ddof === "undefined") ? X.rows - 1 : ddof;
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

    // Abramowitz and Stegun (1964) formula 7.1.26
    // precision: abs(err) < 1.5e-7

    // inverted function of cumulative normal distribution //
    // only scalar argument are implemented //
    $S.normsInv = function(p){
	// Coefficients in rational approximations
	var a = new Array(-3.969683028665376e+01,  2.209460984245205e+02,
			  -2.759285104469687e+02,  1.383577518672690e+02,
			  -3.066479806614716e+01,  2.506628277459239e+00);

	var b = new Array(-5.447609879822406e+01,  1.615858368580409e+02,
			  -1.556989798598866e+02,  6.680131188771972e+01,
			  -1.328068155288572e+01 );

	var c = new Array(-7.784894002430293e-03, -3.223964580411365e-01,
			  -2.400758277161838e+00, -2.549732539343734e+00,
			  4.374664141464968e+00,  2.938163982698783e+00);

	var d = new Array (7.784695709041462e-03, 3.224671290700398e-01,
			   2.445134137142996e+00,  3.754408661907416e+00);

	// Define break-points.
	var plow  = 0.02425;
	var phigh = 1 - plow;

	// Rational approximation for lower region:
	if ( p < plow ) {
	    var q  = Math.sqrt(-2*Math.log(p));
	    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
                ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
	}

	// Rational approximation for upper region:
	if ( phigh < p ) {
	    var q  = Math.sqrt(-2*Math.log(1-p));
	    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
                ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
	}

	// Rational approximation for central region:
	var q = p - 0.5;
	var r = q*q;
	console.log(r);
	return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
            (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
    };

})(typeof window === 'undefined', Sushi.Matrix, Tempura);
