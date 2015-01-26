(function($M){
	AgentSmithDemo.addDemo('SGDRegressor',
	'A kind of linear classifier',
	{
		X: {
			shape: [2, 'n_data'],
			default: $M.fromArray([
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
			shape: [1, 'n_data'],
			default: $M.fromArray([
					[1, 0],
					[0, 1],
					[1, 0],
					[1, 0],
					[1, 0],
					[1, 0],
					[1, 0],
					[0, 1],
					[0, 1],
					[1, 0],
					[0, 1],
					[0, 1],
					[0, 1],
					[1, 0],
					[0, 1],
					[0, 1],
					[0, 1],
					[0, 1],
					[1, 0],
					[1, 0]
				])
		}
	},
	function(plt, args){
		var $S = Neo.Utils.Statistics;

		var samples = args.X;
		var labels = args.labels;

		// fit neo
		var per = new Neo.LinearModel.SGDRegressor({algorithm:'perceptron',aver:false,lambda:0.0});
		var svm = new Neo.LinearModel.SGDRegressor({algorithm:'sgdsvm'});
		per.fit(samples,labels);
		svm.fit(samples,labels);
		// weight output
		var w = svm.weight;
		w.print();
		console.log( 'gradient' ); var grad = - w.get(0,0) / w.get(1,0); console.log( grad );
		console.log( 'intercept' ); var inter = - w.get(2,0) / w.get(1,0); console.log( inter );
		
		// sample
		var meanStd = $S.meanStd( true, true, samples, false, 1);
		var x = $M.getCol(meanStd.X,0);
		var y = $M.getCol(meanStd.X,1);
		var color = $M.fromArray([[0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0]]).t();
		// line 1
		var w1=per.weight.get(0,0), w2=per.weight.get(1,0), b=per.weight.get(2,0);
		var p_line_x = new $M(60, 1);
		p_line_x.setEach(function(i){ return -2 + i*0.1; });
		var p_line_y = p_line_x.clone();
		p_line_y.map(function(x) { return -w1/w2*x-b/w2;});
		// line 2
		var w1=svm.weight.get(0,0), w2=svm.weight.get(1,0), b=svm.weight.get(2,0);
		var s_line_x = new $M(60, 1);
		s_line_x.setEach(function(i){ return -2 + i*0.1; });
		var s_line_y = s_line_x.clone();
		s_line_y.map(function(x) { return -w1/w2*x-b/w2;});
		// draw
		plt.scatter(x,y,color);
		plt.plot(s_line_x, s_line_y, 'r-');
		plt.plot(p_line_x, p_line_y, 'b-');
		plt.show();
	});
})(AgentSmith.Matrix);

