/* --- base --- */

// node
var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	var AgentSmithML = require('../agent_smith_ml');
	require('./linear_model');
}

// alias
var $M = AgentSmith.Matrix;

// init
AgentSmithML.LinearModel.Base = {};
var $Base = AgentSmithML.LinearModel.Base;


/* algorithms */

// soft threshold
$Base.softThreshold = function( target, gamma ) {
	if ( gamma < Math.abs(target) && 0 < target ) {
		return target - gamma;
	} else if ( gamma < Math.abs(target) && target < 0 ) {
		return target + gamma;
	} else {
		return 0.0;
	}
};

// coorindate descent
$Base.coordinateDescent = function( X, y, lambda, alpha, maxIter, tolerance ) {
	var w = new $M( X.cols, y.cols ); w.zeros();
	var errors = new $M( X.cols, y.cols );
	var c = $M.mul( X.t(), y );
	for (var iter=0; iter<maxIter; iter++) {
		for (var row=0; row<X.cols; row++) {
			for (var col=0; col<y.cols; col++) {
				var tmp = $M.dot( $M.mul( $M.getCol(X,row).t(), X).t(), $M.getCol(w,col));
				var target = w.get(row,col) + c.get(row,col) - tmp;
				var update = $Base.softThreshold( target, lambda*alpha ) / ( 1.0 + lambda*(1.0-alpha) );
				var delta = Math.abs( update - w.get(row,col) );
				errors.set(row,col,delta);
				w.set(row,col,update);
			}
		}
		// check convergence
		var err = $M.sumEachCol(errors);
		for (var col = 0; col<y.cols; col++) {
			if (err.get(0,col) > tolerance) {
				break;
			}
			if (col === (y.cols-1)) {
				console.log('coordinate descent error has converged');
				err.print();
				return w;
			}
		}
	}
	console.log('loop has repeated maxIter times');
	err.print();
	return w;
};

// binary activation
$Base.binaryActivation = function(pred) { // if prediction is positive, set the value to 1, else set to -1
	var output = new $M(pred.rows, pred.cols);
	for (var row=0; row<pred.rows; row++) {
		for (var col=0; col<pred.cols; col++) {
			if ( pred.get(row,col) > 0.0 ) {
				output.set(row,col,1.0);
			} else {
				output.set(row,col,-1.0);
			}
		}
	}
	return output;
}