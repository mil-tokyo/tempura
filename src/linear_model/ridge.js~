(function() {

	// namespace
	if (typeof AgentSmithML.LinearModel.Ridge !== 'undefined') {
		return;
	}

	// node
	var nodejs = (typeof window === 'undefined');
	if (nodejs) {
		require('../../../agent_smith/src/agent_smith');
		require('../agent_smith_ml');
		require('./linear_model');
		require('./base');
	}
	var $M = AgentSmith.Matrix;
	var $Base = AgentSmithML.LinearModel.Base;


	/* --- ridge regression --- */

	// init
    AgentSmithML.LinearModel.Ridge = function(args) {
		this.lambda = (typeof args.lambda === 'undefined') ? 1.0 : args.lambda;
		this.center = (typeof args.center === 'undefined') ? true : args.center;
		this.normalize = (typeof args.normalize === 'undefined') ? false : args.normalize;
		this.solver = (typeof args.solver === 'undefined') ? 'lsqr' : args.solver;
		this.maxIter = (typeof args.maxIter === 'undefined') ? 1000 : args.maxIter;
		this.tolerance = (typeof args.tolerance === 'undefined') ? 0.0001 : args.tolerance;
	};
	var $LinReg = AgentSmithML.LinearModel.Ridge.prototype;

	// fit
	$RidReg.fit = function(X, y) {
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
		if (this.solver === 'lsqr') {
			var identity = new $M(X.cols, X.cols); identity.zeros(1.0);
			var tmp = $M.add( identity.times(this.lambda), $M.mul( X.t(), X) );
			var w = $M.mul( $M.mul( tmp.inverse(), X.t() ), y );
		} else if ( this.solver === 'cg') {
			var w = $Base.coordinateDescent( X, y, this.lambda, 0.0, this.maxIter, this.tolerance);
		} else {
			throw new Error('solver should be lsqr or cg, and others have not implemented');
		}
		// store variables
		this.weight = (this.center) ? $M.divEach( w, meanStd.X_std.t() ) : w;
		if (this.center) {
			this.intercept = $M.sub(meanStd.y_mean, $M.mul(meanStd.X_mean, w));
		} else {
			var tmp = new $M( 1, y.cols );
			this.intercept = tmp.zeros();
		}
		// dev
		X.print()
		y.print()
		return this
	};


	// predict
	$RidReg.predict = function(X) {
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

})();


var nodejs = (typeof window === 'undefined');
if (nodejs) {
	module.exports = AgentSmithML.LinearModel.Ridge;
}