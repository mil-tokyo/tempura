/* --- util statistic --- */

// node
var nodejs = (typeof window === 'undefined');
if (nodejs) {
    var AgentSmith = require('../../agent_smith/src/agent_smith');
    var AgentSmithML = require('../agent_smith_ml');
    require('./utils');
}

// alias
var $M = AgentSmith.Matrix;

// init
AgentSmithML.Utils.Check = {};
var $C = AgentSmithML.Utils.Check;


/* check arguments */

// args numbers
$C.checkArgc = function( argc, num ) {
	if (argc !== num) {
		throw new Error('Should input the exact number of AgentSmith matrix');
	}
};

// typeof input
$C.checkInstance = function( instList ) {
	for (var i=0; i<instList.length; i++) {
		if (!instList[i] instanceof $M) {
			throw new Error('Some matrixes are not AgentSmith data format');
		}
	}
};

// sample numbers (row)
$C.checkSampleNum = function( instList ) {
	for (var i=0; i<instList.length-1; i++) {
		if (instList[i].rows !== instList[i+1].rows) {
			throw new Error('The number of samples does not match');
		}
	}
};

// data dimension expected (left column and right row)
$C.checkDataDim = function( left, right ) {
	if ( left.cols !== right.rows ) {
		throw new Error('Data dimension does not match');
	}
};

// sample dimensions (col)
$C.checkSampleDim = function( instList ) {
	for (var i=0; i<instList.length-1; i++) {
		if (instList[i].cols !== instList[i+1].cols) {
			throw new Error('The number of dimensions does not match');
		}
	}
};

// set data
$C.checkHasData = function( instList ) {
	for (var i=0; i<instList.length; i++) {
		if (instList.data === null) {
			throw new Error('No value has set to matrixes');
		}
	}
};

// nan value
$C.checkHasNan = function( instList ) {
	for (var i=0; i<instList.length; i++) {
		if ( $M.hasNaN(instList[i]) ) {
			throw new Error('Cannot handle nan values in matrixes');
		}
	}
};
