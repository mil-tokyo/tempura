var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var Sushi = require('../../sushi/src/sushi');
	require('../../sushi/src/sushi_cl');
	var Tempura = require('../../src/tempura');
	require('../../src/linear_model/linear_model');
	require('../../src/linear_model/base.js');
	require('../../src/linear_model/logistic');
}

TestMain.Tester.addTest('LogisticTest', [
									   {
										   name : 'Logistic',
											   test : function(callback) {
											   var $M = Sushi.Matrix;
											   var logistic = new Tempura.LinearModel.Logistic({eta:0.01, maxIter:1000});

											   var X = $M.fromArray( [[0, 4, 3],
																	  [1, 5, 1],
																	  [2, 8, 2],
																	  [3, 5, 6]] );
											   var y = $M.fromArray( [[1,0],
																	  [0,1],
																	  [1,0],
																	  [0,1]] );
											   var sample = $M.fromArray( [[3, 3, 6],
																	  [2, 8, 2],
																	  [-2, 6, -3]] );

											   logistic.fit(X,y);
											   var pred = logistic.predict(sample);
											   console.log('weight');
											   logistic.weight.print();
											   pred.print();
											   if (pred.nearlyEquals($M.fromArray( [[0.06, 0.94],
																					[0.64, 0.36],
																					[0.99, 0.01]] ))) {
												   return true;
											   }
											   return false;

										   }
									   },

												 ]);
