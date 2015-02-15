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
})(typeof window === 'undefined', AgentSmith.Matrix, Tempura);

