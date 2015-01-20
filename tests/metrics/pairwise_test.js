var nodejs = (typeof window === 'undefined');
if (nodejs) {
    var TestMain = require('../main');
    var AgentSmith = require('../../agent_smith/src/agent_smith');
    require('../../agent_smith/src/agent_smith_cl');
    require('../../src/metrics/metrics.js');
    require('../../src/metrics/pairwise.js');
}

var $M = AgentSmith.Matrix;

var sample_2d_single_zero = $M.fromArray([[0,0]]);
var sample_2d_single_a = $M.fromArray([[3,4]]);
var sample_2d_single_b = $M.fromArray([[5,12]]);

TestMain.Tester.addTest('MetricsTest', [
    {
        name : 'RowNorms_squared_1',
        test : function() {
            var input = $M.fromArray([[0,0]]);
            var res = AgentSmithML.Metrics.Pairwise.row_norms(input, true);
            return $M.fromArray([[0]]).equals(res);
        }
    },
    {
        name : 'RowNorms_squared_2',
        test : function() {
            var input = $M.fromArray([[0,0], [3,4]]);
            var res = AgentSmithML.Metrics.Pairwise.row_norms(input, true);
            return $M.fromArray([[0], [25]]).equals(res);
        }
    },
    {
        name : 'RowNorms_2',
        test : function() {
            var input = $M.fromArray([[0,0], [3,4]]);
            var res = AgentSmithML.Metrics.Pairwise.row_norms(input, false);
            return $M.fromArray([[0], [5]]).equals(res);
        }
    },
    {
        name : 'euclidean_distance_squared_multi',
        test : function() {
            var input_a = $M.fromArray([
                [0,0],
                [3,4]
            ]);
            var input_b = $M.fromArray([
                [0,0],
                [5,12]
            ]);

            var res = AgentSmithML.Metrics.Pairwise.euclidean_distances(input_a, input_b, true);
            return $M.fromArray([
                [0, 169],
                [25, 68]
            ]).equals(res);
        }
    },
    {
        name : 'euclidean_distance_squared_0',
        test : function() {
            var res = AgentSmithML.Metrics.Pairwise.euclidean_distances(sample_2d_single_zero, sample_2d_single_zero, true);
            return $M.fromArray([[0]]).equals(res);
        }
    },
    {
        name : 'euclidean_distance_0',
        test : function() {
            var res = AgentSmithML.Metrics.Pairwise.euclidean_distances(sample_2d_single_zero, sample_2d_single_zero, false);
            return $M.fromArray([[0]]).equals(res);
        }
    },
    {
        name : 'EuclideanDistance_squared_1',
        test : function() {
            var res = AgentSmithML.Metrics.Pairwise.euclidean_distances(sample_2d_single_zero, sample_2d_single_a, true);
            return $M.fromArray([[25]]).equals(res);
        }
    },
    {
        name : 'EuclideanDistance_1',
        test : function() {
            var res = AgentSmithML.Metrics.Pairwise.euclidean_distances(sample_2d_single_zero, sample_2d_single_a, false);
            return $M.fromArray([[5]]).equals(res);
        }
    },
    {
        name : 'EuclideanDistance_squared_1_inv',
        test : function() {
            var res = AgentSmithML.Metrics.Pairwise.euclidean_distances(sample_2d_single_a, sample_2d_single_zero, true);
            return $M.fromArray([[25]]).equals(res);
        }
    },
    {
        name : 'EuclideanDistance_1_inv',
        test : function() {
            var res = AgentSmithML.Metrics.Pairwise.euclidean_distances(sample_2d_single_a, sample_2d_single_zero, false);
            return $M.fromArray([[5]]).equals(res);
        }
    },
    {
        name : 'EuclideanDistance_squared_2',
        test : function() {
            var res = AgentSmithML.Metrics.Pairwise.euclidean_distances(sample_2d_single_zero, sample_2d_single_b, true);
            return $M.fromArray([[169]]).equals(res);
        }
    },
    {
        name : 'EuclideanDistance_2',
        test : function() {
            var res = AgentSmithML.Metrics.Pairwise.euclidean_distances(sample_2d_single_zero, sample_2d_single_b, false);
            return $M.fromArray([[13]]).nearlyEquals(res);
        }
    },
    {
        name : 'EuclideanDistance_squared_2_inv',
        test : function() {
            var res = AgentSmithML.Metrics.Pairwise.euclidean_distances(sample_2d_single_b, sample_2d_single_zero, true);
            return $M.fromArray([[169]]).equals(res);
        }
    },
    {
        name : 'EuclideanDistance_2_inv',
        test : function() {
            var res = AgentSmithML.Metrics.Pairwise.euclidean_distances(sample_2d_single_b, sample_2d_single_zero, false);
            return $M.fromArray([[13]]).equals(res);
        }
    },
    {
        name: 'Functions_throw_exception_if_invalid_instance_given',
        test: function() {
            try {
                AgentSmithML.Metrics.Pairwise.row_norms([0,0], [0,0], true);
                return false;
            } catch(e) {
                if (!(e instanceof TypeError)) {
                    throw e;
                    return false;
                }
            }

            try {
                AgentSmithML.Metrics.Pairwise.euclidean_distances([0,0], [0,0], true);
                return false;
            } catch(e) {
                if (!(e instanceof TypeError)) {
                    throw e;
                    return false;
                }
            }

            try {
                AgentSmithML.Metrics.Pairwise.euclidean_distances([0,0], [1,2], true);
                return false;
            } catch(e) {
                if (!(e instanceof TypeError)) {
                    throw e;
                    return false;
                }
            }
	    
            return true;
        }
    }
]);
