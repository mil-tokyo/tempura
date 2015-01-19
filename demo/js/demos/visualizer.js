AgentSmithDemo.addDemo('Visualizer demo',
'In this demo, sine curves are drawn in several ways by visualize tool "Trinity"',
function(){
	$M = AgentSmith.Matrix;
	
	var x_min = -10;
	var x_max = 10;
	var step = 0.1;

	// Sine data
	var x = new $M((x_max-x_min)/step, 1);
	x.setEach(function(i){
	    return x_min + i*step;
	});
	var y = x.clone();
	y.map(function(d){
	    return Math.sin(d);
	});

	// plot
	var plt = new Trinity('#content');

	var options = ['r-', 'b-.', 'k:', 'g--', 'co', 'mo-'];

	for (var i=0 ; i<6 ; i++) {
	    plt.plot(x,y,options[i]);
	    x.map(function(d){ return d+0.5; });
	}
	
	plt.xlim([-5, 5]);
	plt.show();
});