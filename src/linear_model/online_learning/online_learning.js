(function(nodejs, $M, Tempura){
    if (nodejs) {
	require('../base');
	require('../linear_model');
    };
    Tempura.LinearModel.OnlineLearning = {};
})(typeof window === 'undefined', Sushi.Matrix, Tempura);
