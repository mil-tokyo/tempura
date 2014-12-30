(function() {

	// namespace
	if (typeof AgentSmithML.LinearModel.linearRegression !== 'undefined') {
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


	/* --- linear regression --- */

	// init
    AgentSmithML.LinearModel.linearRegression = function(args) {
		this.center = (typeof args.center === 'undefined') ? true : args.center;
		this.normalize = (typeof args.normalize === 'undefined') ? true : args.normalize;
	};
	var $LinReg = AgentSmithML.LinearModel.linearRegression.prototype;

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
		// nomal equation
		// theta = np.dot( np.dot( np.linalg.inv( np.dot(X.T, X) ) X.T), y)
		// coef
		w = new $M( X.cols, 1); w.random(); // tmp
		// store variables
		this.weight = (this.center) ? $M.divEach( w, meanStd.X_std.t() ) : w;
		if (this.center) {
			this.intercept = $M.sub(meanStd.y_mean, $M.mul(meanStd.X_mean, w));
		} else {
			var tmp = new $M( 1, y.cols );
			this.intercept = tmp.zeros();
		}

		X.print()
		y.print()
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

})();


var nodejs = (typeof window === 'undefined');
if (nodejs) {
	module.exports = AgentSmithML.LinearModel.linearRegression;
}