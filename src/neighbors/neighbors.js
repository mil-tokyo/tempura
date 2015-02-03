(function(nodejs, $M, Neo) {
	if (nodejs) {
		var Neo = require('../neo');
	}
	
	Neo.Neighbors = {};
})(typeof window === 'undefined', AgentSmith.Matrix, Neo);