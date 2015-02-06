var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var AgentSmith = require('../../agent_smith/src/agent_smith');
	require('../../agent_smith/src/agent_smith_cl');
	
	var Neo = require('../../src/neo');
	require('../../src/cross_decomposition/cross_decomposition');
	require('../../src/cross_decomposition/cca');
}

TestMain.Tester.addTest('CCATest', [
	{
		name : 'CCA test with row_wise data',
		test : function(callback) {
		    var $M = AgentSmith.Matrix;
		    var cca = new Neo.CrossDecomposition.CCA(3, false);
		    var X = $M.fromArray([
			[1, 1, 3],
			[0, 1, 1],
			[1, 1, 0],
			[1, 2, 1],
			[0, 2, 3],
			[-1, -2, -1],
			[1, 0.1, -1],
			[2, 2, 1]])

		    var Y = $M.fromArray([
			[1, 2, -1, 1],
			[13, 10, 11, 2],
			[10, 7, 8, 3],
			[10, 8, 6, 4],
			[8, 11, 9, 0],
			[2, 10, 2, 2],
			[10, 11, 8, 9],
			[9, 7, 8, 0],
		    ]);
		    cca.fit(X, Y);

		    // result of CCA calculated with MATLAB canoncorr(X, Y)
		    var x_rotation_res = $M.fromArray([[1.2659, 0.7868, 0.6946],
						       [-1.3968, 0.2896, -0.3584],
						       [0.8712, -0.0376, -0.4412]])
		    
		    var y_rotation_res = $M.fromArray([[-0.4632, -0.0364, -0.1402],
						       [-0.3182, -0.4543, -0.0863],
						       [0.3828, 0.3273, 0.1279],
						       [0.1577, 0.1122, 0.3985]])

		    
		    // x projection test
		    var X_projection = cca.X_projection;
		    for(var col=0; col<X_projection.cols; col++){
			var sign = Math.sign(X_projection.get(0, col) * x_rotation_res.get(0, col))
			var b = $M.getCol(X_projection, col);
			var a = $M.getCol(x_rotation_res, col).times(sign);
			if(!(a.nearlyEquals(b))){
			    console.log("==== error in col " + col + " of X_projection ====")
			    console.log("expected : ")
			    a.print()
			    console.log("got : ")
			    b.print()
			    return false
			}
		    }

		    // y projection test
		    var Y_projection = cca.Y_projection
		    for(var col=0; col<Y_projection.cols; col++){
			var sign = Math.sign(Y_projection.get(0, col) * y_rotation_res.get(0, col))
			var b = $M.getCol(Y_projection, col);
			var a = $M.getCol(y_rotation_res, col).times(sign);
			if(!(a.nearlyEquals(b))){
			    console.log("==== error in col " + col + "of Y_projection ====")
			    console.log("expected : ")
			    a.print()
			    console.log("got : ")
			    b.print()
			    return false
			}
		    }
		    return true
 		    		   
		}
	},
	{
		name : 'CCA test with col_wise data',
		test : function(callback) {
		    var $M = AgentSmith.Matrix;
		    var cca = new Neo.CrossDecomposition.CCA(3, false);

		    var X = $M.fromArray([[ 1. ,  0. ,  1. ,  1. ,  0. , -1. ,  1. ,  2. ],
					  [ 1. ,  1. ,  1. ,  2. ,  2. , -2. ,  0.1,  2. ],
					  [ 3. ,  1. ,  0. ,  1. ,  3. , -1. , -1. ,  1. ]]).t();

		    var Y = $M.fromArray([[ 1, 13, 10, 10,  8,  2, 10,  9],
					  [ 2, 10,  7,  8, 11, 10, 11,  7],
					  [-1, 11,  8,  6,  9,  2,  8,  8],
					  [ 1,  2,  3,  4,  0,  2,  9,  0]]).t();

		    cca.fit(X, Y);

		    // result of CCA calculated with MATLAB canoncorr(X, Y)
		    var x_rotation_res = $M.fromArray([[1.2659, 0.7868, 0.6946],
						       [-1.3968, 0.2896, -0.3584],
						       [0.8712, -0.0376, -0.4412]])
		    
		    var y_rotation_res = $M.fromArray([[-0.4632, -0.0364, -0.1402],
						       [-0.3182, -0.4543, -0.0863],
						       [0.3828, 0.3273, 0.1279],
						       [0.1577, 0.1122, 0.3985]])
		    
		    // x projection test
		    var X_projection = cca.X_projection;
		    for(var col=0; col<X_projection.cols; col++){
			var sign = Math.sign(X_projection.get(0, col) * x_rotation_res.get(0, col))
			var b = $M.getCol(X_projection, col);
			var a = $M.getCol(x_rotation_res, col).times(sign);
			if(!(a.nearlyEquals(b))){
			    console.log("==== error in col " + col + " of X_projection ====")
			    console.log("expected : ")
			    a.print()
			    console.log("got : ")
			    b.print()
			    return false
			}
		    }

		    // y projection test
		    var Y_projection = cca.Y_projection
		    for(var col=0; col<Y_projection.cols; col++){
			var sign = Math.sign(Y_projection.get(0, col) * y_rotation_res.get(0, col))
			var b = $M.getCol(Y_projection, col);
			var a = $M.getCol(y_rotation_res, col).times(sign);
			if(!(a.nearlyEquals(b))){
			    console.log("==== error in col " + col + "of Y_projection ====")
			    console.log("expected : ")
			    a.print()
			    console.log("got : ")
			    b.print()
			    return false
			}
		    }
		    return true
 		    		   
		}
	}
]);
