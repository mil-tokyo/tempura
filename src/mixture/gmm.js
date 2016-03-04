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
		require('./mixture');
    }


    Tempura.Mixture.GMM = function(n_components, n_iter, thresh, min_covar) {
	this.n_components = typeof n_components === "undefined" ? 1 : n_components;
	this.n_iter = typeof n_iter === "undefined" ? 100 : n_iter;
	this.thresh = typeof thresh === "undefined" ? 0.01 : thresh;
	this.min_covar = typeof min_covar === "undefined" ? 0.001 : min_covar;
    };

    Tempura.Mixture.GMM.prototype.fit = function(X){
	var n_samples = X.rows;
	var n_features = X.cols;

	this.initParams(X);
	var oldLogLikelihood = 0
	var newLogLikelihood = 0
	for(var i=0; i<this.n_iter; i++){
	var responsibility = this.expectationStep(X);
	    if($M.hasNaN(responsibility)){
		this.showParams();
		throw new Error("responsibility has NaN value")
	    }
	    this.maximizationStep(X, responsibility);
	    newLogLikelihood = this.calcLogLikelihood(X);
	    console.log("LogLikelihood : " + newLogLikelihood)
	    if(checkConvergnce(oldLogLikelihood, newLogLikelihood, this.thresh)){
		break;
	    }
	    oldLogLikelihood = newLogLikelihood;
	}
	this.showParams();
	return this;
    }

    Tempura.Mixture.GMM.prototype.score = function(X){
	var n_samples = X.rows;
	var n_features = X.cols;
	likelihood = (new $M(n_samples, 1)).zeros();
	for(var i=0; i<n_samples; i++){
	    var x = $M.extract(X, i, 0, 1, n_features).t()
	    likelihood.data[i] = 0;
	    for(var k=0; k<this.n_components; k++){
		likelihood.data[i] += getGaussProbability(this.weights.data[k], this.means[k], this.covars[k], x);
	    }
	}
	return likelihood
    };

    Tempura.Mixture.GMM.prototype.calcLogLikelihood = function(X){
	var n_samples = X.rows;
	var n_features = X.cols;
	var loglikelihood = 0;
	for(var i=0; i<n_samples; i++){
	    var x = $M.extract(X, i, 0, 1, n_features).t()
	    var likelihood = 0;
	    for(var k=0; k<this.n_components; k++){
		//likelihood.data[k] += getGaussProbability(this.weights.data[k], this.means[k], this.covars[k], x);
		likelihood += getGaussProbability(this.weights.data[k], this.means[k], this.covars[k], x);
	    }
	    loglikelihood -= Math.log(likelihood);
	}
	return loglikelihood
    }

    Tempura.Mixture.GMM.prototype.expectationStep = function(X){
	var n_samples = X.rows;
	var n_features = X.cols;
	var responsibility = new $M(n_samples, this.n_components).zeros(0);

	for(var i=0; i<n_samples; i++){
	    var x = $M.extract(X, i, 0, 1, n_features).t();
	    for(var k=0; k<this.n_components; k++){
		var posterior = getGaussProbability(this.weights.data[k], this.means[k], this.covars[k], x);
		responsibility.set(i, k, posterior)
	    }
	}
	responsibility = $M.divEach(responsibility, $M.sumEachRow(responsibility))
	return responsibility
    }

    Tempura.Mixture.GMM.prototype.maximizationStep = function(X, responsibility){
	var _beta = Math.pow(0.1,12);
	var n_samples = X.rows;
	var n_features = X.cols;
	var Nk = $M.sumEachCol(responsibility);
	this.weights = Nk.clone().times( 1.0 / n_samples);

	for(var k=0; k<this.n_components; k++){
	    this.means[k].zeros()
	    this.covars[k].zeros()
	}

	for(var i=0; i<n_samples; i++){
	    var x = $M.extract(X, i, 0, 1, n_features).t();
	    for(var k=0; k<this.n_components; k++){
		this.means[k].add(x.clone().times(responsibility.get(i, k)))
	    }
	}

	for(var k=0; k<this.n_components; k++){
	    this.means[k].times( 1.0 / Nk.get(0, k));
	}

	for(var i=0; i<n_samples; i++){
	    var x = $M.extract(X, i, 0, 1, n_features).t();
	    for(var k=0; k<this.n_components; k++){
		var sub = $M.sub(x, this.means[k]);
		this.covars[k].add($M.mul(sub, sub.t()).times( responsibility.get(i, k) ))
	    }

	}

	for(var k=0; k<this.n_components; k++){
	    this.covars[k].times( 1.0 / Nk.data[k]);
	    this.covars[k].add($M.eye(n_features).times(_beta))
	}

    }

    Tempura.Mixture.GMM.prototype.initParams = function(X){
	var n_features = X.cols
	this.weights = new $M(1, this.n_components).zeros( 1.0 / this.n_components );
	this.means = [];
	this.covars = [];

	var kmeans = new Tempura.Cluster.Kmeans(this.n_components, "kmeans++");
	kmeans.fit(X)
	var init_means = kmeans.cluster_centers_;
	for(var k=0; k<this.n_components; k++){
	    var mean = $M.extract(init_means, k, 0, 1, n_features).t();
	    this.means.push(mean);
	    var covar = $M.add(Tempura.Utils.Statistics.cov(X), $M.eye(n_features).times(this.min_covar));
	    this.covars.push(covar);
	}
    }

    Tempura.Mixture.GMM.prototype.showParams= function(){
	for(var k=0; k<this.n_components; k++){
	    console.log("component " + k);
	    console.log("weight :" + this.weights.data[k])
	    console.log("mean : ");
	    this.means[k].print();
	    console.log("covariance : ");
	    this.covars[k].print();
	    console.log();
	}
    }

    function getGaussProbability(weight, mean, covar, x){
	var m = x.rows;
	var sub = $M.sub(x, mean);
	var normalization_term = 1.0 / (Math.pow(Math.sqrt(2*Math.PI), m)* Math.sqrt(covar.det()));
	var gauss = Math.exp( -0.5 * $M.mul($M.mul(sub.t(), covar.inverse()), sub).data[0] )
	return weight * normalization_term * gauss
    }

    function checkConvergnce(old_val, new_val, tol){
	if(Math.abs(old_val - new_val) < tol){
	    return true
	}
	return false
    }
})(typeof window === 'undefined', Sushi.Matrix, Tempura);
