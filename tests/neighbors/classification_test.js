var nodejs = (typeof window === 'undefined');
if (nodejs) {
    var TestMain = require('../main');
    var AgentSmith = require('../../agent_smith/src/agent_smith');
    require('../../agent_smith/src/agent_smith_cl');
    require('../../src/neighbors/neighbors.js');
    require('../../src/neighbors/nearest_neighbors.js');
    require('../../src/neighbors/classification.js');
}

var $M = AgentSmith.Matrix;

var samples = $M.fromArray([
    [10, 22],
    [11, 12],
    [15, 14],
    [17, 12],
    [20, 10],

    [20, 20],
    [21, 22],
    [15, 20],
    [17, 14],
    [20, 12]
]);
var labels = $M.fromArray([[1,1,1,1,1,2,2,2,2,2]]);

TestMain.Tester.addTest('KNeighborsClassifierTest', [
    {
        name : 'DefaultOptions',
        test : function() {
            var clf = new Neo.Neighbors.KNeighborsClassifier();

            if ( (typeof clf.algorithm !== 'undefined' && clf.algorithm === 'auto')
                && (typeof clf.weights !== 'undefined' && clf.weights === 'uniform')
                && (typeof clf.n_neighbors !== 'undefined' && clf.n_neighbors == 5)) {
                return true;
            } else {
                return false;
            }
        }
    },
    {
        name : 'GetWeights_uniform',
        test : function() {
            var clf = new Neo.Neighbors.KNeighborsClassifier();
            var dist = new $M(3, 3);
            dist.random();

            var ans = new $M(3,3);
            ans.setEach(function(){ return 1;});

            return ans.equals(clf._get_weights(dist, 'uniform')) && ans.equals(clf._get_weights(dist)) && ans.equals(clf._get_weights(dist, null));
        }
    },
    {
        name : 'GetWeights_distance',
        test : function() {
            var clf = new Neo.Neighbors.KNeighborsClassifier();
            var dist = $M.fromArray([
                [1, 2],
                [0.5, 0.1]
            ]);
            var ans = $M.fromArray([
                [1, 0.5],
                [2, 10]
            ]);
            var res = clf._get_weights(dist, 'distance');
            return ans.equals(res);
        }
    },
    {
        name : 'Predict',
        test : function() {
            var clf = new Neo.Neighbors.KNeighborsClassifier();
            clf.fit(samples, labels);
            Z = clf.predict($M.fromArray([
                [11, 11],
                [13, 12],

                [18, 18],
                [20, 20]
            ]));

            var ans = $M.fromArray([[1],[1],[2],[2]]);

            return ans.equals(Z);
        }
    },
    {
        name : 'VisualizePredict',
        test : function() {
            var clf = new Neo.Neighbors.KNeighborsClassifier({n_neighbors: 1});
            clf.fit(samples, labels);

            // mesh
            var step = 0.5;
            var min_x = 8, max_x = 24, min_y = 8, max_y = 24;
            var mesh = new $M((max_x-min_x)/step * (max_y-min_y)/step, 2);
            mesh.setEach(function(row, col){
                if (col == 0){
                    return min_x + (row % ((max_x-min_x)/step)) * step;
                } else {
                    return min_y + Math.floor(row / ((max_x-min_x)/step)) * step;
                }
            });
            Z = clf.predict(mesh);
            var n_c1=0, n_c2=0;
            Z.forEach(function(row, col){
                var label = Z.get(row, col);
                if (label == 1) {
                    n_c1++;
                } else if (label == 2) {
                    n_c2++;
                }
            });
            var mesh_c1 = new $M(n_c1, 2), mesh_c2 = new $M(n_c2, 2);
            var i_c1 = 0, i_c2 = 0;
            Z.forEach(function(row, col){
                var label = Z.get(row, col);
                if (label == 1) {
                    mesh_c1.set(i_c1,0,mesh.get(row,0))
                    mesh_c1.set(i_c1,1,mesh.get(row,1))
                    i_c1++;
                } else if (label == 2) {
                    mesh_c2.set(i_c2,0,mesh.get(row,0));
                    mesh_c2.set(i_c2,1,mesh.get(row,1));
                    i_c2++;
                }
            });

            if (nodejs) {
                return null;
            } else {
                AgentSmithVisualizer.createScatter(
                    'k-NN Scatter Graph',
                    {
                        'mesh1' : mesh_c1,
                        'mesh2' : mesh_c2,
                        'data1' : AgentSmith.Matrix.fromArray([
                            [10, 22],
                            [11, 12],
                            [15, 14],
                            [17, 12],
                            [20, 10]
                        ]),
                        'data2' : AgentSmith.Matrix.fromArray([
                            [20, 20],
                            [21, 22],
                            [15, 20],
                            [17, 14],
                            [20, 12]
                        ]),
                        //'data3' : mesh
                    }
                );
                return true;
            }
        }
    }
]);
