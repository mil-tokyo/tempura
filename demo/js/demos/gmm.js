(function($M){
	SushiDemo.addDemo('GMM',
	'In this demo, data points are given which are sampled from some probabilistic distribution and Gaussian Mixtures are estimated for that by EM algorithm',
	{
		X: {
			shape: [2, 'n_data'],
			init: $M.fromArray([
				[1,1],
				[0,1],
				[1,1],
				[1,2],
				[-1,-2],
				[1,0],
				[2,2],
				[1,2],
				[3,3],
				[6,6],
				[4,3],
				[4,4]
				])
		}
	},
	function(plt, args){
		var X = args.X;

		// Estimate GMM
		var gmm = new Tempura.Mixture.GMM(2, 100, 0.0000001);
		gmm.fit(X);

		// Plot data points
		var x = $M.getCol(X,0);
		var y = $M.getCol(X,1);
		plt.scatter(x,y);

		// Plot Gaussian Mixtures
		plt.contourDesicionFunction($M.min(x)-1, $M.max(x)+1, $M.min(y)-1, $M.max(y)+1, function(x,y){
			var datum = $M.fromArray([[x,y]]);
			return gmm.score(datum).get(0,0);
		});

		// Labels and colorbar
		plt.xlabel('x');
		plt.ylabel('y');
		plt.colorbar();
		plt.show();
	});
})(Sushi.Matrix);

