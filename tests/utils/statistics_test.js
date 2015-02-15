var nodejs = (typeof window === 'undefined');
if (nodejs) {
    var TestMain = require('../main');
    var AgentSmith = require('../../agent_smith/src/agent_smith');
    require('../../agent_smith/src/agent_smith_cl');
    
	var Tempura = require('../../src/neo');
    require('../../src/utils/utils.js');
    require('../../src/utils/statistics.js');
}

var $M = AgentSmith.Matrix;

TestMain.Tester.addTest('StatisticsTest', [
    {
        name : 'covariance',
        test : function() {
	    var input = $M.fromArray([[ 1, -1,  0,  0],
				      [ 0,  1, -1,  0],
				      [-1,  0,  1,  0]])

            var res = Tempura.Utils.Statistics.cov(input);

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
				     

            var res = Tempura.Utils.Statistics.frac(input);

	    var output = $M.fromArray([[ 10, -0.1, 1,  -0.5 ],
				       [2,  0.5 , -0.2,  -0.1 ]])
	    res.print()
            return output.equals(res);
        }
	},
    {
        name : 'deleteRow row_wise',
        test : function() {
	    var input = $M.fromArray([[ 0.1, -10,  1,  -2],
				      [ 50,  2, -1,  -10],
				      [ 15,  23, -5,  -10]])
				     

            var res = Tempura.Utils.Statistics.deleteRow(input, 1);

	    var output = $M.fromArray([[ 0.1, -10,  1,  -2],
				       [ 15,  23, -5,  -10]])
	    res.print()
            return output.equals(res);
        }
    },
    {
        name : 'deleteRow not row_wise',
        test : function() {
	    var input = $M.fromArray([[ 0.1, 50,  15],
				      [-10, 2, 23],
				      [1, -1, -5],
				      [-2, -10, -10]]).t();
				     
            var res = Tempura.Utils.Statistics.deleteRow(input, 1);

	    var output = $M.fromArray([[ 0.1, -10,  1,  -2],
				       [ 15,  23, -5,  -10]])
	    res.print()
            return output.equals(res);
        }
    },

]);
