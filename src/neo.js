var Neo = {};

if (typeof window === 'undefined') {
	(('global', eval)('this')).Neo = Neo;
	require('../agent_smith/src/agent_smith_cl')
	module.exports = Neo;
}
