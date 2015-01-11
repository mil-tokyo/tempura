var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('./main');
	var AgentSmith = require('../agent_smith/src/agent_smith');
	require('../agent_smith/src/agent_smith_cl');
	var AgentSmithML = require('../src/agent_smith_ml');
	require('../src/linear_model/linear_model');
	require('../src/linear_model/lasso');
}

TestMain.Tester.addTest('LassoTest', [
									   {
										   name : 'Lasso with lambda 0.0 (should be same as ordinary linear regression)',
											   test : function(callback) {
											   var $M = AgentSmith.Matrix;
											   var lasso = new AgentSmithML.LinearModel.Lasso({lambda:0.0});

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

											   lasso.fit(X,y);
											   var pred = lasso.predict(sample);
											   if (pred.nearlyEquals($M.fromArray( [[-7.25, 7.5],
																					[3.0, -3.0],
																					[7.33, -1.0]] ))) {
												   return true;
											   }
											   return false;

										   }
									   },

									   {
										   name : 'Lasso',
											   test : function(callback) {
											   var $M = AgentSmith.Matrix;
											   var lasso = new AgentSmithML.LinearModel.Lasso();

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

											   lasso.fit(X,y);
											   var pred = lasso.predict(sample);
											   console.log('weight');
											   lasso.weight.print();
											   pred.print();
											   if (pred.nearlyEquals($M.fromArray( [[-3.31, 3.5],
																					[1.59, -1.5],
																					[4.51, 0.5]] ))) {
												   return true;
											   }
											   return false;

										   }
									   },

												 ]);