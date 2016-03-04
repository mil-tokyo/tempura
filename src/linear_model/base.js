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

/* --- base --- */
(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
    	require('./linear_model');
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
