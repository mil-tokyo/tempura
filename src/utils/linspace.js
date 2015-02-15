(function(nodejs, $M, Tempura){
	Tempura.Utils.linspace = function(start, end, args){
		if (typeof args === 'undefined') args = {};
		var num        = typeof args.num      === 'undefined' ? 50      : args.num;
		var endpoint   = typeof args.endpoint === 'undefined' ? true    : args.endpoint;

		var range = end-start;
		var ret = new $M(num, 1);
		var num_ = endpoint ? num-1 : num;

		for (var i=0; i < num; i++){
			ret.set(i,0, start + range * i / num_);
		}

		return ret;
	}
})(typeof window === 'undefined', AgentSmith.Matrix, Tempura);
