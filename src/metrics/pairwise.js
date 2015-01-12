var nodejs = (typeof window === 'undefined');

if (nodejs) {
    var AgentSmith = require('../../agent_smith/src/agent_smith');
    var AgentSmithML = require('../agent_smith_ml');
    require('./metrics');
}

var $M = AgentSmith.Matrix;

AgentSmithML.Metrics.Pairwise = {
    euclidean_distances : function (X, Y, squared){
        if(typeof squared === 'undefined') squared = false;
        if(squared == false){
            throw new Error("AgentSmithML.Metrics.euclidean_distances with option squared=false is not implemented");
        }

        // If vectors are given, convert them to matrices
        if (typeof X.cols === 'undefined') {
            X = $M.fromArray([$M.toArray(X)]);
        }
        if (typeof Y.cols === 'undefined') {
            Y = $M.fromArray([$M.toArray(Y)]);
        }

        XX = AgentSmithML.Metrics.Pairwise.row_norms(X, true);
        YY = AgentSmithML.Metrics.Pairwise.row_norms(Y, true);
        var distances = $M.mul(X, Y.t());
        distances = distances.times(-2);
        distances = $M.add(distances, XX)
        distances = $M.add(distances, YY.t())
        return distances
    },

    row_norms : function(X, squared){
        if (typeof squared === 'undefined') squared = false;
        var norms = $M.sumEachRow($M.mulEach(X, X));
        if(squared == false){
            //throw new Error("AgentSmithML.Metrics.row_norms with option squared=false is not implemented");
	    norms = norms.map(Math.sqrt());
        }
        return norms
    }
};

