var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	require('../../agent_smith/src/agent_smith_cl');
}

TestMain.Tester.addTest('GMMTest', [
	{
		name : 'GMM',
		test : function(callback) {
		    var $M = AgentSmith.Matrix;
		    var gmm = new Neo.Mixture.GMM(2, 100, 0.0000001);
		    var X = $M.fromArray([
			[1, 1, 3],
			[0, 1, 1],
			[1, 1, 0],
			[1, 2, 1],
			[-1, -2, -1],
			[1, 0.1, -1],
			[2, 2, 1],
			[1, 2, -1],
			[9, 7, 8],
			[13, 10, 11],
			[10, 7, 8],
			[10, 8, 6],
			[8, 11, 9],
			[10, 11, 8],
			[9, 7, 8],
		    ]);
		    gmm.fit(X);
		    return true
		    //var result = kmeans.labels_;
		    //result.print();
		}
	},
]);
