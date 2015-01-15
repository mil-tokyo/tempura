var nodejs = (typeof window === 'undefined');
if (nodejs) {
    var TestMain = require('../main');
    var AgentSmith = require('../agent_smith/src/agent_smith');
    require('../../agent_smith/src/agent_smith_cl');
    require('../../src/utils/utils.js');
    require('../../src/utils/statistics.js');
}


TestMain.Tester.addTest('StatisticsTest', [
    {
        name : 'covariance',
        test : function() {
	    var input = $M.fromArray([[ 1, -1,  0,  0],
				      [ 0,  1, -1,  0],
				      [-1,  0,  1,  0]])

            var res = AgentSmithML.Utils.Statistics.cov(input);

	    var output = $M.fromArray([[ 1. , -0.5, -0.5,  0. ],
				       [-0.5,  1. , -0.5,  0. ],
				       [-0.5, -0.5,  1. ,  0. ],
				       [ 0. ,  0. ,  0. ,  0. ]])
	    res.print()
            return output.equals(res);
        }
    },
]);
