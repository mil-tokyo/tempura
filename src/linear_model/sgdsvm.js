/* --- SGD Classifier --- */

// node
var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	var Neo = require('../neo');
	require('../utils/utils.js');
	require('../utils/statistics.js');
	require('../utils/checkargs.js');
	require('./linear_model');
	require('./base');
}

// alias
var $M = AgentSmith.Matrix;
var $S = Neo.Utils.Statistics;
var $C = Neo.Utils.Check;
var $Base = Neo.LinearModel.Base;

// init
Neo.LinearModel.SGDClassifier = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.lambda = (typeof args.lambda === 'undefined') ? 1.0 : args.lambda; // expects 0 <= lambda
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.n_iter = (typeof args.n_iter === 'undefined') ? 100 : args.n_iter;
	this.t_zero = (typeof args.t_zero === 'undefined') ? 1.0 : args.t_zero;
	this.aver = (typeof args.aver === 'undefined') ? true : args.aver;
	if (this.lambda > 0) { // set gamma
		this.gamma = 1.0 / (this.lambda * this.t_zero);
	} else if (this.lambda == 0) {
		this.gamma = (typeof args.t_zero === 'undefined') ? 0.1 : this.t_zero;
	} else {
		throw new Error('lambda should be positive or zero');
	}
};
var $SGDClassifier = Neo.LinearModel.SGDClassifier.prototype;


// fit
/* data X as a matrix of [ n_sample, n_feature_dim ]
   target y as a matrix of [ n_sample, n_class ]
   init_w as [ n_feature_dim+1, n_class ] */
$SGDClassifier.fit = function(X, y, init_w) {
	// check data property
	if (arguments.length == 2) {
		var inst_list = [X,y];
	} else if (arguments.length == 3) {
		var inst_list = [X, y, init_w];
	} else {
		throw new Error('Should input the exact number of AgentSmith matrix');
	}
	$C.checkSampleNum( [X,y] );
	$C.checkInstance( inst_list );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// initial weight
	var n_sample = X.rows; var n_dim = X.cols; var n_class = y.cols
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
	var bias = new $M( X.rows, 1 ); bias.zeros(1.0);
	var X_dash = $M.hstack([ bias, X ]);
	var meanStd = $S.meanStd( this.center, false, X_dash, y );
	var alpha = new $M(1,n_class); alpha.zeros(1.0); // learning ratio
	var true_cls = $M.argmaxEachRow(y); // class index matrix of given ground truth
	var is_averaging = false;
	for (var iter=0; iter<this.n_iter; iter++) {
		// init averaging
		if (this.aver && iter == this.n_iter-1) {
			var is_averaging = true;
			var beta = new $M(1,n_class); beta.zeros(1.0);
			var tau = new $M(1,n_class); tau.zeros();
			var u_hat = new $M(w.rows,w.cols);
			var t = 1.0;
		}
		// basic loop
		for (var row=0; row<X.rows; row++) { // tmp
			var sample = meanStd.X.getRow(row); // spot sample
			var pred = $M.mul( sample, $M.divEach( w, alpha ) );
			var c = true_cls.get(row,0); var y_pred = pred.get(0,c);
			var s = $M.argmax(pred).col; var s_pred = pred.get(0,s);
			var hingeloss = Math.max( 0.0, 1.0-(y_pred-s_pred) );
			// regularization
			if (lambda > 0) {
				this.gamma = 1.0 / ( 1.0 / this.gamma + this.lambda );
				alpha.times( 1.0 / ( 1.0 - this.gamma * this.lambda ));
			}
			// cost zero
			if (hingeloss == 0.0) { continue; }
			// update
			$M.setCol( c, $M.add( $M.getCol(c), sample.colne().times( this.gamma * alpha.get(0,c) ) ) );
			$M.setCol( s, $M.sub( $M.getCol(s), sample.colne().times( this.gamma * alpha.get(0,s) ) ) );
			// do averaging
			if (is_averaging) {
				t += 1.0;
				var eta = 1.0 / t;
				beta.times( 1.0 / (1.0-eta) );
				$M.setCol( c, $M.sub( $M.getCol(c), sample.colne().times( this.gamma * alpha.get(0,c) * tau.get(0,c) ) ) );
				$M.setCol( s, $M.add( $M.getCol(s), sample.colne().times( this.gamma * alpha.get(0,s) * tau.get(0,s) ) ) );
				tau.add( $M.divEach( beta, alpha ).times( eta ) );
			}
		}
		// convergance
		if (iter == this.n_iter-1) {
			console.log('train finished (max_iteration has done)');
		}
	}
	// store variables
	this.weight = (this.center) ? $M.divEach( w, meanStd.X_std.t() ) : w;
	if (this.center) {
		this.intercept = $M.sub(meanStd.y_mean, $M.mul(meanStd.X_mean, this.weight)); // tmp
	} else {
		var tmp = new $M( 1, y.cols );
		this.intercept = tmp.zeros();
	}
	return this
};

// predict
$SGDClassifier.predict = function(X) {
	// check data property
	var bias = new $M( X.rows, 1 ); bias.zeros(1.0);
	var X_dash = $M.hstack([ bias, X ]);
	var inst_list = [X_dash];
	$C.checkInstance( inst_list );
	$C.checkDataDim( X_dash, this.weight );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// estimate
	var pred = $Base.binaryActivation( $M.add( $M.mul( X, this.weight ),  this.intercept ) );
	return pred
};