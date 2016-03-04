// The MIT License (MIT)

// Copyright (c) 2014 Machine Intelligence Laboratory (The University of Tokyo)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

(function(nodejs, $M, Tempura){
    if (nodejs) {
    	require('./decomposition');
    }

    Tempura.Decomposition.PCA = function(n_components, whiten) {
	this.n_components = typeof n_components === "undefined" ? 1.0 : n_components;
	this.whiten = typeof whiten === "undefined" ? false : whiten
    };

    Tempura.Decomposition.PCA.prototype.fit = function(X){
	var n_samples = X.rows;
	var n_features = X.cols;
	this.mean_ = $M.sumEachCol(X).times(1.0 / n_samples).toRowWise();
	X = $M.sub(X, this.mean_).toRowWise();
	var svd_results = $M.svd(X);
	var U = svd_results.U;
	var S = svd_results.S;
	var V = svd_results.V.t();
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

    Tempura.Decomposition.PCA.prototype.transform = function(X){
	if(typeof this.mean_ !== "undefined"){
            X = $M.sub(X,this.mean_);
	}

	X = $M.mul(X, this.components_.t())
	return X;
    }


    function _infer_dimension_(explained_variance_, n_samples, n_features){
	throw new Error("not implemented");
    }

})(typeof window === 'undefined', Sushi.Matrix, Tempura);
