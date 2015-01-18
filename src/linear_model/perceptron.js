/* --- perceptron --- */

// node
var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	var AgentSmithML = require('../agent_smith_ml');
	require('../utils/utils.js');
	require('../utils/statistics.js');
	require('../utils/checkargs.js');
	require('./linear_model');
	require('./base');
}

// alias
var $M = AgentSmith.Matrix;
var $S = AgentSmithML.Utils.Statistics;
var $C = AgentSmithML.Utils.Check;
var $Base = AgentSmithML.LinearModel.Base;

// init
AgentSmithML.LinearModel.Perceptron = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.eta = (typeof args.eta === 'undefined') ? 1.0 : args.eta;
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.n_iter = (typeof args.n_iter === 'undefined') ? 100 : args.n_iter;
};
var $Perceptron = AgentSmithML.LinearModel.Perceptron.prototype;

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