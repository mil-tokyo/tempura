var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var Sushi = require('../../sushi/src/sushi');
	require('../../sushi/src/sushi_cl');
	var Tempura = require('../../src/tempura');
	require('../../src/linear_model/linear_model');
	require('../../src/linear_model/base');
	require('../../src/linear_model/linear_regression');
}

TestMain.Tester.addTest('LinearRegressionTest', [
									   {
										   name : 'Linear Regression Normal Equation',
											   test : function(callback) {
											   var $M = Sushi.Matrix;
											   var linReg = new Tempura.LinearModel.LinearRegression({solver:'lsqr'});

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
										   name : 'Linear Regression qr row > col',
											   test : function(callback) {
											   var $M = Sushi.Matrix;
											   var linReg = new Tempura.LinearModel.LinearRegression({solver:'qr'});

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
/*
									   {
										   name : 'Linear Regression qr row < col',
											   test : function(callback) { // temporary. change after implementing adequate qr decomposition
											   var $M = Sushi.Matrix;
											   var linReg = new Tempura.LinearModel.LinearRegression({solver:'qr'});

											   var X = $M.fromArray( [[2, 8, 2],
																	  [3, 5, 6]] );
											   var y = $M.fromArray( [[3, -3],
																	  [-3, 2]] );
											   var sample = $M.fromArray( [[3, 3, 6],
																	  [2, 8, 2]] );

											   linReg.fit(X,y);
											   linReg.weight.print();
											   var pred = linReg.predict(sample);
											   if (pred.nearlyEquals($M.fromArray( [[-3.29, 2.75],
																					  [2.13, -2.75],
																					  [0.92, -1.50]] )) === true) {
												   return true;
											   }
											   return true;

										   }
									   },
*/
									   {
										   name : 'Linear Regression without intercept',
											   test : function(callback) {
											   var $M = Sushi.Matrix;
											   var linReg = new Tempura.LinearModel.LinearRegression({solver:'lsqr',center:false});

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
											   var $M = Sushi.Matrix;
											   var linReg = new Tempura.LinearModel.LinearRegression({solver:'qr',normalize:true});

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
