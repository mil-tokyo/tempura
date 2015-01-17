var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('./main');
	var MNISTLoader = require('../utils/mnist_loader');
	var AgentSmith = require('../agent_smith/src/agent_smith');
	require('../agent_smith/src/agent_smith_cl');
}

TestMain.Tester.addTest('CCATest', [
	{
		name : 'CCA',
		test : function(callback) {
		    var $M = AgentSmith.Matrix;
		    var cca = new AgentSmithML.CrossDecomposition.CCA(2, true);
		    var X = $M.fromArray([
			[1, 1, 3],
			[0, 1, 1],
			[1, 1, 0],
			[1, 2, 1],
			[-1, -2, -1],
			[1, 0.1, -1],
			[2, 2, 1]])

		    var Y = $M.fromArray([
			[1, 2, -1, 1],
			[13, 10, 11, 2],
			[10, 7, 8, 3],
			[10, 8, 6, 4],
			[8, 11, 9, 0],
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

		    results = cca.transform(X_test, Y_test)
		    results.X_score.print();
		    results.Y_score.print();
		    
		    var x_res = $M.fromArray([[ 0.13900669, -1.85387789],
					      [ 0.02880311, -2.88576749],
					      [-1.12146239, -2.48408255]])
		    
		     var y_res = $M.fromArray([[-1.07997113, -0.24826875],
					       [-1.05191023,  0.59350745],
					       [-1.09400158, -0.66915684]])
		    return x_res.equals(results.X_score) && y_res.equals(results.Y_score)
		}
	},
]);
