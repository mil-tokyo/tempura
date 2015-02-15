var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	require('../../agent_smith/src/agent_smith_cl');
	
	var Tempura = require('../../src/neo');
	require('../../src/neighbors/neighbors.js');
	require('../../src/neighbors/nearest_neighbors.js');
	require('../../src/neighbors/classification.js');
}

var $M = AgentSmith.Matrix;

var samples = $M.fromArray([
	[10, 22],
	[11, 12],
	[15, 14],
	[17, 12],
	[20, 10],

	[20, 20],
	[21, 22],
	[15, 20],
	[17, 14],
	[20, 12]
]);
var labels = $M.fromArray([[1,1,1,1,1,2,2,2,2,2]]);

TestMain.Tester.addTest('KNeighborsClassifierTest', [
	{
		name : 'DefaultOptions',
		test : function() {
			var clf = new Tempura.Neighbors.KNeighborsClassifier();

			if ( (typeof clf.algorithm !== 'undefined' && clf.algorithm === 'auto')
				&& (typeof clf.weights !== 'undefined' && clf.weights === 'uniform')
				&& (typeof clf.n_neighbors !== 'undefined' && clf.n_neighbors == 5)) {
				return true;
			} else {
				return false;
			}
		}
	},
	{
		name : 'GetWeights_uniform',
		test : function() {
			var clf = new Tempura.Neighbors.KNeighborsClassifier();
			var dist = new $M(3, 3);
			dist.random();

			var ans = new $M(3,3);
			ans.setEach(function(){ return 1;});

			return ans.equals(clf._get_weights(dist, 'uniform')) && ans.equals(clf._get_weights(dist)) && ans.equals(clf._get_weights(dist, null));
		}
	},
	{
		name : 'GetWeights_distance',
		test : function() {
			var clf = new Tempura.Neighbors.KNeighborsClassifier();
			var dist = $M.fromArray([
				[1, 2],
				[0.5, 0.1]
			]);
			var ans = $M.fromArray([
				[1, 0.5],
				[2, 10]
			]);
			var res = clf._get_weights(dist, 'distance');
			return ans.equals(res);
		}
	},
	{
		name : 'Predict',
		test : function() {
			var clf = new Tempura.Neighbors.KNeighborsClassifier();
			clf.fit(samples, labels);
			Z = clf.predict($M.fromArray([
				[11, 11],
				[13, 12],

				[18, 18],
				[20, 20]
			]));

			var ans = $M.fromArray([[1],[1],[2],[2]]);

			return ans.equals(Z);
		}
	}
]);
