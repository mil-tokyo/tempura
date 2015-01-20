var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	require('../../agent_smith/src/agent_smith_cl');
	var Neo = require('../../src/neo');
	require('../../src/linear_model/linear_model');
	require('../../src/linear_model/base');
	require('../../src/linear_model/linear_regression');
}

TestMain.Tester.addTest('LinearRegressionTest', [
									   {
										   name : 'Linear Regression Normal Equation',
											   test : function(callback) {
											   var $M = AgentSmith.Matrix;
											   var linReg = new Neo.LinearModel.LinearRegression({solver:'lsqr'});

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

											   linReg.fit(X,y);
											   var pred = linReg.predict(sample);
											   if (pred.nearlyEquals($M.fromArray( [[-7.25, 7.5],
																					  [3.00, -3.00],
																					  [7.33, -1.00]] )) === true) {
												   return true;
											   }
											   return false;

										   }
									   },

									   {
										   name : 'Linear Regression qr',
											   test : function(callback) {
											   var $M = AgentSmith.Matrix;
											   var linReg = new Neo.LinearModel.LinearRegression({solver:'qr'});

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

											   linReg.fit(X,y);
											   var pred = linReg.predict(sample);
											   if (pred.nearlyEquals($M.fromArray( [[-7.25, 7.5],
																					  [3.00, -3.00],
																					  [7.33, -1.00]] )) === true) {
												   return true;
											   }
											   return false;

										   }
									   },

									   {
										   name : 'Linear Regression without intercept',
											   test : function(callback) {
											   var $M = AgentSmith.Matrix;
											   var linReg = new Neo.LinearModel.LinearRegression({solver:'lsqr',center:false});

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

											   linReg.fit(X,y);
											   var pred = linReg.predict(sample);
											   if (pred.nearlyEquals($M.fromArray( [[-4.02, 1.74],
																					  [1.49, -0.31],
																					  [7.41, -1.13]] )) === true) {
												   return true;
											   }
											   return false;

										   }
									   },

									   {
										   name : 'Linear Regression with normalization',
											   test : function(callback) {
											   var $M = AgentSmith.Matrix;
											   var linReg = new Neo.LinearModel.LinearRegression({solver:'qr',normalize:true});

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

											   linReg.fit(X,y);
											   var pred = linReg.predict(sample);
											   if (pred.nearlyEquals($M.fromArray( [[-7.25, 7.5],
																					  [3.00, -3.00],
																					  [7.33, -1.00]] )) === true) {
												   return true;
											   }
											   return false;

										   }
									   },

												 ]);