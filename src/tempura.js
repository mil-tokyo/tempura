var Tempura = {};

if (typeof window === 'undefined') {
	(('global', eval)('this')).Tempura = Tempura;
	require('../sushi/src/sushi_cl')
	module.exports = Tempura;
}
