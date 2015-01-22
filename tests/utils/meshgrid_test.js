var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	require('../../agent_smith/src/agent_smith_cl');

	var Neo = require('../../src/neo');
	require('../../src/utils/utils.js');
	require('../../src/utils/meshgrid.js');
}

var $M = AgentSmith.Matrix;

TestMain.Tester.addTest('MeshgridTest', [
	{
		name : 'meshgrid',
		test : function() {
			var xlist = $M.fromArray([[1],[2],[3],[4],[5]]);
			var ylist = $M.fromArray([[6],[7],[8],[9],[0]]);
			var ans = $M.fromArray([
				[1,6],[2,6],[3,6],[4,6],[5,6],
				[1,7],[2,7],[3,7],[4,7],[5,7],
				[1,8],[2,8],[3,8],[4,8],[5,8],
				[1,9],[2,9],[3,9],[4,9],[5,9],
				[1,0],[2,0],[3,0],[4,0],[5,0],
			]);
			var res = Neo.Utils.meshgrid(xlist,ylist);

			return ans.equals(res);
		}
	}
]);
