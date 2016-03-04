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

/* --- soft confidence weighted --- */

(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
		require('../../utils/utils.js');
		require('../../utils/statistics.js');
		require('../../utils/checkargs.js');
		require('./online_learning');
    }

    // alias
    var $S = Tempura.Utils.Statistics;
    var $C = Tempura.Utils.Check;
    var $Base = Tempura.LinearModel.Base;

    // init
    Tempura.LinearModel.OnlineLearning.SoftConfidenceWeighted = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.eta = (typeof args.eta === 'undefined') ? 0.9 : args.eta;
	this.C = (typeof args.C === 'undefined') ? 1 : args.C;
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.n_iter = (typeof args.n_iter === 'undefined') ? 100 : args.n_iter;
    };
    var $SoftConfidenceWeighted = Tempura.LinearModel.OnlineLearning.SoftConfidenceWeighted.prototype;

    // fit
    /* target y as a matrix of [n_samples, 1] */
    $SoftConfidenceWeighted.fit = function(X, y) {
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
	var sigma = new $M(X.cols,1); sigma.zeros(1.0);
	var phi = $S.normsInv(this.eta);
	for (var iter=0; iter<this.n_iter; iter++) {
	    var flag = true;
	    for (var row=0; row<X.rows; row++) {
		var x = $M.getRow(meanStd.X,row).t();
		var pred = $M.dot(x, w);
		var target = y.get(row,0);
		var x_2 = $M.mulEach(x, x);
		var x_sigma_x = $M.dot(sigma, x_2);
		var margin = pred * target;
		if ( margin > phi * Math.sqrt(x_sigma_x)) { // correct
		    continue;
		} else { // mistake
		    flag = false;
		    var sub_alpha = -margin* ( 1 + Math.pow(phi, 2)/2);
		    var alpha = Math.min(this.C, Math.max(0,(sub_alpha + Math.sqrt(Math.pow(margin, 2)*Math.pow(phi,4)/4+x_sigma_x*Math.pow(phi, 2)* (1+Math.pow(phi, 2))))
					 /( x_sigma_x * (1 + Math.pow(phi, 2)) )));

		    var sigma_factor = 2/(-x_sigma_x+Math.sqrt( Math.pow(x_sigma_x, 2) + 4*x_sigma_x/Math.pow(alpha*phi, 2) ));
		    var sigma_update = x_2.clone().times(sigma_factor);
		    w.add($M.mulEach(sigma, x).times(target * alpha));
		    sigma = $S.frac($M.add($S.frac(sigma), x_2.clone().times(1/sigma_factor)));
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
	this.cov = sigma;
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
    $SoftConfidenceWeighted.predict = function(X) {
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

    $SoftConfidenceWeighted.decisionFunction = function(X) {
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
