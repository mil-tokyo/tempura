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

(function(nodejs, $M, Tempura) {
	if (nodejs) {
		require('./neighbors.js');
		require('./nearest_neighbors.js');
	}

	Tempura.Neighbors.KNeighborsClassifier = function(args) {
		if (typeof args === 'undefined') args = {};

		Tempura.Neighbors.NearestNeighbors.apply(this);

		this.n_neighbors = typeof args.n_neighbors === 'undefined' ? 5		 : args.n_neighbors;
		this.algorithm   = typeof args.algorithm   === 'undefined' ? 'auto'	: args.algorithm;
		this.leaf_size   = typeof args.leaf_size   === 'undefined' ? 30	 : args.leaf_size;
		this.weights	 = typeof args.weights	 === 'undefined' ? 'uniform' : args.weights;
	}

	Tempura.Neighbors.KNeighborsClassifier.prototype = Object.create(Tempura.Neighbors.NearestNeighbors.prototype, {
		constructor: {
			value: Tempura.Neighbors.KNeighborsClassifier,
			enumerabule: false,
			writable: true,
			configurable: true
		}
	});

	Tempura.Neighbors.KNeighborsClassifier.prototype.fit = function(X, y) {
		if (typeof X === 'undefined') throw new Error('X must be set');
		if (!(X instanceof $M)) throw new TypeError('X must be an instance of Sushi.Matrix');
		if (typeof y === 'undefined') throw new Error('y must be set');
		if (!(y instanceof $M)) throw new TypeError('y must be an instance of Sushi.Matrix');
		this._fit_X = X;
		this.y = y;

		this._fit_method = this.algorithm;

		// TODO
		if (this._fit_method === 'auto') {
			this._fit_method = 'brute';
		}

		return this;
	}

	Tempura.Neighbors.KNeighborsClassifier.prototype.predict = function(X) {
		var neigh = this.kneighbors(X);
		var weights = this._get_weights(neigh[0], this.weights);

		var sum = new $M(X.rows, $M.max(this.y)+1);
		var y = this.y;
		neigh[1].forEach(function(sample_id,k){
			var neigh_ind = neigh[1].get(sample_id,k);
			var class_id = y.get(0,neigh_ind);
			sum.set(sample_id, class_id, sum.get(sample_id, class_id)+weights.get(sample_id, k));
		});

		var res = $M.argmaxEachRow(sum);
		return res;
	}

	Tempura.Neighbors.KNeighborsClassifier.prototype._get_weights = function(dist, weights) {
		var ones = (new $M(dist.rows, dist.cols)).setEach(function(){ return 1;});
		if (weights === 'uniform' || weights === null || typeof weights === 'undefined') {
			return ones;
	//		return null;
		} else if (weights === 'distance') {
			return ones.divEach(dist);
		} else {
			throw TypeError('Unsupported weight type: ' + weights);
		}
	}
})(typeof window === 'undefined', Sushi.Matrix, Tempura);
