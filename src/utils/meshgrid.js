(function(nodejs, $M, Tempura){
	Tempura.Utils.meshgrid = function(xlist, ylist){
		var x_len = xlist.rows, y_len = ylist.rows;
		var mesh = new $M(x_len*y_len, 2);
		var i=0;
		for (var iy = 0; iy < ylist.length; iy++) {
			for (var ix = 0; ix < xlist.length ; ix++) {
				mesh.set(i,0,xlist.data[ix]);
				mesh.set(i,1,ylist.data[iy]);
				i++;
			}
		};

		return mesh;
	}
})(typeof window === 'undefined', AgentSmith.Matrix, Tempura);
