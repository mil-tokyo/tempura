/* --- base --- */

// node
var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	var AgentSmithML = require('../agent_smith_ml');
	require('./linear_model');
}

// tmp get col
var $M = AgentSmith.Matrix;
var $P = AgentSmith.Matrix.prototype;
$P.getCol = function(col) {
	if (typeof col === 'undefined') { throw new Error('empty arguments'); }
	this.syncData();
	if (col >= this.cols) {
		throw new Error('out of range');
	}
	var output = new $M(this.rows,1);
	if (this.row_wise) {
		for (var row=0; row<this.rows; row++) {
			output.set(row,0,this.data[row*this.cols+col]);
		}
	} else {
		for (var row=0; row<this.rows; row++) {
			output.set(row,0,this.data[col*this.rows+row]);
		}
	}
	return output;
};
// tmp slice
$P.slice = function(frow,fcol,lrow,lcol) {
	if (typeof lcol === 'undefined') { throw new Error('empty arguments'); }
	this.syncData();
	if (frow < 0 || fcol < 0 || lrow > this.rows || lcol > this.cols) {
		throw new Error('out of range');
	}
	if (frow > lrow || fcol > lcol) {
		throw new Error('choose proper pointd of start and end');
	}
	var output = new $M(lrow-frow,lcol-fcol);
	if (this.row_wise) {
		for (var row=frow; row<lrow; row++) {
			for (var col=fcol; col<lcol; col++) {
				output.set(row-frow,col-fcol,this.data[row*this.cols+col]);
			}
		}
	} else {
		for (var row=frow; row<lrow; row++) {
			for (var col=fcol; col<lcol; col++) {
				output.set(row-frow,col-fcol,this.data[col*this.rows+row]);
			}
		}
	}
	return output;
};
// tmp vstack
$M.vstack = function(instList) {
	// check col num
	for (var i=0; i<instList.length-1; i++) {
		if (instList[i].cols !== instList[i+1].cols) {
			throw new Error('The number of samples does not match');
		}
	}
	// new martix
	var newRow = 0;
	for (var i=0; i<instList.length; i++) {
		newRow = newRow + instList[i].rows;
	}
	var output = new $M(newRow,instList[0].cols);
	// store values
	var offset = 0;
	for (var i=0; i<instList.length; i++) {
		console.log(offset);
		var tmp = instList[i];
		if (tmp.row_wise) {
			for (var row=0; row<tmp.rows; row++) {
				for (var col=0; col<tmp.cols; col++) {
					output.set(offset+row,col,tmp.data[row*tmp.cols+col]);
				}
			}
		} else {
			for (var row=0; row<tmp.rows; row++) {
				for (var col=0; col<tmp.cols; col++) {
					output.set(offset+row,col,tmp.data[col*tmp.rows+row]);
				}
			}
		}
		offset = offset + tmp.rows;
	}
	return output;
};



// alias
var $M = AgentSmith.Matrix;

// init
AgentSmithML.LinearModel.Base = {};
var $Base = AgentSmithML.LinearModel.Base;

// check data properties
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
				var tmp = $M.dot( $M.mul( X.getCol(row).t(), X).t(), w.getCol(col));
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

// effective linear algebra solution for given triangle matrix
$Base.fbSubstitution = function( triangle, target ) {
	var w = new $M( triangle.cols, target.cols );
	// forward substitution (ie. the triangle has lower shape)
	if ( triangle.get(0,triangle.cols-1) === 0 ) {
		for (var t = 0; t<target.cols; t++) {
			for (var row = 0; row<target.rows; row++) {
				var tmp = target.get(row,t);
				for (var col=0; col<row; col++) {
					tmp = tmp - w.get(col,t) * triangle.get(row,col);
				}
				w.set( row, t, tmp / triangle.get(row,row) );
			}
		}
	} else { // backward substitution
		for (var t = 0; t<target.cols; t++) {
			for (var row = target.rows-1; -1<row; row--) {
				var tmp = target.get(row,t);
				for (var col=triangle.cols-1; row<col; col--) {
					tmp = tmp - w.get(col,t) * triangle.get(row,col);
				}
				w.set( row, t, tmp / triangle.get(row,row) );
			}
		}
	}
	return w;
};