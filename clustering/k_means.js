(function(){
    var $M = AgentSmith.Matrix;
    function k_means(n_cls){
	console.log("====== initialize ======");
	var samples = $M.fromArray([
	    [1, 1, 3],
	    [0, 1, 1],
	    [1, 1, 0],
	    [1, 2, 1],
	    [1, 2, -1],
	    [9, 7, 8],
	    [13, 10, 11],
	    [10, 7, 8],
	    [8, 11, 9],
	    [9, 7, 8],
	]);

	var n_samples = samples.rows;
	var n_features = samples.cols;
	console.log("n_samples : " + n_samples + ", n_features : " + n_features);
	var init_mats = init_clusters(n_cls, samples);
	this.mean_class = init_mats[0];
	this.assigned_class = init_mats[1];
	this.datanum_hist = init_mats[2];

	console.log("====== start calculating k-means ======")
	for(var i=0; i<n_samples; i++){
	    console.log("sample (%d / %d)", i, n_samples-1);
	    if(this.assigned_class.data[i] != -1){
		console.log("###skip calculation###");
		continue;
	    }
	    sample = get_row(samples, i);
	    var euc_dist = euclidian_distance(this.mean_class, sample);
	    var cls_ind = $M.argminEachCol(euc_dist).data[0];
	    this.assigned_class.data[i] = cls_ind;
	    var new_cls_mean = calc_new_mean(n_features, this.mean_class, this.datanum_hist, sample, cls_ind);
	    set_row(this.mean_class, new_cls_mean, cls_ind);
	    this.datanum_hist.data[cls_ind] += 1;
	    }

	console.log('====== end calculation ======');
	console.log()
	console.log("assigned class");
	console.log(this.assigned_class.data);
	}
    
    function calc_new_mean(n_features, mean_class, datanum_hist, sample, cls_ind){
	var cls_datanum = datanum_hist.data[cls_ind];
	var old_cls_mean = get_row(mean_class, cls_ind);
	var old_cls_sum = old_cls_mean.times(cls_datanum)
	var new_cls_sum = $M.add(old_cls_sum , sample)
	var tmp_row = new $M(1, n_features);
	tmp_row.zeros(cls_datanum + 1);
	var new_cls_mean = $M.divEach(new_cls_sum, tmp_row); 
	return new_cls_mean
    }

    function init_clusters(n_cls, samples){
	console.log("initializing cluster ...")
	var n_samples = samples.rows;
	var n_features = samples.cols;
	var assigned_class = new $M(n_samples, 1);
	var mean_class = new $M(n_cls, n_features);
	var datanum_hist = new $M(n_cls, 1);
	assigned_class.zeros(-1);
	mean_class.zeros();
	datanum_hist.zeros();

//	var init_sample_ind = _.sample(_.range(n_samples), n_cls);
	var init_sample_ind = [0 , 8];
	for(var c=0; c<n_cls; c++){ 
	    var index = init_sample_ind[c];
	    assigned_class.data[index] = c;
	    datanum_hist[c] += 1;
	    set_row(mean_class, get_row(samples, index), c)
	}
	return [mean_class, assigned_class, datanum_hist]
    }


    function get_row(samples, i){
	cols = samples.cols;
	newArr = new $M(1, cols);
	newArr.zeros()
	for(var j=0; j<cols; j++){
	    newArr.data[j] = samples.data[i*cols + j];
	}
	return newArr
    }

    function set_row(samples, row, i){
	cols = samples.cols;
	for(var j=0; j<cols; j++){
	    samples.data[i*cols + j] = row.data[j];
	}
	return samples
    }

    function euclidian_distance(mat1, mat2){
	//console.log("EUC" + mat1 + '\n' + mat2 + '\n' + $M.sub(mat1, mat2));
	var submat = $M.sub(mat1, mat2)
	var dist = $M.sumEachRow($M.mulEach(submat, submat))
	return dist
	
    }

    k_means(2);
})()
