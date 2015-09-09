var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../../main');
	var Sushi = require('../../../sushi/src/sushi');
	require('../../../sushi/src/sushi_cl');
	var Tempura = require('../../../src/tempura');
	require('../../../src/linear_model/linear_model');
	require('../../../src/linear_model/base.js');
	require('../../../src/linear_model/soft_confidence_weighted');
}

TestMain.Tester.addTest('SoftConfidenceWeightedTest', [
    {
	name : 'SoftConfidenceWeighted',
	test : function(callback) {
	    var $M = Sushi.Matrix;
	    var soft_confidence_weighted = new Tempura.LinearModel.OnlineLearning.SoftConfidenceWeighted();
	    
	    var X = $M.fromArray( [[0, 4, 3],
				   [1, 5, 1],
				   [2, 8, 2],
				   [3, 5, 6]] );
	    var y = $M.fromArray( [[1],
				   [-1],
				   [1],
				   [-1]] );
	    var sample = $M.fromArray( [[3, 3, 6],
					[2, 8, 2],
					[-2, 6, -3]] );
	    
	    soft_confidence_weighted.fit(X,y);
	    var pred = soft_confidence_weighted.predict(sample);
	    console.log('weight');
	    soft_confidence_weighted.weight.print();
	    pred.print();
	    if (pred.nearlyEquals($M.fromArray( [[-1],
						 [1],
						 [1]] ))) {
		return true;
	    }
	    return false;
	    
	}
    },
    
]);
