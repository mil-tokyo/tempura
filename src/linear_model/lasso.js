var nodejs = (typeof window === 'undefined');

if (nodejs) {
	var AgentSmithML = require('../agent_smith_ml');
	require('./linear_model');
}

AgentSmithML.LinearModel.Lasso = function(alpha) {
	this.alpha = alpha;
}

AgentSmithML.LinearModel.Lasso.prototype.fit = function(X, y) {
	
};