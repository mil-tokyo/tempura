var nodejs = (typeof window === 'undefined');

if (nodejs) {
    var AgentSmith = require('../../agent_smith/src/agent_smith');
    var AgentSmithML = require('../agent_smith_ml');
    require('./cross_decomposition');
}

var $M = AgentSmith.Matrix;
var $S = AgentSmithML.Utils.Statistics

function cca(X, Y){
    var X_features = X.cols;
    var Y_features = Y.cols;
    if(X_features > Y_features){
	throw new Error("X_features should be greater than Y_features");
    }

    var covs = $S.cov($M.hstack([X, Y]));
    var cov11 = $M.extract(covs, 0, 0, X_features, X_features);
    var cov12 = $M.extract(covs, 0, X_features, X_features, Y_features);
    var cov21 = cov12.t();
    var cov22 = $M.extract(covs, X_features, X_features, Y_features, Y_features);

    var svd_results = $M.svd($M.mul($M.mul(cov11.inverse(), cov12), $M.mul(cov22.inverse(), cov21)))
    var eigen_value = svd_results.S;
    var lambda = $S.sqrt(eigen_value)
    var inv_lambda = $M.diag($S.frac(lambda))
    var A = svd_results.V;
    var B = $M.mul(cov22.inverse(), $M.mul(cov21, $M.mul(inv_lambda, A)))

    return { U : A, V : B, lambda : lambda }
}

AgentSmithML.CrossDecomposition.CCA = function(n_components, scale) {
    this.n_components = typeof n_components === "undefined" ? 2 : n_components;
    this.scale = typeof scale === "undefined" ? true : scale;
};

AgentSmithML.CrossDecomposition.CCA.prototype.fit = function(X, Y){
    if(this.n_components > Math.min(X.cols, Y.cols)){
	throw new Error("n_components should be smaller than the number of features.");
    }

    if(X.rows != Y.rows){
	throw new Error("the number of samples in X and Y should be the same.")
    }

    if(this.scale){
	var X_meanStd = $S.meanStd(true, true, X)
	X = X_meanStd.X
	this.X_mean = X_meanStd.X_mean
	this.X_std = X_meanStd.X_std

	var Y_meanStd = $S.meanStd(true, true, Y)
	Y = Y_meanStd.X
	this.Y_mean = Y_meanStd.X_mean
	this.Y_std = Y_meanStd.X_std

    }

    if(X.cols < Y.cols){
	cca_results = cca(X, Y);
	this.X_projection = $M.extract(cca_results.U, 0, 0, X.cols, this.n_components);
	this.Y_projection = $M.extract(cca_results.V, 0, 0, Y.cols, this.n_components);
    }
    else{
	cca_results = cca(Y, X);
	this.X_projection = $M.extract(cca_results.V, 0, 0, X.cols, this.n_components);
	this.Y_projection = $M.extract(cca_results.U, 0, 0, Y.cols, this.n_components);
    }
    return this
}

AgentSmithML.CrossDecomposition.CCA.prototype.transform = function(X, Y){	
    if(X.rows != Y.rows){
	throw new Error("the number of samples in X and Y should be the same.")
    }

    if(X.cols != this.X_projection.rows || Y.cols != this.Y_projection.rows){
	throw new Error("dimension of data is different from projection matrix");
    }
	
    if(this.scale){
	X = $M.divEach($M.sub(X, this.X_mean), this.X_std);
	Y = $M.divEach($M.sub(Y, this.Y_mean), this.Y_std);
    }
    var X_score = $M.mul(X, this.X_projection);
    var Y_score = $M.mul(Y, this.Y_projection);
    return {X_score : X_score, Y_score : Y_score}
}
