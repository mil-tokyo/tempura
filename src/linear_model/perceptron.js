/* --- perceptron --- */

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
AgentSmithML.LinearModel.Perceptron = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.eta = (typeof args.eta === 'undefined') ? 1.0 : args.eta;
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.maxIter = (typeof args.maxIter === 'undefined') ? 20 : args.maxIter;
};
var $Perceptron = AgentSmithML.LinearModel.Perceptron.prototype;


// fit
$Perceptron.fit = function(X, y) {
	// check data property
	$Base.checkArgc( arguments.length, 2 );
	var instList = [X,y];
	$Base.checkInstance( instList );
	$Base.checkSampleNum( instList );
	$Base.checkHasData( instList );
	$Base.checkHasNan( instList );
	// train
	var bias = new $M( X.rows, 1 ); bias.zeros(1.0);
	var Xdash = $M.hstack([ bias, X ]);
	var meanStd = $Base.meanStd( this.center, false, Xdash, y);
	var w = new $M( X.cols+1 , y.cols ); w.zeros();
	// var err = 0;
	for (var iter=0; iter<this.maxIter; iter++) {
		for (var row=0; row<X.rows; row++) {
			// var tmp = Xdash.getRow(row);
			// var pred = $Base.binaryActivation( $M.mul( tmp, w ) );
			// var delta = $M.mul( tmp.t(), $M.sub( y.getRow(row), pred ) );
			var delta = $M.mul( meanStd.X.getRow(row).t(), y.getRow(row) );
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
$Perceptron.predict = function(X) {
	// check data property
	var bias = new $M( X.rows, 1 ); bias.zeros(1.0);
	var Xdash = $M.hstack([ bias, X ]);
	var instList = [Xdash];
	$Base.checkInstance( instList );
	$Base.checkDataDim( Xdash, this.weight );
	$Base.checkHasData( instList );
	$Base.checkHasNan( instList );
	// estimate
	var pred = $Base.binaryActivation( $M.mul( Xdash, this.weight ) );
	return pred
};