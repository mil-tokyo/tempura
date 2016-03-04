(function($M) {
	SushiDemo.addDemo('Perceptron', 'A kind of linear classifier', {
		X: {
			shape: [2, 'n_sample'],
			description: "Data points",
			init: $M.fromArray([
					[ 1.4949318 ,  3.85848832],
					[ 1.42613574,  0.0456529 ],
					[ 1.1641107 ,  3.79132988],
					[ 1.54632313,  4.212973  ],
					[ 2.09680487,  3.7174206 ],
					[ 1.24258802,  4.50399192],
					[ 0.91433877,  4.55014643],
					[ 2.14823598,  1.12456117],
					[ 3.4171203 ,  0.02504426],
					[-0.55552381,  4.69595848],
					[ 2.08272263,  0.78535335],
					[ 1.52259607, -0.29081422],
					[ 2.97493505,  1.77927892],
					[ 1.06269622,  5.17635143],
					[ 1.82287143,  0.71628201],
					[ 2.79344193,  1.61909157],
					[ 1.84652023,  0.99147304],
					[ 1.03150541,  2.0681289 ],
					[ 1.87271752,  4.18069237],
					[ 1.43289271,  4.37679234]
				])
		},
		labels: {
			shape: [1, 'n_sample'],
			description: "Labels to which each data point is assigned",
			init: $M.fromArray([[0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0]])
		}
	}, function(plt, args){
		// Prepare data
		var samples = args.X;
		var labels = args.labels;

		// Learn perceptron
		var perceptron = new Tempura.LinearModel.OnlineLearning.Perceptron({center:true});
		perceptron.fit(samples,labels.t());
		perceptron.weight.print();

		// Plot
		var x = $M.getCol(samples,0);
		var y = $M.getCol(samples,1);
		var color = labels.t();
		plt.scatter(x,y,color);

		plt.contourDesicionFunction(-2, 4, 1, 4, {levels: [0], colors: 'b'}, function(x,y){
			return perceptron.decisionFunction($M.fromArray([[x,y]])).get(0,0);
		});

		plt.xlabel('x');
		plt.ylabel('y');
		plt.legend(['Data points (2 classes)', 'Decision boundary']);
		plt.show();
	});
})(Sushi.Matrix);
