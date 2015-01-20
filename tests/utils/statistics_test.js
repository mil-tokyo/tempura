var nodejs = (typeof window === 'undefined');
if (nodejs) {
    var TestMain = require('../main');
    var AgentSmith = require('../../agent_smith/src/agent_smith');
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
    {
        name : 'frac',
        test : function() {
	    var input = $M.fromArray([[ 0.1, -10,  1,  -2],
				      [ 0.5,  2, -5,  -10]])
				     

            var res = AgentSmithML.Utils.Statistics.frac(input);

	    var output = $M.fromArray([[ 10, -0.1, 1,  -0.5 ],
				       [2,  0.5 , -0.2,  -0.1 ]])
	    res.print()
            return output.equals(res);
        }
	},
    {
        name : 'vstack',
        test : function() {
	    var input = [];
	    var input1 = $M.fromArray([[ 1, -1,  0,  5],
				      [ -10,  1, -1,  10],
				      [-1,  9,  7,  2]])
	    input.push(input1);

	    var input2 = $M.fromArray([[ 1, -1,  4,  0],
				      [ 0,  1, -1,  -2],
				      [-1,  0,  1,  -6]])

	    input.push(input2);

	    var input3 = $M.fromArray([[ 1, -1,  0],
				       [ 0,  1, -1],
				       [-1,  0,  1],
				       [1, 2, 3]]).t();

	    input.push(input3);
	    var res = AgentSmithML.Utils.Statistics.vstack(input)

	    
	    var output = $M.fromArray([[ 1, -1,  0,  5],
				       [ -10,  1, -1,  10],
				       [-1,  9,  7,  2],
				       [ 1, -1,  4,  0],
				       [ 0,  1, -1,  -2],
				       [-1,  0,  1,  -6],
				       [1, 0, -1, 1],
				       [-1, 1, 0, 2],
				       [0, -1, 1, 3]]
				     )
	    res.print()
            return output.equals(res);
        }
    },

]);
