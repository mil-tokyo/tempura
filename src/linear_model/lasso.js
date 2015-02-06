/* --- lasso regression --- */
(function(nodejs, $M, Neo){
    // node
    if (nodejs) {
		require('../utils/utils.js');
		require('../utils/statistics.js');
		require('../utils/checkargs.js');
		require('./linear_model');
		require('./base');
    }
    
    // alias
    var $S = Neo.Utils.Statistics;
    var $C = Neo.Utils.Check;
    var $Base = Neo.LinearModel.Base;
    
    // init
    Neo.LinearModel.Lasso = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.lambda = (typeof args.lambda === 'undefined') ? 1.0 : args.lambda;
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.normalize = (typeof args.normalize === 'undefined') ? true : args.normalize;
	this.n_iter = (typeof args.n_iter === 'undefined') ? 1000 : args.n_iter;
	this.tolerance = (typeof args.tolerance === 'undefined') ? 0.0001 : args.tolerance;
    };
    var $Lasso = Neo.LinearModel.Lasso.prototype;
    
    // fit
    $Lasso.fit = function(X, y) {
	// check data property
	var inst_list = [X,y];
	$C.checkArgc( arguments.length, 2 );
	$C.checkInstance( inst_list );
	$C.checkSampleNum( inst_list );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// make data centered
	var meanStd = $S.meanStd( this.center, this.normalize, X, y);
	// coorindate descent
	var w = $Base.coordinateDescent( meanStd.X, meanStd.y, this.lambda, 1.0, this.n_iter, this.tolerance);
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
    $Lasso.predict = function(X) {
	// check data property
	var inst_list = [X];
	$C.checkInstance( inst_list );
	$C.checkDataDim( X, this.weight );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// estimate
	var pred = $M.add( $M.mul( X, this.weight ),  this.intercept );
	return pred
    };
})(typeof window === 'undefined', AgentSmith.Matrix, Neo);
