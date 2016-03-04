// The MIT License (MIT)

// Copyright (c) 2014 Machine Intelligence Laboratory (The University of Tokyo)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/* --- util statistic --- */
(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
    	require('./utils');
    }

    // init
    Tempura.Utils.Check = {};
    var $C = Tempura.Utils.Check;


    /* check arguments */

    // args numbers
    $C.checkArgc = function( argc, num ) {
	if (argc !== num) {
	    throw new Error('Should input the exact number of Sushi matrix');
	}
    };

    // typeof input
    $C.checkInstance = function( inst_list ) {
	for (var i=0; i<inst_list.length; i++) {
	    if (!inst_list[i] instanceof $M) {
		throw new Error('Some matrixes are not Sushi data format');
	    }
	}
    };

    // sample numbers (row)
    $C.checkSampleNum = function( inst_list ) {
	for (var i=0; i<inst_list.length-1; i++) {
	    if (inst_list[i].rows !== inst_list[i+1].rows) {
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
    $C.checkSampleDim = function( inst_list ) {
	for (var i=0; i<inst_list.length-1; i++) {
	    if (inst_list[i].cols !== inst_list[i+1].cols) {
		throw new Error('The number of dimensions does not match');
	    }
	}
    };

    // set data
    $C.checkHasData = function( inst_list ) {
	for (var i=0; i<inst_list.length; i++) {
	    if (inst_list.data === null) {
		throw new Error('No value has set to matrixes');
	    }
	}
    };

    // nan value
    $C.checkHasNan = function( inst_list ) {
	for (var i=0; i<inst_list.length; i++) {
	    if ( $M.hasNaN(inst_list[i]) ) {
		throw new Error('Cannot handle nan values in matrixes');
	    }
	}
    };
})(typeof window === 'undefined', Sushi.Matrix, Tempura);
