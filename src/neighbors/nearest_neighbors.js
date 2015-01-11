var nodejs = (typeof window === 'undefined');

if (nodejs) {
    var AgentSmithML = require('../agent_smith_ml');
    require('./neighbors.js');
}

var $M = AgentSmith.Matrix;

AgentSmithML.Neighbors.NearestNeighbors = function(n_neighbors, radius, algorithm, leaf_size) {
    this.options = {};
    this.options.n_neighbors = typeof n_neighbors === 'undefined' ? 5      : n_neighbors;
    this.options.radius      = typeof radius      === 'undefined' ? 1.0    : radius;
    this.options.algorithm   = typeof algorithm   === 'undefined' ? 'auto' : algorithm;
    this.options.leaf_size   = typeof leaf_size   === 'undefined' ? 30     : leaf_size;
}

AgentSmithML.Neighbors.NearestNeighbors.prototype.fit = function(X, y) {
    if (typeof X === 'undefined') throw new Error('X must be set');
    if (!(X instanceof $M)) throw new TypeError('X must be an instance of AgentSmith.Matrix');
    this.X = X;
    this.y = typeof y === 'undefined' ? null : y;

    this._fit_method = this.options.algorithm;

    // TODO
    if (this._fit_method === 'auto') {
        this._fit_method = 'brute';
    }

    return this.options;
}

AgentSmithML.Neighbors.NearestNeighbors.prototype.kneighbors = function(X) {
    if (!(X instanceof $M)) throw new TypeError('X must be an instance of AgentSmith.Matrix');

    if (this._fit_method === 'brute') {
        

    } else {
        throw new Error('Invalid algorithm specified');
    }

    return $M.fromArray([[2],[0]]);
}

AgentSmithML.Neighbors.NearestNeighbors.prototype.radius_neighbors = function(X) {
    if (!(X instanceof $M)) throw new TypeError('X must be an instance of AgentSmith.Matrix');
    return $M.fromArray([[2]]);
}