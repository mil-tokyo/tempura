var nodejs = (typeof window === 'undefined');
if (nodejs) {
	TestMain = require('./main');
}

var MNISTLoader = require('../utils/mnist_loader');

TestMain.Tester.addTest('LoaderTest', [
	{
		name : 'Synchronous',
		test : function(callback) {
			return true;
		}
	},
	{
		name : 'Asynchronous',
		test : function(callback) {
			setTimeout(callback.bind(null, true), 1000);
		}
	}
]);