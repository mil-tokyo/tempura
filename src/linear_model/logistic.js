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
	this.eta = (typeof args.eta === 'undefined') ? 1.0 : args.eta;
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.maxIter = (typeof args.maxIter === 'undefined') ? 20 : args.maxIter;
    this.tolerance = (typeof args.tolerance === 'undefined') ? 0.0001 : args.tolerance;
};
var $Logistic = AgentSmithML.LinearModel.Logistic.prototype;

// fit
$Logistic.fit = function(X, y) {
	// check data property
	var instList = [X,y];
	$C.checkArgc( arguments.length, 2 );
	$C.checkInstance( instList );
	$C.checkSampleNum( instList );
	$C.checkHasData( instList );
	$C.checkHasNan( instList );
	// train
	var bias = new $M( X.rows, 1 ); bias.zeros(1.0);
	var Xdash = $M.hstack([ bias, X ]);
	var meanStd = $S.meanStd( this.center, false, Xdash, y);
	var w = new $M( X.cols+1 , y.cols ); w.zeros();
	// var err = 0;
	for (var iter=0; iter<this.maxIter; iter++) {
		for (var row=0; row<X.rows; row++) {
			// var tmp = Xdash.getRow(row);
			// var pred = $Base.binaryActivation( $M.mul( tmp, w ) );
			// var delta = $M.mul( tmp.t(), $M.sub( y.getRow(row), pred ) );
			var delta = $M.mul( $M.getRow(meanStd.X,row).t(), $M.getRow(y,row) );
			w = $M.add( w, delta.times( this.eta ) );
			// err = err + $M.sumEachRow(pred);
		}
		// check convergence
		//if (err == 0) {
		//console.log('train finished (all samples are classified correctly)');
		//break;
		//}
		if (iter == this.maxIter-1) {
			console.log('train finished (max_iteration has done)');
			// console.log(err);
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
$Logistic.predict = function(X) {
	// check data property
	var bias = new $M( X.rows, 1 ); bias.zeros(1.0);
	var Xdash = $M.hstack([ bias, X ]);
	var instList = [Xdash];
	$C.checkInstance( instList );
	$C.checkDataDim( Xdash, this.weight );
	$C.checkHasData( instList );
	$C.checkHasNan( instList );
	// estimate
	var pred = $Base.binaryActivation( $M.mul( Xdash, this.weight ) );
	return pred
};