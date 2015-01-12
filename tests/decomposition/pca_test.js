var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('./main');
	var MNISTLoader = require('../utils/mnist_loader');
	var AgentSmith = require('../agent_smith/src/agent_smith');
	require('../agent_smith/src/agent_smith_cl');
}

TestMain.Tester.addTest('PCATest', [
	{
		name : 'PCA',
		test : function(callback) {
		    var $M = AgentSmith.Matrix;
		    var X = $M.fromArray([[ 1,  2,  6,  3,  4],
					  [ 3,  4,  5,  4,  2],
					  [ 3,  5,  1,  6,  8],
					  [ 2,  5,  4,  6,  5],
					  [ 3, -1, -3,  2,  5],
					  [-5,  2,  1,  0, -1],
					  [-1, -2,  5,  3,  2],
					  [ 2,  2, -2,  4,  3],
					  [ 1,  1, -1, -2,  1],
					  [-1,  2,  3,  2,  1]])
		    
		    var pca = new AgentSmithML.Decomposition.PCA(n_components=4);
		    pca.fit(X);
		    var res = $M.fromArray([[-0.47967258, -0.35271391, -0.18175084, -0.54989279, -0.55685875],
					    [ 0.31349581, -0.14488228, -0.8973768 , -0.12932263,  0.24232218],
					    [ 0.29016429, -0.88217383,  0.30243265, -0.00462311,  0.21467914],
					    [-0.72480776, -0.23331985, -0.2046507 ,  0.5249886 ,  0.32050059]])
		    
		    if(pca.components_.nearlyEquals(res)){
			return true
		    }
		    else{
			return false
		    }
		    
		}
	},
]);
