var nodejs = (typeof window === 'undefined');

if (nodejs) {
    var AgentSmith = require('../../agent_smith/src/agent_smith');
    var AgentSmithML = require('../agent_smith_ml');
    require('./cross_decomposition');
}

var $M = AgentSmith.Matrix;

AgentSmithML.CrossDecomposition.CCA = function(n_components, n_iter, thresh, min_covar) {
    this.n_components = typeof n_components === "undefined" ? 1 : n_components;
    this.n_iter = typeof n_iter === "undefined" ? 100 : n_iter;
    this.thresh = typeof thresh === "undefined" ? 0.01 : thresh;
    this.min_covar = typeof min_covar === "undefined" ? 0.001 : min_covar;
};

AgentSmithML.Mixture.GMM.prototype.fit = function(X, Y){
    var n_samples = X.rows;
    var n_features = X.cols;
}

