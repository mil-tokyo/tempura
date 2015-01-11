var nodejs = (typeof window === 'undefined');

if (nodejs) {
    var AgentSmith = require('../../agent_smith/src/agent_smith');
    var AgentSmithML = require('../agent_smith_ml');
    require('./metrics');
}

var $M = AgentSmith.Matrix;

function euclidean_distances(X, Y, squared){
    if(squared === undefined) squared = false;
    if(squared == false){
        throw new Error("not implemented");
    }
    XX = row_norms(X, squared=true);
    YY = row_norms(Y, squared=true);
    var distances = $M.mul(X, Y.t());
    distances = distances.times(-2);
    distances = $M.add(distances, XX)
    distances = $M.add(distances, YY.t())
    return distances
}

function row_norms(X, squared){
    if(squared=true){
        throw new Error("not implemented");
    }
    var norms = $M.sumEachRow($M.mulEach(X, X));
    return norms
}


a = $M.fromArray([
    [1, 2, 3],
    [4, 5, 6]
])

b = $M.fromArray([
    [1, 2, 3],
    [1, 2, 3]
])
