var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('./main');
	var AgentSmith = require('../agent_smith/src/agent_smith');
	require('../agent_smith/src/agent_smith_cl');
}

TestMain.Tester.addTest('VisualizerTest', [
	{
		name : 'Visualize',
		test : function(callback) {
			if (nodejs) {
				return null;
			} else {
				AgentSmithVisualizer.createScatter(
					'Sample Scatter Graph',
					{
						'data1' : AgentSmith.Matrix.fromArray([
							[10, 22],
							[11, 12],
							[15, 14],
							[17, 12],
							[20, 10]
						]),
						'data2' : AgentSmith.Matrix.fromArray([
							[20, 20],
							[21, 22],
							[15, 20],
							[17, 14],
							[20, 12]
						]),
					}
				);
				return true;
			}
		}
	}
]);