(function($M){
	AgentSmithDemo.addDemo('Nearest neighbor classifier',
		'A classifier based on nearest neighbor', {
			X: {
				type: 'matrix',
				shape: [2, 'n_data'],
				init: $M.fromArray([
						[10, 22],
						[11, 12],
						[15, 14],
						[17, 12],
						[20, 10],

						[20, 20],
						[21, 22],
						[15, 20],
						[17, 14],
						[20, 12]
					])
			},
			labels: {
				type: 'matrix',
				shape: [1, 'n_data'],
				init: $M.fromArray([[1,1,1,1,1,2,2,2,2,2]])
			},
			k: {
				type: 'integer',
				init: 1
			}
		},
		function(plt, args){
			var samples = args.X;
			var labels = args.labels;
			var k = args.k;

			// Fit classifier
			var clf = new Neo.Neighbors.KNeighborsClassifier({n_neighbors: k});
			clf.fit(samples, labels);

			// Plot samples
			var x = $M.getCol(samples,0);
			var y = $M.getCol(samples,1);
			var color = labels.t();
			plt.scatter(x,y,color);

			// Draw line
			plt.contourDesicionFunction(10, 22, 10, 22, {levels: [1.5]}, function(x,y){
				return clf.predict($M.fromArray([[x,y]])).get(0,0);
			});
			plt.xlabel('x');
			plt.ylabel('y');
			plt.legend(['Data points (2 classes)']);
			plt.show();
		});
})(AgentSmith.Matrix);