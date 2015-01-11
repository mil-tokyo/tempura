var nodejs = (typeof window === 'undefined');
if (nodejs) {
    var TestMain = require('./main');
    var AgentSmith = require('../agent_smith/src/agent_smith');
    require('../agent_smith/src/agent_smith_cl');
    require('../src/neighbors/neighbors.js');
    require('../src/neighbors/nearest_neighbors.js');
}

var samples = $M.fromArray([[0, 0, 1.3], [1, 0, 0], [0, 0, 1]]);

TestMain.Tester.addTest('NearestNeighborTest', [
    {
        name : 'Fit',
        test : function() {
            var neigh = new AgentSmithML.Neighbors.NearestNeighbors(2, 0.4);
            var res = neigh.fit(samples);

            if ( (typeof res.algorithm !== 'undefined' && res.algorithm === 'auto')
                && (typeof res.leaf_size !== 'undefined' && res.leaf_size == 30)
                && (typeof res.n_neighbors !== 'undefined' && res.n_neighbors == 2)
                && (typeof res.radius !== 'undefined' && res.radius == 0.4)) {
                return true;
            } else {
                return false;
            }
        }
    },
    {
        name: 'kneighbors',
        test: function() {
            var neigh = new AgentSmithML.Neighbors.NearestNeighbors(2, 0.4);
            neigh.fit(samples);

            var res = neigh.kneighbors($M.fromArray([0, 0, 1.3]), 2, {'return_distance': false});
            return $M.fromArray([[2],[0]]).equals(res)
        }
    },
    {
        name: 'radius_neighbors',
        test: function() {
            var neigh = new AgentSmithML.Neighbors.NearestNeighbors(2, 0.4);
            neigh.fit(samples);

            var res = neigh.radius_neighbors($M.fromArray([0, 0, 1.3], 0.4, {'return_distance': false}));
            return $M.fromArray([[2]]).equals(res);
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