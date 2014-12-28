var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('./main');
	var MNISTLoader = require('../utils/mnist_loader');
}

var data = null;

TestMain.Tester.addTest('LoaderTest', [
	{
		name : 'Load',
		test : function(callback) {
			MNISTLoader.load('../dataset/mnist/train-images-idx3-ubyte', '../dataset/mnist/train-labels-idx1-ubyte', 10, function(tmp_data) {
				data = tmp_data;
				callback(true);
			});
		}
	},
	{
		name : 'CreateBatches',
		test : function() {
			var batches = MNISTLoader.createBatches(data.images, data.labels, 5);
			return true;
		}
	},
]);