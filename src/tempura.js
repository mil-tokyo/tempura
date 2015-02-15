var Tempura = {};

if (typeof window === 'undefined') {
	(('global', eval)('this')).Tempura = Tempura;
	require('../agent_smith/src/agent_smith_cl')
	module.exports = Tempura;
}
