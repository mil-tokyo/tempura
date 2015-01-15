var nodejs = (typeof window === 'undefined');

if (nodejs) {
    var AgentSmith = require('../../agent_smith/src/agent_smith');
    var AgentSmithML = require('../agent_smith_ml');
    require('./decomposition');
}

var $M = AgentSmith.Matrix;

AgentSmithML.Decomposition.PCA = function(n_components, copy, whiten) {
    this.n_components = typeof n_components === "undefined" ? 1.0 : n_components;
    this.copy = typeof copy === "undefined" ? false : copy
    this.whiten = typeof whiten === "undefined" ? false : whiten
    };

AgentSmithML.Decomposition.PCA.prototype.fit = function(X){
    var n_samples = X.rows;
    var n_features = X.cols;
    this.mean_ = $M.sumEachCol(X).times(1.0 / n_samples);
    this.mean_ = this.mean_.toRowWise();
    X = $M.sub(X, this.mean_);
    X = X.toRowWise();
    var svd_results = $M.svd(X);
    var U = svd_results['U'];
    var S = svd_results['S'];
    var V = svd_results['V'].t();
    var explained_variance_ = $M.mulEach(S, S).times( 1.0 / n_samples );
    var explained_variance_ratio_ = explained_variance_.times( 1.0 / $M.sum(explained_variance_));
    if(this.whiten == true){
	var components_ = $M.divEach( V,  S.t().times( 1.0 / Math.sqrt(n_samples)) );
    }
    else{
        var components_ = V;
    }

    var n_components = this.n_components;
    if( isNaN(n_components) ){
	n_components = n_features;
    }
    else if( n_components == "mle" ){
	if( n_samples < n_features ){
	    throw new Error("n_components='mle' is only supported if n_samples >= n_features");
	}
	throw new Error("'mle' is not supported")
        n_components = _infer_dimension_(explained_variance_, n_samples, n_features);
    }
    else if(n_components < 0 || n_components > n_features){
        throw new ValueError("n_components=" + n_components + "invalid for n_features=" + n_features);
    }

    if(0 < n_components &&  n_components <= 1.0){
	var ratio_cumsum = 0;
	var components_ratio = n_components;
	n_components = 0;
	for(var i=0; i<explained_variance_ratio_.length; i++){
	    n_components += 1;
	    ratio_cumsum += explained_variance_ratio_.data[i];
	    if(ratio_cumsum > components_ratio){
		break
	    }
	}
    }

    if(n_components < n_features){
	var noise_variance_ = $M.extract(explained_variance_, 0, n_components, 0, explained_variance_.cols - n_components);
	this.noise_variance_ = $M.sumEachCol(noise_variance_).times( 1.0 / noise_variance_.rows)
    }
    else{
	this.noise_variance_ = 0;
    }
    
    this.n_samples_ = n_samples;
    this.components_ = $M.extract(components_, 0, 0, n_components, components_.cols); 
    this.explained_variance_ = $M.extract(explained_variance_, 0, 0, n_components, explained_variance_.cols);
    this.explained_variance_ratio_ = $M.extract(explained_variance_ratio_, 0, 0, n_components, explained_variance_ratio_.cols);
    this.n_components_ = n_components
}

AgentSmithML.Decomposition.PCA.prototype.transform = function(X){
    if(typeof this.mean_ !== "undefined"){
        X = $M.sub(X,this.mean_);
    }

    X = $M.mul(X, this.components_.t())
    return X
}


function _infer_dimension_(explained_variance_, n_samples, n_features){
    throw new Error("not implemented");
}


