/* --- ridge regression --- */

// node
var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	var AgentSmithML = require('../agent_smith_ml');
	require('./linear_model');
	require('./base');
}

// alias
var $M = AgentSmith.Matrix;
var $Base = AgentSmithML.LinearModel.Base;

// init
AgentSmithML.LinearModel.Ridge = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.lambda = (typeof args.lambda === 'undefined') ? 1.0 : args.lambda;
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.normalize = (typeof args.normalize === 'undefined') ? true : args.normalize;
	this.solver = (typeof args.solver === 'undefined') ? 'cd' : args.solver;
	this.maxIter = (typeof args.maxIter === 'undefined') ? 1000 : args.maxIter;
	this.tolerance = (typeof args.tolerance === 'undefined') ? 0.0001 : args.tolerance;
};
var $Ridge = AgentSmithML.LinearModel.Ridge.prototype;

// fit
$Ridge.fit = function(X, y) {
	// check data property
	$Base.checkArgc( arguments.length, 2 );
	var instList = [X,y];
	$Base.checkInstance( instList );
	$Base.checkSampleNum( instList );
	$Base.checkHasData( instList );
	$Base.checkHasNan( instList );
	// make data centered
	var meanStd = $Base.meanStd( this.center, this.normalize, X, y);
	// solver
	if (this.solver === 'lsqr') { // normal equation
		var identity = $M.eye(X.cols);
		var tmp = $M.add( identity.times(this.lambda), $M.mul( meanStd.X.t(), meanStd.X) );
		var w = $M.mul( $M.mul( tmp.inverse(), meanStd.X.t() ), meanStd.y );
	} else if ( this.solver === 'cd') { // coorinate discent
		var w = $Base.coordinateDescent( meanStd.X, meanStd.y, this.lambda, 0.0, this.maxIter, this.tolerance);
	} else {
		throw new Error('solver should be lsqr or cg, and others have not implemented');
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
$Ridge.predict = function(X) {
	// check data property
	var instList = [X];
	$Base.checkInstance( instList );
	$Base.checkDataDim( X, this.weight );
	$Base.checkHasData( instList );
	$Base.checkHasNan( instList );
	// estimate
	var pred = $M.add( $M.mul( X, this.weight ),  this.intercept );
	return pred
};