var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var Sushi = require('../../sushi/src/sushi');
	require('../../sushi/src/sushi_cl');

	var Tempura = require('../../src/tempura');
	require('../../src/utils/utils.js');
	require('../../src/utils/linspace.js');
}

var $M = Sushi.Matrix;

TestMain.Tester.addTest('LinspaceTest', [
	{
		name : 'linspace_endpoint_true',
		test : function() {
			var ans = $M.fromArray([[1],[2],[3],[4],[5]]);
			var res = Tempura.Utils.linspace(1,5,{'num': 5});
			console.log($M.toArray(res));
			return ans.equals(res);
		}
	},
	{
		name : 'linspace_endpoint_false',
		test : function() {
			var ans = $M.fromArray([[1],[2],[3],[4],[5]]);
			var res = Tempura.Utils.linspace(1,6,{'num': 5, 'endpoint': false});
			console.log($M.toArray(res));
			return ans.equals(res);
		}
	}
]);
