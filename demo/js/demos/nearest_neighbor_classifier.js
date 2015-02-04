(function($M){
	AgentSmithDemo.addDemo('Nearest neighbor classifier',
		'A classifier based on nearest neighbor', {
			X: {
				type: 'matrix',
				shape: [2, 'n_data'],
				init: $M.fromArray([
					[ 5.1,  3.5],
					[ 4.9,  3. ],
					[ 4.7,  3.2],
					[ 4.6,  3.1],
					[ 5. ,  3.6],
					[ 5.4,  3.9],
					[ 4.6,  3.4],
					[ 5. ,  3.4],
					[ 4.4,  2.9],
					[ 4.9,  3.1],

					[ 7. ,  3.2],
					[ 6.4,  3.2],
					[ 6.9,  3.1],
					[ 5.5,  2.3],
					[ 6.5,  2.8],
					[ 5.7,  2.8],
					[ 6.3,  3.3],
					[ 4.9,  2.4],
					[ 6.6,  2.9],
					[ 5.2,  2.7]
					])
			},
			labels: {
				type: 'matrix',
				shape: [1, 'n_data'],
				init: $M.fromArray([[1,1,1,1,1,1,1,1,1,1, 2,2,2,2,2,2,2,2,2,2]])
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
			plt.contourDesicionFunction($M.min(x)-1, $M.max(x)+1, $M.min(y)-1, $M.max(y)+1, {levels: [1.5]}, function(x,y){
				return clf.predict($M.fromArray([[x,y]])).get(0,0);
			});
			plt.xlabel('x');
			plt.ylabel('y');
			plt.legend(['Data points (2 classes)']);
			plt.show();
		});
})(AgentSmith.Matrix);