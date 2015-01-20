var nodejs = (typeof window === 'undefined');
if (nodejs) {
    var TestMain = require('../main');
    var AgentSmith = require('../../agent_smith/src/agent_smith');
    require('../../agent_smith/src/agent_smith_cl');
    require('../../src/neighbors/neighbors.js');
    require('../../src/neighbors/nearest_neighbors.js');
}

var $M = AgentSmith.Matrix;

var samples = $M.fromArray([[1,1],[2,2]]);

TestMain.Tester.addTest('NearestNeighborTest', [
    {
        name : 'DefaultOptions',
        test : function() {
            var neigh = new AgentSmithML.Neighbors.NearestNeighbors();

            if ( (typeof neigh.algorithm !== 'undefined' && neigh.algorithm === 'auto')
                && (typeof neigh.leaf_size !== 'undefined' && neigh.leaf_size == 30)
                && (typeof neigh.n_neighbors !== 'undefined' && neigh.n_neighbors == 5)
                && (typeof neigh.radius !== 'undefined' && neigh.radius == 1.0)) {
                return true;
            } else {
                return false;
            }
        }
    },
    {
        name: 'kneighbors',
        test: function() {
            var samples = $M.fromArray([[-1, -1], [-2, -1], [-3, -2], [1, 1], [2, 1], [3, 2]]);

            var neigh = new AgentSmithML.Neighbors.NearestNeighbors({n_neighbors: 2});
            neigh.fit(samples);

            var ans = $M.fromArray([
                [0,1],
                [1,0],
                [2,1],
                [3,4],
                [4,3],
                [5,4]
            ]);
            var ans_dist = $M.fromArray([
                [0,1],
                [0,1],
                [0,Math.sqrt(2)],
                [0,1],
                [0,1],
                [0,Math.sqrt(2)]
            ]);

            var res = neigh.kneighbors(samples, {return_distance: false});
            var res_with_dist = neigh.kneighbors(samples, {return_distance: true});

            return (ans.equals(res) && ans.equals(res_with_dist[1]) && ans_dist.equals(res_with_dist[0]));
        }
    },
    {
        name: 'radius_neighbors_with_distances',
        test: function() {
            var samples = $M.fromArray([[0., 0., 0.], [0., .5, 0.], [1., 1., .5]]);
            var neigh = new AgentSmithML.Neighbors.NearestNeighbors({radius: 1.6});
            neigh.fit(samples);

            var ans = $M.fromArray([[Math.sqrt(2.5), 0.5]]);
            var ans_dist = $M.fromArray([[1,2]]);

            var res = neigh.radius_neighbors($M.fromArray([1,1,1]));
            return ( ans.equals(res[0]) && ans_dist.equals(res[1]));
        }
    },
    {
        name: 'Functions_throw_exception_if_invalid_instance_given',
        test: function() {
            var neigh = new AgentSmithML.Neighbors.NearestNeighbors(2, 0.4);
            try {
                neigh.fit($M.toArray(samples));
                return false;
            } catch(e) {
                if (!(e instanceof TypeError)) {
                    throw e;
                    return false;
                }
            }

            neigh.fit(samples);

            try {
                neigh.kneighbors([0, 0, 1.3], 2, {'return_distance': false});
                return false;
            } catch(e) {
                if (!(e instanceof TypeError)) {
                    throw e;
                    return false;
                }
            }

            try {
                neigh.radius_neighbors([0, 0, 1.3], 0.4, {'return_distance': false});
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
