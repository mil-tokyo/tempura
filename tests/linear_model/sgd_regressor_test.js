var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	require('../../agent_smith/src/agent_smith_cl');
	var Neo = require('../../src/neo');
	require('../../src/linear_model/linear_model');
	require('../../src/linear_model/base.js');
	require('../../src/linear_model/sgd_regressor');
}

TestMain.Tester.addTest('SGDRegressorTest', [
									   {
										   name : 'SVM',
											   test : function(callback) {
											   var $M = AgentSmith.Matrix;
											   var sgdr = new Neo.LinearModel.SGDRegressor({algorithm:'sgdsvm', n_iter:1000});

											   var X = $M.fromArray( [[0, 4, 3],
																	  [1, 5, 1],
																	  [2, 8, 2],
																	  [3, 5, 6],
																	  [-1, -4, 5]] );
											   var y = $M.fromArray( [[1, 0, 0],
																	  [1, 0, 0],
																	  [0, 1, 0],
																	  [0, 1, 0],
																	  [0, 0, 1]] );
											   var sample = $M.fromArray( [[3, 3, 6],
																	  [2, 8, 2],
																	  [-2, 6, -3]] );

											   sgdr.fit(X,y);
											   var pred = sgdr.predict(sample);
											   console.log('weight');
											   sgdr.weight.print();
											   pred.print();
											   if (pred.nearlyEquals($M.fromArray( [[1, 0, 0],
																					[0, 1, 0],
																					[0, 0, 1]] ))) {
												   return true;
											   }
											   return false;

										   }
									   },

									   {
										   name : 'Perceptron',
											   test : function(callback) {
											   var $M = AgentSmith.Matrix;
											   var sgdr = new Neo.LinearModel.SGDRegressor({algorithm:'perceptron', n_iter:1000});

											   var X = $M.fromArray( [[0, 4, 3],
																	  [1, 5, 1],
																	  [2, 8, 2],
																	  [3, 5, 6]] );
											   var y = $M.fromArray( [[1, 1],
																	  [-1, 1],
																	  [1, -1],
																	  [-1, 1]] );
											   var sample = $M.fromArray( [[3, 3, 6],
																	  [2, 8, 2],
																	  [-2, 6, -3]] );

											   sgdr.fit(X,y);
											   var pred = sgdr.predict(sample);
											   console.log('weight');
											   sgdr.weight.print();
											   pred.print();
											   if (pred.nearlyEquals($M.fromArray( [[-1, 1],
																					[1, -1],
																					[1, -1]] ))) {
												   return true;
											   }
											   return false;

										   }
									   },

												 ]);
