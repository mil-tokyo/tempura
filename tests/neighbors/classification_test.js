var nodejs = (typeof window === 'undefined');
if (nodejs) {
    var TestMain = require('./main');
    var AgentSmith = require('../agent_smith/src/agent_smith');
    require('../agent_smith/src/agent_smith_cl');
    require('../src/neighbors/neighbors.js');
    require('../src/neighbors/nearest_neighbors.js');
    require('../src/neighbors/classification.js');
}

var samples = $M.fromArray([[1,1],[2,2]]);

TestMain.Tester.addTest('KNeighborsClassifierTest', [
    {
        name : 'DefaultOptions',
        test : function() {
            var clf = new AgentSmithML.Neighbors.KNeighborsClassifier();

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
        name : 'Predict',
        test : function() {
            return false;
        }
    }
]);