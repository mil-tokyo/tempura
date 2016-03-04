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
	}

	Tempura.Neighbors.NearestNeighbors = function(args) {
		if (typeof args === 'undefined') args = {};
		this.n_neighbors = typeof args.n_neighbors === 'undefined' ? 5	  : args.n_neighbors;
		this.radius	  = typeof args.radius	  === 'undefined' ? 1.0	: args.radius;
		this.algorithm   = typeof args.algorithm   === 'undefined' ? 'auto' : args.algorithm;
		this.leaf_size   = typeof args.leaf_size   === 'undefined' ? 30	 : args.leaf_size;
	}

	Tempura.Neighbors.NearestNeighbors.prototype.fit = function(X, y) {
		if (typeof X === 'undefined') throw new Error('X must be set');
		if (!(X instanceof $M)) throw new TypeError('X must be an instance of Sushi.Matrix');
		this._fit_X = X;
		this.y = typeof y === 'undefined' ? null : y;

		this._fit_method = this.algorithm;

		// TODO
		if (this._fit_method === 'auto') {
			this._fit_method = 'brute';
		}

		return this;
	}

	Tempura.Neighbors.NearestNeighbors.prototype.kneighbors = function(X, args) {
		if (!(X instanceof $M)) throw new TypeError('X must be an instance of Sushi.Matrix');

		if (typeof args === 'undefined') args = {};
		if (typeof args.n_neighbors === 'undefined') args.n_neighbors = this.n_neighbors;
		if (typeof args.return_distance === 'undefined') args.return_distance = true;

		if (this._fit_method === 'brute') {
			dist = Tempura.Metrics.Pairwise.euclidean_distances(X, this._fit_X, true); // TODO: Remove the restrict of metrics (euclidean_distances() is only supported now) and select metric dynamically

			// initialize indices arrays
			var indices = new Array(dist.rows);
			for (var row=0 ; row<dist.rows ; row++){
				indices[row] = new Array(dist.cols);
				for (var i=0 ; i<dist.cols ; i++){
					indices[row][i] = i;
				}
			}

			// sort
			for (var row=0 ; row<dist.rows ; row++){
				indices[row].sort(function(v1, v2){
					return dist.get(row,v1) - dist.get(row,v2);
				});
				indices[row] = indices[row].slice(0, args.n_neighbors);
			}

			if (args.return_distance) {
				var distances = new Array(dist.rows);
				for (var row=0 ; row<dist.rows ; row++){
					distances[row] = new Array(args.n_neighbors);
					for (var i=0; i<args.n_neighbors ; i++){
						distances[row][i] = Math.sqrt(dist.get(row,indices[row][i]));
					}
				}
				return [$M.fromArray(distances), $M.fromArray(indices)];
			} else {
				return $M.fromArray(indices);
			}
		} else {
			throw new Error('Invalid algorithm specified');
		}

	}

	Tempura.Neighbors.NearestNeighbors.prototype.radius_neighbors = function(X, radius, return_distance) {
		if (!(X instanceof $M)) throw new TypeError('X must be an instance of Sushi.Matrix');
		if (typeof radius === 'undefined') radius = this.radius;
		if (typeof return_distance === 'undefined') return_distance = true;

		throw new Error('Not implemented');
		if (this._fit_method === 'brute') {
			dist = Tempura.Metrics.Pairwise.euclidean_distances(X, this._fit_X, true); // TODO: Remove the restrict of metrics (euclidean_distances() is only supported now) and select metric dynamically

			// select indices whose distances are smaller than radius
			for (var row=0 ; row<dist.rows ; row++){
				for (var col=0 ; col<dist.cols ; col++){
					if (dist.get(row,col) < radius){

					}
				}
			}
		} else {
			throw new Error('Invalid algorithm specified');
		}
	}
})(typeof window === 'undefined', Sushi.Matrix, Tempura);
