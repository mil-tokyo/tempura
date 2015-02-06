/* --- linear regression --- */
(function(nodejs, $M, Neo){
    // node
    if (nodejs) {
		require('../utils/utils.js');
		require('../utils/statistics.js');
		require('../utils/checkargs.js');
		require('./linear_model');
    }
    
    // alias
    var $S = Neo.Utils.Statistics;
    var $C = Neo.Utils.Check;

    // init
    Neo.LinearModel.LinearRegression = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.normalize = (typeof args.normalize === 'undefined') ? true : args.normalize;
	this.solver = (typeof args.solver === 'undefined') ? 'qr' : args.solver;
    };
    var $LinReg = Neo.LinearModel.LinearRegression.prototype;
    
    // fit
    $LinReg.fit = function(X, y) {
	// check data property
	var inst_list = [X,y];
	$C.checkArgc( arguments.length, 2 );
	$C.checkInstance( inst_list );
	$C.checkSampleNum( inst_list );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// make data centered
	var meanStd = $S.meanStd( this.center, this.normalize, X, y);
	// solver
	if (this.solver === 'lsqr') { // nomal equation
	    var tmp = $M.mul( meanStd.X.t(), meanStd.X);
	    var w = $M.mul( $M.mul( tmp.inverse(), meanStd.X.t() ), meanStd.y );
	} else if (this.solver === 'qr') { // qr decomposition
	    if (X.rows >= X.cols) {
		var qr = $M.qr(meanStd.X);
		var q1 = $M.extract( qr.Q, 0, 0, X.rows, X.cols);
		var r1 = $M.extract( qr.R, 0, 0, X.cols, X.cols);
		var w = $S.fbSubstitution( r1, $M.mul( q1.t(), meanStd.y) );
	    } else {
		var qr = $M.qr(meanStd.X.t());
		var r1 = $M.extract( qr.R, 0, 0, X.rows, X.rows);
		qr.R.print();
		qr.Q.print();
		r1.print();
		var tmp = $S.fbSubstitution( r1.t(), meanStd.y );
		var zeromat = new $M(X.cols-X.rows,y.cols); zeromat.zeros();
		var w = $M.mul( qr.Q, $M.vstack([tmp, zeromat]) );
	    }
	} else {
	    throw new Error('solver should be lsqr or qr, and others have not implemented');
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
    $LinReg.predict = function(X) {
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
