var AgentSmithVisualizer = {};

(function($M) {
	AgentSmithVisualizer.createModalCanvas = function() {
		var counter = 0;
		return function() {
			var id = "visualizer_" + (counter++);
			// create wrapper div and canvas
			var wrapper_div_id = id + '_wrapper_div';
			var title_div_id = id + '_title';
			var close_span_id = id + '_close';
			$(document.body).append($('<div>').attr('id', wrapper_div_id).html('\
				<div id="' + title_div_id + '">AgentSmithVisualizer<span id="' + close_span_id + '">x</span></div>\
				<canvas id="'+ id + '"></canvas>\
			'));
			// set css
			$('#' + wrapper_div_id).css({
				'border' : '1px solid #aaa',
				'position' : 'absolute',
				'z-index' : '9999'
			});
			$('#' + title_div_id).css({
				'background-color' : '#fdc',
				'position' : 'relative',
				'cursor' : 'move'
			});
			$('#' + close_span_id).css({
				'cursor' : 'pointer',
				'right' : '0',
				'margin' : '0',
				'position' : 'absolute',
			});
			
			var wx, wy;
			wx = $(document).scrollLeft() + ($(window).width() - $('#' + wrapper_div_id).outerWidth()) / 2;
			if (wx < 0) wx = 0;
			wy = $(document).scrollTop() + ($(window).height() - $('#' + wrapper_div_id).outerHeight()) / 2;
			if (wy < 0) wy = 0;
			$('#' + wrapper_div_id).css({ top: wy, left: wx });
			$('#' + close_span_id).click(function() {$('#' + wrapper_div_id).fadeOut(100);});
			$('#' + title_div_id).mousedown(function(e) {
				var mx = e.pageX;
				var my = e.pageY;
				$(document).on('mousemove.' + wrapper_div_id, function(e) {
					wx += e.pageX - mx;
					wy += e.pageY - my;
					$('#' + wrapper_div_id).css({top: wy, left: wx});
					mx = e.pageX;
					my = e.pageY;
					return false;
				}).one('mouseup', function(e) {
					$(document).off('mousemove.' + wrapper_div_id);
				});
				return false;
			});
			return id;
		};
	}();
	
	AgentSmithVisualizer.createScatter = function(title, data) {
		var chart_names = ['系列'];
		var chart_xs = ['x'];
		var chart_ys = ['y'];
		for (var key in data) {
			for (var row = 0; row < data[key].rows; row++) {
				chart_names.push(key);
				chart_xs.push(data[key].get(row, 0));
				chart_ys.push(data[key].get(row, 1));
			}
		}
		var chart_data = [chart_names, chart_xs, chart_ys];
		var chart_params = {
			"config" : {
				"title" : title,
				"titleColor" : "#333",
				"type" : "scatter",
				"useMarker" : "maru",
				"useShadow" : "no",
				"markerWidth" : 10,
				"xLines" : "none",
				"xScaleSkip" : 0,
				"textColor": "#111",
				"bg" : "#fff"
			},
			"data" : chart_data
		};
		var id = this.createModalCanvas();
		var chart = ccchart.init(id, chart_params);
	};
})(AgentSmith.Matrix);