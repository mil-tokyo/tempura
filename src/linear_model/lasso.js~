(function() {

	// namespace
	if (typeof AgentSmithML.LinearModel.Lasso !== 'undefined') {
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


	/* --- lasso regression --- */

	// init
    AgentSmithML.LinearModel.Lasso = function(args) {
		this.lambda = (typeof args.lambda === 'undefined') ? 1.0 : args.lambda;
		this.center = (typeof args.center === 'undefined') ? true : args.center;
		this.normalize = (typeof args.normalize === 'undefined') ? true : args.normalize;
		this.maxIter = (typeof args.maxIter === 'undefined') ? 1000 : args.maxIter;
		this.tolerance = (typeof args.tolerance === 'undefined') ? 0.0001 : args.tolerance;
	};
	var $LasReg = AgentSmithML.LinearModel.Lasso.prototype;

	// fit
	$LasReg.fit = function(X, y) {
		// check data property
		$Base.checkArgc( arguments.length, 2 );
		var instList = [X,y];
		$Base.checkInstance( instList );
		$Base.checkSampleNum( instList );
		$Base.checkHasData( instList );
		$Base.checkHasNan( instList );
		// make data centered
		var meanStd = $Base.meanStd( this.center, this.normalize, X, y);
		// coorindate descent
		var w = $Base.coordinateDescent( X, y, this.lambda, 1.0, this.maxIter, this.tolerance);
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