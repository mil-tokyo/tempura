/* --- linear regression --- */

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
AgentSmithML.LinearModel.LinearRegression = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.normalize = (typeof args.normalize === 'undefined') ? true : args.normalize;
    this.solver = (typeof args.solver === 'undefined') ? 'qr' : args.solver;
};
var $LinReg = AgentSmithML.LinearModel.LinearRegression.prototype;

// fit
$LinReg.fit = function(X, y) {
	// check data property
	$Base.checkArgc( arguments.length, 2 );
	var instList = [X,y];
	$Base.checkInstance( instList );
	$Base.checkSampleNum( instList );
	$Base.checkHasData( instList );
	$Base.checkHasNan( instList );
	// make data centered
	var meanStd = $Base.meanStd( this.center, this.normalize, X, y);

	/*
	var a = new $M.fromArray([[1,2,3],[2,4,6],[3,6,9]]);
	var qr = $M.qr(X);
	console.log('qr ans');
	qr.Q.print();
	qr.R.print();
	var hoge = $M.mul(qr.Q, qr.R);
	hoge.print();
	*/

	// solver
	if (this.solver === 'lsqr') { // nomal equation
		var tmp = $M.mul( meanStd.X.t(), meanStd.X);
		var w = $M.mul( $M.mul( tmp.inverse(), meanStd.X.t() ), meanStd.y );
	} else if (this.solver === 'qr') { // qr decomposition
		if (X.rows >= X.cols) {
			var qr = $M.qr(meanStd.X);
			var q1 = qr.Q.slice(0,0,X.rows,X.cols);
			var r1 = qr.R.slice(0,0,X.cols,X.cols);
			var w = $Base.fbSubstitution( r1, $M.mul( q1.t(), meanStd.y) );
		} else {
			var qr = $M.qr(meanStd.X.t());
			var r1 = qr.R.slice(0,0,X.rows,X.rows);
			var tmp = $Base.fbSubstitution( r1.t(), meanStd.y );
			var zeromat = new $M(X.cols-X.rows,y.cols); zeromat.zeros();
			var w = $M.mul( qr.Q, $M.vstack([tmp, zeromat]) );
		}
	} else {
		throw new Error('solver should be lsqr or qr, and others have not implemented');
	}

	// store variables
	// meanStd.X_std.t().print();
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
$LinReg.predict = function(X) {
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
