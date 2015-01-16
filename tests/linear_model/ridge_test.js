var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	require('../../agent_smith/src/agent_smith_cl');
	var AgentSmithML = require('../../src/agent_smith_ml');
	require('../../src/linear_model/linear_model');
	require('../../src/linear_model/base');
	require('../../src/linear_model/ridge');
}

TestMain.Tester.addTest('RidgeTest', [
									   {
										   name : 'Ridge Coordinate Descent',
											   test : function(callback) {
											   var $M = AgentSmith.Matrix;
											   var ridge = new AgentSmithML.LinearModel.Ridge({solver:'cd'});

											   var X = $M.fromArray( [[0, 4, 3],
																	  [1, 5, 1],
																	  [2, 8, 2],
																	  [3, 5, 6]] );
											   var y = $M.fromArray( [[2, 1],
																	  [-1, 4],
																	  [3, -3],
																	  [-3, 2]] );
											   var sample = $M.fromArray( [[3, 3, 6],
																	  [2, 8, 2],
																	  [-2, 6, -3]] );

											   ridge.fit(X,y);
											   var pred = ridge.predict(sample);
											   console.log('weight');
											   ridge.weight.print();
											   pred.print();
											   if (pred.nearlyEquals($M.fromArray( [[-2.29, 2.60],
																					[1.23, -0.64],
																					[3.72, 0.82]] ))) {
												   return true;
											   }
											   return false;

										   }
									   },

									   {
										   name : 'Ridge Normal Equation',
											   test : function(callback) {
											   var $M = AgentSmith.Matrix;
											   var ridge = new AgentSmithML.LinearModel.Ridge({solver:'lsqr'});

											   var X = $M.fromArray( [[0, 4, 3],
																	  [1, 5, 1],
																	  [2, 8, 2],
																	  [3, 5, 6]] );
											   var y = $M.fromArray( [[2, 1],
																	  [-1, 4],
																	  [3, -3],
																	  [-3, 2]] );
											   var sample = $M.fromArray( [[3, 3, 6],
																	  [2, 8, 2],
																	  [-2, 6, -3]] );

											   ridge.fit(X,y);
											   var pred = ridge.predict(sample);
											   console.log('weight');
											   ridge.weight.print();
											   pred.print();
											   if (pred.nearlyEquals($M.fromArray( [[-2.29, 2.60],
																					[1.23, -0.64],
																					[3.72, 0.82]] ))) {
												   return true;
											   }
											   return false;

										   }
									   },

												 ]);