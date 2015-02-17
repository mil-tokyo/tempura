var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var Sushi = require('../../sushi/src/sushi');
	require('../../sushi/src/sushi_cl');
	
	var Tempura = require('../../src/tempura');
	require('../../src/decomposition/decomposition');
	require('../../src/decomposition/pca');
}

TestMain.Tester.addTest('PCATest', [
	{
		name : 'PCA n_component number',
		test : function(callback) {
		    var $M = Sushi.Matrix;
		    var X = $M.fromArray([[ 1,  2,  6,  3,  4],
					  [ 3,  4,  5,  4,  2],
					  [ 3,  5,  1,  6,  8],
					  [ 2,  5,  4,  6,  5],
					  [ 3, -1, -3,  2,  5],
					  [-5,  2,  1,  0, -1],
					  [-1, -2,  5,  3,  2],
					  [ 2,  2, -2,  4,  3],
					  [ 1,  1, -1, -2,  1],
					  [-1,  2,  3,  2,  1]])
		    
		    var pca = new Tempura.Decomposition.PCA(n_components=4);
		    pca.fit(X);
		    var res = $M.fromArray([[-0.47967258, -0.35271391, -0.18175084, -0.54989279, -0.55685875],
					    [ 0.31349581, -0.14488228, -0.8973768 , -0.12932263,  0.24232218],
					    [ 0.29016429, -0.88217383,  0.30243265, -0.00462311,  0.21467914],
					    [-0.72480776, -0.23331985, -0.2046507 ,  0.5249886 ,  0.32050059]])

		    var cnt = 0;
		    for(var i=0; i<res.rows; i++){
			var a = $M.extract(res, i, 0, 1, res.cols);
			var b = $M.extract(pca.components_, i, 0, 1, pca.components_.cols);
			if(a.nearlyEquals(b) || a.times(-1).nearlyEquals(b)){
			    cnt += 1
			}
		    }

		    if(cnt == res.rows){
			return true
		    }
		    else{
			return false
		    }
		}
	},
    {
		name : 'PCA whitening',
		test : function(callback) {
		    var $M = Sushi.Matrix;
		    var X = $M.fromArray([[ 1,  2,  6,  3,  4],
					  [ 3,  4,  5,  4,  2],
					  [ 3,  5,  1,  6,  8],
					  [ 2,  5,  4,  6,  5],
					  [ 3, -1, -3,  2,  5],
					  [-5,  2,  1,  0, -1],
					  [-1, -2,  5,  3,  2],
					  [ 2,  2, -2,  4,  3],
					  [ 1,  1, -1, -2,  1],
					  [-1,  2,  3,  2,  1]])
		    
		    var pca = new Tempura.Decomposition.PCA(n_components=2, copy=false, whiten=true);
		    pca.fit(X);

		    var res = $M.fromArray([[-0.1239425 , -0.09113768, -0.04696256, -0.14208669, -0.14388662],
					    [ 0.09832087, -0.04543905, -0.28144194, -0.04055912,  0.07599887]])

		    var cnt = 0;
		    for(var i=0; i<res.rows; i++){
			var a = $M.extract(res, i, 0, 1, res.cols);
			var b = $M.extract(pca.components_, i, 0, 1, pca.components_.cols);
			if(a.nearlyEquals(b) || a.times(-1).nearlyEquals(b)){
			    cnt += 1
			}
		    }

		    if(cnt == res.rows){
			return true
		    }
		    else{
			return false
		    }
		}
	},
    {
		name : 'PCA transform',
		test : function(callback) {
		    var $M = Sushi.Matrix;
		    var X = $M.fromArray([[ 1,  2,  6,  3,  4],
					  [ 3,  4,  5,  4,  2],
					  [ 3,  5,  1,  6,  8],
					  [ 2,  5,  4,  6,  5],
					  [ 3, -1, -3,  2,  5],
					  [-5,  2,  1,  0, -1],
					  [-1, -2,  5,  3,  2],
					  [ 2,  2, -2,  4,  3],
					  [ 1,  1, -1, -2,  1],
					  [-1,  2,  3,  2,  1]])


		    var test_data = $M.fromArray([[ 1,  2,  5, -1,  0],
						   [ 1, -1, -2,  2,  1],
						   [ 1,  1,  2, -3,  1],
						   [-1, -1,  1,  3,  5],
						   [ 2,  3,  1,  1,  0],
						   [ 1, -2, -1, -1,  1],
						   [ 0,  0,  0,  1,  2],
						   [ 2,  3,  4,  1,  9],
						   [-1, -6,  1,  1, -2]])
		    
		    var pca = new Tempura.Decomposition.PCA(n_components=2);
		    pca.fit(X);
		    trans_res = pca.transform(test_data);
		    var res = $M.fromArray([[ 3.10080672, -2.95470944],
					 [ 3.22466724,  3.61592929],
					 [ 4.54169998,  0.38327068],
					 [ 0.86143207,  1.13677333],
					 [ 1.89563803,  0.54476602],
					 [ 5.04530867,  3.25140267],
					 [ 2.98115825,  1.7344424 ],
					 [-3.66134327,  0.03353521],
					 [ 7.62279846,  0.42357479]])

		    var cnt = 0;
		    for(var i=0; i<res.rows; i++){
			var a = $M.extract(res, i, 0, 1, res.cols);
			var b = $M.extract(trans_res, i, 0, 1, trans_res.cols);
			if(a.nearlyEquals(b) || a.times(-1).nearlyEquals(b)){
			    cnt += 1
			}
		    }

		    if(cnt == res.rows){
			return true
		    }
		    else{
			return false
		    }
		}
	},
{
		name : 'PCA n_component number',
		test : function(callback) {
		    var $M = Sushi.Matrix;


		    var X = $M.fromArray([[ 1,  3,  3,  2,  3, -5, -1,  2,  1, -1],
					  [ 2,  4,  5,  5, -1,  2, -2,  2,  1,  2],
					  [ 6,  5,  1,  4, -3,  1,  5, -2, -1,  3],
					  [ 3,  4,  6,  6,  2,  0,  3,  4, -2,  2],
					  [ 4,  2,  8,  5,  5, -1,  2,  3,  1,  1]]).t();

		    var pca = new Tempura.Decomposition.PCA(n_components=4);
		    pca.fit(X);
		    var res = $M.fromArray([[-0.47967258, -0.35271391, -0.18175084, -0.54989279, -0.55685875],
					    [ 0.31349581, -0.14488228, -0.8973768 , -0.12932263,  0.24232218],
					    [ 0.29016429, -0.88217383,  0.30243265, -0.00462311,  0.21467914],
					    [-0.72480776, -0.23331985, -0.2046507 ,  0.5249886 ,  0.32050059]])

		    var cnt = 0;
		    for(var i=0; i<res.rows; i++){
			var a = $M.extract(res, i, 0, 1, res.cols);
			var b = $M.extract(pca.components_, i, 0, 1, pca.components_.cols);
			if(a.nearlyEquals(b) || a.times(-1).nearlyEquals(b)){
			    cnt += 1
			}
		    }

		    if(cnt == res.rows){
			return true
		    }
		    else{
			return false
		    }
		}
	}
]);
