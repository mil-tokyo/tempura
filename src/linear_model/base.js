(function() {

	// namespace
	if (typeof AgentSmithML.LinearModel.Base !== 'undefined') {
		return;
	}

	// node
	var nodejs = (typeof window === 'undefined');
	if (nodejs) {
		require('../../../agent_smith/src/agent_smith');
		require('../agent_smith_ml');
		require('./linear_model');
	}
	var $M = AgentSmith.Matrix;


	/* --- base --- */

	// init
	AgentSmithML.LinearModel.Base = function(){};
	var $Base = AgentSmithML.LinearModel.Base.prototype;

	// check data property
	$Base.checkArgc = function( argc, num ) {
		if (argc !== num) {
			throw new Error('Should input exactly two AgentSmith matrix');
		}
	};
	$Base.checkInstance = function( instList ) {
		for (var i=0; i<instList.length; i++) {
			if (!instList[i] instanceof $M) {
				throw new Error('Some matrixes are not AgentSmith data format');
			}
		}
	};
	$Base.checkSampleNum = function( instList ) {
		for (var i=0; i<instList.length-1; i++) {
			if (instList[i].rows !== instList[i+1].rows) {
				throw new Error('The number of samples does not match');
			}
		}
	};
	$Base.checkDataDim = function( left, right ) {
		if ( left.cols !== right.rows ) {
			throw new Error('Data dimension does not match');
		}
	};
	$Base.checkHasData = function( instList ) {
		for (var i=0; i<instList.length; i++) {
			if (instList.data === null) {
				throw new Error('No value has set to matrixes');
			}
		}
	};
	$Base.checkHasNan = function( instList ) {
		for (var i=0; i<instList.length; i++) {
			if ( $M.hasNaN(instList[i]) ) {
				throw new Error('Cannot handle nan values in matrixes');
			}
		}
	};

	// center and normalize
	$Base.meanStd = function( center, normalize, X, y ) {
		// make data centered
		if (center) {
			var X_mean = $M.sumEachCol(X).times( 1.0 / X.rows );
			X = $M.sub( X, X_mean );
			// make data normalized
			var X_std = new $M( 1, X.cols );
			if (normalize) {
				var X_var = $M.sumEachCol( $M.mulEach(X,X) );
				for (var i=0; i<X.cols; i++) {
					var tmp = Math.sqrt( X_var.get(0,i) );
					if (tmp !== 0) {
						X_std.set(0,i,tmp);
					} else {
						X_std.set(0,i,1.0);
					}
				}
				X = $M.divEach( X, X_std );
			} else {
				X_std.zeros(1.0);
			}
			var y_mean = $M.sumEachCol(y).times( 1.0 / y.rows );
			y = $M.sub( y, y_mean );
		} else {
			var X_mean = new $M( 1, X.cols ); X_mean.zeros();
			var X_std = new $M( 1, X.cols ); X_mean.zeros(1.0);
			var y_mean = new $M( 1, y.cols ); y_mean.zeros();
		}
		return { X:X, y:y, X_mean:X_mean, X_std:X_std, y_mean:y_mean }
	};

})();


var nodejs = (typeof window === 'undefined');
if (nodejs) {
	module.exports = AgentSmithML.LinearModel.Base;
}