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
		require('./metrics');
	}

	Tempura.Metrics.Pairwise = {
		euclidean_distances : function (X, Y, squared){
		    if(typeof squared === 'undefined') squared = false;

		    // If vectors are given, convert them to matrices
		    if (typeof X.cols === 'undefined') {
			X = $M.fromArray([$M.toArray(X)]);
		    }
		    if (typeof Y.cols === 'undefined') {
			Y = $M.fromArray([$M.toArray(Y)]);
		    }

		    var XX = Tempura.Metrics.Pairwise.row_norms(X, true);
		    var YY = Tempura.Metrics.Pairwise.row_norms(Y, true);
		    var distances = $M.mul(X, Y.t());
		    distances.times(-2);
		    distances = $M.add(distances, XX)
		    distances = $M.add(distances, YY.t())
		    distances.map(function max0(x){return Math.max(x,0);})

		    if(squared == false){
			distances = distances.map(Math.sqrt);
			//throw new Error("Tempura.Metrics.euclidean_distances with option squared=false is not implemented");
		    }
		    return distances
		},

		row_norms : function(X, squared){
			if (typeof squared === 'undefined') squared = false;
			var norms = $M.sumEachRow($M.mulEach(X, X));
			if(squared == false){
				//throw new Error("Tempura.Metrics.row_norms with option squared=false is not implemented");
			norms = norms.map(Math.sqrt);
			}
			return norms
		},

		col_norms : function(X, squared){
			if (typeof squared === 'undefined') squared = false;
			var norms = $M.sumEachCol($M.mulEach(X, X));
			if(squared == false){
				//throw new Error("Tempura.Metrics.row_norms with option squared=false is not implemented");
			norms = norms.map(Math.sqrt);
			}
			return norms
		}


	};
})(typeof window === 'undefined', Sushi.Matrix, Tempura);
