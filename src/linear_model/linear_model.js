(function() {

	// namespace
	if (typeof AgentSmithML.LinearModel !== 'undefined') {
		return;
	}

	// node
	var nodejs = (typeof window === 'undefined');
	if (nodejs) {
		require('../agent_smith_ml');
	}
	AgentSmithML.LinearModel = function(){};

})();

var nodejs = (typeof window === 'undefined');
if (nodejs) {
	module.exports = AgentSmithML.LinearModel;
}