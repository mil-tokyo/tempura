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
		require('./cross_decomposition');
		require('../utils/statistics');
    }

    var $S = Tempura.Utils.Statistics;

    // http://nalab.mind.meiji.ac.jp/~mk/labo/text/generalized-eigenvalue-problem.pdf
    // http://case.f7.ems.okayama-u.ac.jp/statedu/hbw2-book/node82.html
    function cca(X, Y){
	var X_features = X.cols;
	var Y_features = Y.cols;
	if(X_features > Y_features){
	    throw new Error("X_features should be greater than Y_features");
	}

	var covs = $S.cov($M.hstack([X, Y]), false);
	var cov11 = $M.extract(covs, 0, 0, X_features, X_features);
	var cov12 = $M.extract(covs, 0, X_features, X_features, Y_features);
	var cov21 = cov12.t();
	var cov22 = $M.extract(covs, X_features, X_features, Y_features, Y_features);

	var R11 = $S.chomskyDecomposition(cov11);
	var R22 = $S.chomskyDecomposition(cov22);

	var svd_results_A = $M.svd($M.mul($M.mul(R11.inverse(), cov12), R22.t().inverse()).t());
	var lambda = svd_results_A.S;

	var A = $M.mul(R11.t().inverse(), svd_results_A.V);
	var B = $M.mul(cov22.inverse(), $M.mul(cov21, $M.divEach(A, lambda)));

	return { U : A, V : B, lambda : lambda }
    }

    Tempura.CrossDecomposition.CCA = function(n_components, scale) {
	this.n_components = typeof n_components === "undefined" ? 2 : n_components;
	this.scale = typeof scale === "undefined" ? true : scale;
    };

    Tempura.CrossDecomposition.CCA.prototype.fit = function(X, Y){
	if(this.n_components > Math.min(X.cols, Y.cols)){
	    throw new Error("n_components should be smaller than the number of features.");
	}

	if(X.rows != Y.rows){
	    throw new Error("the number of samples in X and Y should be the same.");
	}

	if(this.scale){
	    var X_meanStd = $S.meanStd(true, true, X, false, 1);
	    X = X_meanStd.X;
	    this.X_mean = X_meanStd.X_mean;
	    this.X_std = X_meanStd.X_std;

	    var Y_meanStd = $S.meanStd(true, true, Y, false, 1);
	    Y = Y_meanStd.X;
	    this.Y_mean = Y_meanStd.X_mean;
	    this.Y_std = Y_meanStd.X_std;
	}

	if(X.cols < Y.cols){
	    var cca_results = cca(X, Y);
	    this.X_projection = $M.extract(cca_results.U, 0, 0, X.cols, this.n_components);
	    this.Y_projection = $M.extract(cca_results.V, 0, 0, Y.cols, this.n_components);
	}
	else{
	    var cca_results = cca(Y, X);
	    this.X_projection = $M.extract(cca_results.V, 0, 0, X.cols, this.n_components);
	    this.Y_projection = $M.extract(cca_results.U, 0, 0, Y.cols, this.n_components);
	}
	return this;
    }

    Tempura.CrossDecomposition.CCA.prototype.transform = function(X, Y){
	if(X.rows != Y.rows){
	    throw new Error("the number of samples in X and Y should be the same.");
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
	return {X_score : X_score, Y_score : Y_score};
    }
})(typeof window === 'undefined', Sushi.Matrix, Tempura);
