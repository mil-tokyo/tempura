var nodejs = (typeof window === 'undefined');

if (nodejs) {
    var AgentSmithML = require('../agent_smith_ml');
    require('./neighbors.js');
    require('./nearest_neighbors.js');
}

var $M = AgentSmith.Matrix;

AgentSmithML.Neighbors.KNeighborsClassifier = function(args) {
    if (typeof args === 'undefined') args = {};
    this.n_neighbors = typeof args.n_neighbors === 'undefined' ? 5         : args.n_neighbors;
    this.weights     = typeof args.weights     === 'undefined' ? 'uniform' : args.weights;
    this.algorithm   = typeof args.algorithm   === 'undefined' ? 'auto'    : args.algorithm;
}

AgentSmithML.Neighbors.KNeighborsClassifier.prototype = {
    fit : function(X, y) {
        if (typeof X === 'undefined') throw new Error('X must be set');
        if (!(X instanceof $M)) throw new TypeError('X must be an instance of AgentSmith.Matrix');
        this._fit_X = X;
        this.y = typeof y === 'undefined' ? null : y;

        this._fit_method = this.algorithm;

        // TODO
        if (this._fit_method === 'auto') {
            this._fit_method = 'brute';
        }

        return this;
    },
    predict : function(X) {

    }
};