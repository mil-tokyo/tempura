/* --- logistic --- */

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
AgentSmithML.LinearModel.Logistic = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.eta = (typeof args.eta === 'undefined') ? 0.01 : args.eta; // learning ratio for delta Error
	this.alpha = (typeof args.alpha === 'undefined') ? 0.0015 : args.alpha; // l2-regularization strength
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.n_iter = (typeof args.n_iter === 'undefined') ? 100 : args.n_iter;
};
var $Logistic = AgentSmithML.LinearModel.Logistic.prototype;

// fit
$Logistic.fit = function(X, y) {
	// check data property
	var inst_list = [X,y];
	$C.checkArgc( arguments.length, 2 );
	$C.checkInstance( inst_list );
	$C.checkSampleNum( inst_list );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// train
	var bias = new $M( X.rows, 1 ); bias.zeros(1.0);
	var X = $M.hstack([ bias, X ]);
	var w = new $M( X.cols , y.cols ); w.zeros();
	for (var iter=0; iter<this.n_iter; iter++) {
		var pred = $M.sub( y, $S.softmax( $M.mul( X, w ) ) );
		var delta = $M.sub( $M.mul( X.t(), pred ), w.clone().times(this.alpha) );
		w.add( delta.times( this.eta ) );
		this.eta = this.eta * 0.99;
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