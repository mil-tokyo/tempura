var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../../main');
	var Sushi = require('../../../sushi/src/sushi');
	require('../../../sushi/src/sushi_cl');
	var Tempura = require('../../../src/tempura');
	require('../../../src/linear_model/linear_model');
	require('../../../src/linear_model/base.js');
	require('../../../src/linear_model/adaptive_reguralization_of_weight');
}

TestMain.Tester.addTest('AdaptiveRegularizationOfWeightTest', [
    {
	name : 'AdaptiveRegularizationOfWeight',
	test : function(callback) {
	    var $M = Sushi.Matrix;
	    var adaptive_reguralization_of_weight = new Tempura.LinearModel.OnlineLearning.AdaptiveRegularizationOfWeight();
	    
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
	    
	    adaptive_reguralization_of_weight.fit(X,y);
	    var pred = adaptive_reguralization_of_weight.predict(sample);
	    console.log('weight');
	    adaptive_reguralization_of_weight.weight.print();
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
