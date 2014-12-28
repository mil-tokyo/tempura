var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var AgentSmith = require('../agent_smith/src/agent_smith');
	require('../agent_smith/src/agent_smith_cl');
}
var $M = AgentSmith.Matrix;

var MNISTLoader = {};
MNISTLoader.load = function(path_image, path_label, limit, callback) {
	if (nodejs) {
		var fs = require('fs');
		
		var images_bin = fs.readFileSync(path_image);
		var labels_bin = fs.readFileSync(path_label);
		var images_num = images_bin.readInt32BE(4);
		var limit = limit ? Math.min(images_num, limit) : images_num;
		var rows = images_bin.readInt32BE(8);
		var cols = images_bin.readInt32BE(12);
		
		var images = [];
		var labels = [];
		for (var i = 0; i < limit; i++) {
			var offset = 16 + i * (rows * cols);
			var image = new $M(rows, cols);
			for (var y = 0; y < rows; y++) {
				for (var x = 0; x < cols; x++) {
					image.set(y, x, images_bin.readUInt8(offset + x + y * cols) / 255.0);
				}
			}
			images.push(image);
			labels.push(labels_bin.readUInt8(8 + i));
		}
		callback({
			images : images,
			labels : labels
		});
	} else {
		
	}
};

MNISTLoader.createBatches = function(images, labels, batch_size) {
	var image_batches = [];
	var label_batches = [];
	var i = 0;
	while (i < images.length) {
		var output_batch_size = Math.min(images.length - i, batch_size);
		var image_batch = new $M(output_batch_size, images[i].data.length);
		var label_batch = new $M(output_batch_size, 1);
		image_batch.syncData();
		label_batch.syncData();
		for (var j = 0; j < output_batch_size; i++, j++) {
			images[i].syncData();
			for (var k = 0; k < images[i].data.length; k++) {
				image_batch.data[j * images[i].data.length + k] = images[i].data[k];
			}
			label_batch.data[j] = labels[i];
		}
		image_batches.push(image_batch);
		label_batches.push(label_batch);
	}
	return {
		image_batches : image_batches,
		label_batches : label_batches
	};
};

if (nodejs) {
	module.exports = MNISTLoader;
}