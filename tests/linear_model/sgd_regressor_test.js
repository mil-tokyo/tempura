var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	require('../../agent_smith/src/agent_smith_cl');
	var Tempura = require('../../src/neo');
	require('../../src/utils/statistics');
	require('../../src/linear_model/linear_model');
	require('../../src/linear_model/base.js');
	require('../../src/linear_model/sgd_regressor');
}

TestMain.Tester.addTest('SGDRegressorTest', [
									   {
										   name : 'SVM',
											   test : function(callback) {
											   var $M = AgentSmith.Matrix;
											   // regularization term seems better to use 1/N
											   var sgdr = new Tempura.LinearModel.SGDRegressor({algorithm:'sgdsvm'});
											   var X = $M.fromArray([
																	 [ 1.4949318 ,  3.85848832],
																	 [ 1.42613574,  0.0456529 ],
																	 [ 1.1641107 ,  3.79132988],
																	 [ 1.54632313,  4.212973  ],
																	 [ 2.09680487,  3.7174206 ],
																	 [ 1.24258802,  4.50399192],
																	 [ 0.91433877,  4.55014643],
																	 [ 2.14823598,  1.12456117],
																	 [ 3.4171203 ,  0.02504426],
																	 [-0.55552381,  4.69595848],
																	 [ 2.08272263,  0.78535335],
																	 [ 1.52259607, -0.29081422],
																	 [ 2.97493505,  1.77927892],
																	 [ 1.06269622,  5.17635143],
																	 [ 1.82287143,  0.71628201],
																	 [ 2.79344193,  1.61909157],
																	 [ 1.84652023,  0.99147304],
																	 [ 1.03150541,  2.0681289 ],
																	 [ 1.87271752,  4.18069237],
																	 [ 1.43289271,  4.37679234]
																	 ]);
											   var y = $M.fromArray([[1, 0],
																	 [0, 1],
																	 [1, 0],
																	 [1, 0],
																	 [1, 0],
																	 [1, 0],
																	 [1, 0],
																	 [0, 1],
																	 [0, 1],
																	 [1, 0],
																	 [0, 1],
																	 [0, 1],
																	 [0, 1],
																	 [1, 0],
																	 [0, 1],
																	 [0, 1],
																	 [0, 1],
																	 [0, 1],
																	 [1, 0],
																	 [1, 0]]);
											   sgdr.fit(X,y);
											   var w = sgdr.weight;
											   console.log( 'gradient' ); var grad = - w.get(0,0) / w.get(1,0); console.log( grad );
											   console.log( 'intercept' ); var inter = - w.get(2,0) / w.get(1,0); console.log( inter );
											   if ($M.fromArray( [[grad,inter]] ).nearlyEquals(
																							   $M.fromArray( [[-0.037, 0.119]] ))) {
												   return true;
											   }
											   return false;

										   }
									   },


									   {
										   name : 'Perceptron',
											   test : function(callback) {
											   var $M = AgentSmith.Matrix;
											   // aver:false is required for perceptron (cuz this method will normalize features before fitting)
											   var sgdr = new Tempura.LinearModel.SGDRegressor({algorithm:'perceptron', aver:false, lambda:0.0});

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
											   var ans = $M.argmaxEachRow( pred );
											   ans.print();
											   // $Base.binaryActivation( pred ).print();
											   if ( ans.nearlyEquals($M.fromArray( [[1],
																					[1],
																					[0]] ))) {
												   return true;
											   }
											   return false;

										   }
									   },

												 ]);
