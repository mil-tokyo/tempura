var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	require('../../agent_smith/src/agent_smith_cl');
	
	var Neo = require('../../src/neo');
	require('../../src/mixture/mixture');
	require('../../src/mixture/gmm');
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

		    var res_weights1 = $M.fromArray([[ 0.53333333,  0.46666667]]);
		    var res_weights2 = $M.fromArray([[ 0.46666667, 0.53333333]]);

		    var res_means1 = $M.fromArray([[ 0.75      ,  0.8875    ,  0.375     ]]).t();
		    var res_means2 = $M.fromArray([[ 9.85714286,  8.71428571,  8.28571428]]).t();

		    var res_covars1 = $M.fromArray([[ 0.6885    ,  0.846875  ,  0.34375   ],
						   [ 0.846875  ,  1.58959375,  0.6546875 ],
						   [ 0.34375   ,  0.6546875 ,  1.735375  ]]);

		    var res_covars2 = $M.fromArray([[ 2.12344899,  0.38775511,  1.04081633],
						   [ 0.38775511,  3.0622245 ,  1.08163266],
						   [ 1.04081633,  1.08163266,  1.91936735]]);


		    for(var k=0; k<2; k++){
			if(!(gmm.means[k].nearlyEquals(res_means1) ||  gmm.means[k].nearlyEquals(res_means2))){
			    return false
			}
			if(!(gmm.covars[k].nearlyEquals(res_covars1) ||  gmm.covars[k].nearlyEquals(res_covars2))){
			    return false
			}

			if(!(gmm.weights.nearlyEquals(res_weights1) || gmm.weights.nearlyEquals(res_weights2))){
			    return false
			}
		    }
			
		    return true
		}
	},
]);