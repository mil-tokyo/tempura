(function($M){
	AgentSmithDemo.addDemo('GMM',
	'In this demo, data points are given which are sampled from some probabilistic distribution and Gaussian Mixtures are estimated for that by EM algorithm',
	{
		X: {
			shape: [2, 'n_data'],
			init: $M.fromArray([
					[1, 1],
					[0, 1],
					[1, 1],
					[1, 2],
					[-1, -2],
					[1, 0.1],
					[2, 2],
					[1, 2],
					[9, 7],
					[13, 10],
					[10, 7],
					[10, 8],
				])
		}
	},
	function(plt, args){
		var gmm = new Neo.Mixture.GMM(2, 100, 0.0000001);
		var X = args.X;

		// Estimate GMM
		gmm.fit(X);

		// Plot
		var x = $M.getCol(X,0);
		var y = $M.getCol(X,1);

		var covars_inv = new Array(gmm.covars.length);
		var covars_det = new Array(gmm.covars.length);
		for (var i=0 ; i<gmm.covars.length ; i++) {
			covars_det[i] = gmm.covars[i].det();
			covars_inv[i] = gmm.covars[i].inverse();
		}

		// Contour levels to show
		var levels = [];
		for (var level = 0.01 ; level < 0.2 ; level += 0.03) {
			levels.push(level);
		}

		plt.contourDesicionFunction(-2, 15, -3, 12, {levels: levels}, function(x,y){
			var datum = $M.fromArray([[x],[y]]);
			var zs = new Array(gmm.covars.length);
			for (var i=0 ; i<gmm.covars.length ; i++) {
				var mean = gmm.means[i];
				var x_sub_mean = datum.sub(mean);
				var covar_inv = covars_inv[i];
				zs[i] = Math.exp( x_sub_mean.t().mul(covar_inv).mul(x_sub_mean).get(0,0) / (-2)) / (2*Math.PI*covars_det[i]);  // Gaussian distribution
			}

			var ret = 0;
			for (var i=0 ; i<gmm.covars.length ; i++) {
				ret += gmm.weights.get(0,i) * zs[i];
			}

			return ret;
		});

		plt.scatter(x,y);
		plt.xlabel('x');
		plt.ylabel('y');
		plt.show();

	});
})(AgentSmith.Matrix);

