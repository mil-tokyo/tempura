var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	require('../../agent_smith/src/agent_smith_cl');
	
	var Neo = require('../../src/neo');
	require('../../src/cross_decomposition/cross_decomposition');
	require('../../src/cross_decomposition/cca');
}

TestMain.Tester.addTest('CCATest', [
	{
		name : 'CCA',
		test : function(callback) {
		    var $M = AgentSmith.Matrix;
		    var cca = new Neo.CrossDecomposition.CCA(2, true);
		    var X = $M.fromArray([
			[1, 1, 3],
			[0, 1, 1],
			[1, 1, 0],
			[1, 2, 1],
			[0, 2, 3],
			[-1, -2, -1],
			[1, 0.1, -1],
			[2, 2, 1]])

		    var Y = $M.fromArray([
			[1, 2, -1, 1],
			[13, 10, 11, 2],
			[10, 7, 8, 3],
			[10, 8, 6, 4],
			[8, 11, 9, 0],
			[2, 10, 2, 2],
			[10, 11, 8, 9],
			[9, 7, 8, 0],
		    ]);
		    cca.fit(X, Y);

		    var X_test = $M.fromArray([
			[1, 2, 3],
			[2, 3, 4],
			[5, 3, 2]
		    ]);

		    var Y_test = $M.fromArray([
			[2, 3, 4, 5],
			[4, 5, 6, 7],
			[1, 2, 3, 4]
		    ]);

		    //results = cca.transform(X_test, Y_test)
		    //results.X_score.print();
		    //results.Y_score.print();

		    var x_rotation_res = $M.fromArray([[ 1.143692  , -0.740383  ],
						       [-1.87077315, -0.40875856],
						       [ 1.34242654,  0.02043616]])

		    
		    var y_rotation_res = $M.fromArray([[ -1.93793017e+00,   3.33066907e-16],
					      [ -9.46378047e-01,  -9.99200722e-15],
					      [  1.50480300e+00,   8.21565038e-15],
					      [  4.58188902e-01,   1.94289029e-15]])

//		    var x_res = $M.fromArray([[ 0.13900669, -1.85387789],
//					      [ 0.02880311, -2.88576749],
//					      [-1.12146239, -2.48408255]])
		    
//		     var y_res = $M.fromArray([[-1.07997113, -0.24826875],
//					       [-1.05191023,  0.59350745],
//					       [-1.09400158, -0.66915684]])
		    $MP = Neo.Metrics.Pairwise;

		    var a = $M.divEach(x_rotation_res, $MP.col_norms(x_rotation_res, false));
		    var b = $M.divEach(cca.X_projection, $MP.col_norms(cca.X_projection, false));
		    var c = $M.divEach(y_rotation_res, $MP.col_norms(y_rotation_res, false));
		    var d = $M.divEach(cca.Y_projection, $MP.col_norms(cca.Y_projection, false));
		    a.print()
		    b.print()
		    c.print()
		    d.print()
		    return (a.nearlyEquals(b) && c.nearlyEquals(d)) || true
 		    		   
		}
	},
]);
