var Trinity = {};

(function($M){
	Trinity = function(selector) {
		this.padding = {
			left: 30,
			right: 20,
			top: 20,
			bottom: 20,
		};
		var parent = d3.select(selector);
		this.w = Trinity.getStyle(parent[0][0], 'width');
		this.h = Trinity.getStyle(parent[0][0], 'height');
		this.w = this.w.replace('px', '');
		this.h = this.h.replace('px', '');
		var svg = parent
			.append("svg")
			.attr('width', this.w)
			.attr('height', this.h)
			;
		this.svg = svg;
		this.clf();
	};

	Trinity.prototype = {
		clf: function() {
			this.data = [];
			this.svg.selectAll('*').remove();
		},

		plot: function(x, y, option) {
			this.data.push({
				data: [x.clone(),y.clone(),option],
				x_range: [$M.min(x), $M.max(x)],
				y_range: [$M.min(y), $M.max(y)],
				show: this._show_plot,
				drawLegend: this._drawPlotLegend
			})
		},

		scatter: function(x, y, color) {
			this.data.push({
				data: [x.clone(), y.clone(), color],
				x_range: [$M.min(x), $M.max(x)],
				y_range: [$M.min(y), $M.max(y)],
				show: this._show_scatter,
				drawLegend: this._drawScatterLegend
			})
		},

		contourDesicionFunction: function(x_min, x_max, y_min, y_max, func, func_){
			var decision_func;
			if (typeof func === 'function') {
				decision_func = func;
				args = {};
			} else {
				decision_func = func_;
				args = func;
			}
			this.data.push({
				data: [x_min, x_max, y_min, y_max, decision_func, args],
				x_range: [x_min, x_max],
				y_range: [y_min, y_max],
				show: this._show_contourDecisionFunction
			});
		},

		xlim: function(x_range) {
			if (!(0 in x_range) || !(1 in x_range)) {
				throw new TypeError('x_range must be an array and contain 2 elements');
			}
			this.x_range = x_range;
		},

		ylim: function(y_range) {
			if (!(0 in y_range) || !(1 in y_range)) {
				throw new TypeError('y_range must be an array and contain 2 elements');
			}
			this.y_range = y_range;
		},

		xlabel: function(title, options) {
			this.xlabel_settings = {
				title: title,
				options: options
			};
		},

		ylabel: function(title, options) {
			this.ylabel_settings = {
				title: title,
				options: options
			};
		},

		legend: function(titles, location) {
			this.legend_settings = {
				titles: titles,
				loc: location ? location : null
			};
		},

		show: function() {
			var data = this.data;

			// Determine the ranges
			var x_range_init = this.x_range, y_range_init = this.y_range;
			var x_range = null, y_range = null;
			data.forEach(function(d) {
				if (d.x_range) {
					if (x_range) {
						if (!x_range_init || x_range_init[0]===null) x_range[0] = Math.min(x_range[0], d.x_range[0]);
						if (!x_range_init || x_range_init[1]===null) x_range[1] = Math.max(x_range[1], d.x_range[1]);
					} else {
						if (x_range_init) {
							x_range = [x_range_init[0]!==null ? x_range_init[0] : d.x_range[0], x_range_init[1]!==null ? x_range_init[1] : d.x_range[1]];
						} else {
							x_range = d.x_range;
						}
					}
				}
				if (d.y_range) {
					if (y_range) {
						if (!y_range_init || y_range_init[0]===null) y_range[0] = Math.min(y_range[0], d.y_range[0]);
						if (!y_range_init || y_range_init[1]===null) y_range[1] = Math.max(y_range[1], d.y_range[1]);
					} else {
						if (y_range_init) {
							y_range = [y_range_init[0]!==null ? y_range_init[0] : d.y_range[0], y_range_init[1]!==null ? y_range_init[1] : d.y_range[1]];
						} else {
							y_range = d.y_range;
						}
					}
				}
			});
			y_range[1] = [y_range[0], y_range[0] = y_range[1]][0]; // Swap

			if (this.xlabel_settings) {
				var xlabel_fontsize = (this.xlabel_settings.options && this.xlabel_settings.options.fontsize) ? this.xlabel_settings.options.fontsize : 20;
				this.padding.bottom += xlabel_fontsize + 20;
			}
			if (this.ylabel_settings) {
				var ylabel_fontsize = (this.ylabel_settings.options && this.ylabel_settings.options.fontsize) ? this.ylabel_settings.options.fontsize : 20;
				this.padding.left += ylabel_fontsize += 10;
			}

			var xScale = d3.scale.linear()
				.domain(x_range)
				.range([this.padding.left, this.w - this.padding.right]);

			var yScale = d3.scale.linear()
				.domain(y_range)
				.range([this.padding.top, this.h-this.padding.bottom]);

			var t = this;
			data.forEach(function(d){
				d.show.call(t, d.data, xScale, yScale);
			});

			this.drawAxis(xScale, yScale);
			if (this.xlabel_settings) {
				this._drawXLabel(this.xlabel_settings);
			}
			if (this.ylabel_settings) {
				this._drawYLabel(this.ylabel_settings);
			}

			if (this.legend_settings) {
				this._drawLegend(this.legend_settings);
			}
		},

		_show_plot: function(data, xScale, yScale) {
			var x = data[0], y = data[1], option = data[2];
			option = option ? option : '';
			var xArray = $M.toArray(x);

			style = this._parsePlotOption(option);
			if (style.circle) {
				this.svg.append('g').selectAll("circle")
					.data(xArray)
					.enter()
					.append("circle")
					.attr("cx", function(d, i){
						return xScale(d);
					})
					.attr('cy', function(d, i){
						return yScale(y.get(i,0));
					})
					.attr('fill', style.circle.fill)
					.attr('r', 2);
			}
			if (style.line) {
				var line = d3.svg.line()
					.x(function(d, i){
						return xScale(d);
					})
					.y(function(d, i){
						return yScale(y.get(i,0));
					})
					.interpolate('linear');

				var path = this.svg.append('path')
					.datum(xArray)
					.attr('d', line)
					.attr('fill', style.line.fill)
					.attr('stroke', style.line.stroke)
					.attr('stroke-width', 2);

				if (style.line.stroke_dasharray) {
					path.attr('stroke-dasharray', style.line.stroke_dasharray);
				}
			}
		},

		_parsePlotOption: function(option) {
			var res = {
				circle: null,
				line: null
			};

			if (!option) option = 'b-';

			if (option.indexOf('o') >= 0) {
				res.circle = {
					fill: this._parseColor(option),
					stroke: null
				};
			}
			if (option.indexOf('-') >= 0 || option.indexOf(':') >= 0) {
				res.line = {
					fill: 'none',
					stroke: this._parseColor(option),
					stroke_dasharray: null
				};
				if (option.indexOf('--') >= 0) {
					res.line.stroke_dasharray = '5,5';
				} else if (option.indexOf('-.') >= 0) {
					res.line.stroke_dasharray = '4,6,2,6';
				} else if (option.indexOf(':') >= 0) {
					res.line.stroke_dasharray = '2,3';
				}
			}

			return res;
		},

		_parseColor: function(option) {
			if (!option) return 'blue';
			var colors = {
				b: 'blue',
				g: 'green',
				r: 'red',
				c: 'cyan',
				m: 'magenta',
				y: 'yellow',
				k: 'black',
				w: 'white'
			}
			for (var key in colors) {
				if (option.indexOf(key) >= 0) {
					return colors[key];
				}
			}
			return 'blue';
		},

		_show_scatter: function(data, xScale, yScale) {
			var x = data[0], y = data[1], color = data[2];

			var color_list = d3.scale.category20();

			var xArray = $M.toArray(x);

			this.svg.append('g').selectAll("circle")
				.data(xArray)
				.enter()
				.append("circle")
				.attr("cx", function(d, i){
					return xScale(d);
				})
				.attr('cy', function(d, i){
					return yScale(y.get(i,0));
				})
				.attr('fill', function(d, i){
					return color instanceof $M ? color_list(color.get(i,0)) : color_list(1);
				})
				.attr('r', 2);
		},

		_show_contourDecisionFunction: function(data, xScale, yScale){
			var x_min = data[0], x_max = data[1], y_min = data[2], y_max = data[3], decisionFunction = data[4], args = data[5];
			var x_bins = 100, y_bins = 100;
			var mesh = new Array(x_bins);
			var xmap = new Array(x_bins);
			var ymap = new Array(x_bins);
			var mesh_min = null, mesh_max = null;
			for (var ix=0 ; ix<x_bins ; ix++) {
				mesh[ix] = new Array(y_bins);
				xmap[ix] = new Array(y_bins);
				ymap[ix] = new Array(y_bins);
				for (var iy=0 ; iy<y_bins ; iy++) {
					var x = x_min + (x_max-x_min)*ix/x_bins;
					var y = y_min + (y_max-y_min)*iy/y_bins;
					var val = decisionFunction(x, y);
					mesh[ix][iy] = val;
					if (mesh_max===null || mesh_max < val) mesh_max = val;
					if (mesh_min===null || mesh_min > val) mesh_min = val;
					xmap[ix][iy] = x;
					ymap[ix][iy] = y;
				}
			}

			// Determine levels
			var levels;
			if (args.levels) {
				levels = args.levels;
			} else {
				var n_levels = 10;
				var levels = new Array(n_levels);
				for (var i=0 ; i<n_levels ; i++) {
					levels[i] = mesh_min + (mesh_max-mesh_min)*i/(n_levels-1);
				}
				/*
				var levels = [];
				for (var i=Math.ceil(mesh_min) ; i<=Math.floor(mesh_max) ; i++) {
					levels.push(i);
				}
				*/
			}

			// Colors
			var domain = new Array(6);
			for (var i=0 ; i<6 ; i++) {
				domain[i] = mesh_min + (mesh_max-mesh_min)*i/6;
			}
			var color = d3.scale.linear()
			.domain(domain)
			.range(["#0a0", "#6c0", "#ee0", "#eb4", "#eb9", "#fff"]);

			function findPathInGrid(edges, level) {
				var points = [];
				for (var i=0; i<edges.length; i++) {
					var i2 = (i+1)%edges.length;
					if ((edges[i][2]-level) * (edges[i2][2]-level) < 0) {
						var offset = (level-edges[i][2])/(edges[i2][2]-edges[i][2]);
						points.push([
							edges[i][0] + (edges[i2][0]-edges[i][0])*offset,
							edges[i][1] + (edges[i2][1]-edges[i][1])*offset
						]);
					}
				}
				return points;
			}

			var level = 0; // tmp
			var svg = this.svg;
			var edges = new Array(4);
			levels.forEach(function(level){
				var level_color = color(level);
				// Scan and draw lines
				for (var ix=0 ; ix<x_bins-1 ; ix++) {
					for (var iy=0 ; iy<y_bins-1 ; iy++) {
						edges[0] = [xmap[ix  ][iy  ], ymap[ix  ][iy  ], mesh[ix  ][iy  ]];
						edges[1] = [xmap[ix+1][iy  ], ymap[ix+1][iy  ], mesh[ix+1][iy  ]];
						edges[2] = [xmap[ix+1][iy+1], ymap[ix+1][iy+1], mesh[ix+1][iy+1]];
						edges[3] = [xmap[ix  ][iy+1], ymap[ix  ][iy+1], mesh[ix  ][iy+1]];

						points = findPathInGrid(edges, level);

						if (points.length == 2) {
							var line = d3.svg.line()
							.x(function(d){
								return xScale(d[0]);
							})
							.y(function(d){
								return yScale(d[1]);
							})
							.interpolate('linear');

							var path = svg.append('path')
							.datum(points)
							.attr('d', line)
							.attr('fill', 'none')
							.attr('stroke', level_color)
							.attr('stroke-width', 2);
						}
					}
				}

			});
		},

		drawAxis: function(xScale, yScale) {
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.ticks(5)
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(yScale)
				.ticks(5)
				.orient("left");

			this.svg.append('g')
				.attr("class", "axis")
				.attr('transform', 'translate(0,'+(this.h-this.padding.bottom)+')')
				.call(xAxis);
			this.svg.append('g')
				.attr("class", "axis")
				.attr('transform', 'translate('+this.padding.left+', 0)')
				.call(yAxis);
		},

		_drawXLabel: function(xlabel_settings) {
			var title = xlabel_settings.title;
			var options = xlabel_settings.options ? xlabel_settings.options : {};
			var fontsize = options.fontsize ? options.fontsize : 20;
			var xlabel_height = fontsize, xlabel_width = title.length * fontsize / 2;
			var xlabel_top = this.h - xlabel_height;
			var xlabel_left = (this.w - this.padding.left -this.padding.right - xlabel_width) / 2 + this.padding.left;
			var base = this.svg
			.append('g')
			.attr('width', xlabel_width)
			.attr('height', xlabel_height)
			.attr('transform', 'translate('+xlabel_left+','+xlabel_top+')')
			;

			var label = base.append('text')
			.text(title)
			.attr('x', 0)
			.attr('y', 0)
			.attr('text-anchor', 'middle')
			.attr('font-size', fontsize)
			;
		},

		_drawYLabel: function(ylabel_settings) {
			var title = ylabel_settings.title;
			var options = ylabel_settings.options ? ylabel_settings.options : {};
			var fontsize = options.fontsize ? options.fontsize : 20;
			var ylabel_height = title.length * fontsize / 2, ylabel_width = fontsize;
			var ylabel_top = (this.h - this.padding.top - this.padding.bottom - ylabel_height) / 2 + this.padding.top;
			var ylabel_left = ylabel_width;

			var base = this.svg
			.append('g')
			.attr('width', ylabel_width)
			.attr('height', ylabel_height)
			.attr('transform', 'translate('+ylabel_left+','+ylabel_top+') rotate(270)')
			;

			var label = base.append('text')
			.text(title)
			.attr('x', 0)
			.attr('y', 0)
			.attr('text-anchor', 'middle')
			.attr('font-size', fontsize)
			;
		},

		_drawLegend: function(legend) {
			var n_legends = this.data.length;
			var max_title_len = (legend.titles.reduce(function(a,b){return a.length > b.length ? a : b})).length;
			var frame_width = 40 + max_title_len*10, frame_height = 15*n_legends+10;
			var legend_margin = 10;
			var legend_top = (this.h - frame_height)/2;
			var legend_left = (this.w - frame_width)/2;

			var legend_loc = legend.loc ? legend.loc : 'upper right';
			if (legend_loc.indexOf('upper') >= 0) {
				legend_top = this.padding.top + legend_margin;
			} else if (legend_loc.indexOf('bottom') >= 0) {
				legend_top = this.h - this.padding.bottom - frame_height - legend_margin;
			}
			if (legend_loc.indexOf('left') >= 0) {
				legend_left = this.padding.left + legend_margin;
			} else if (legend_loc.indexOf('right') >= 0) {
				legend_left=this.w - this.padding.left - frame_width - legend_margin;
			}

			var base = this.svg
			.append('g')
			.attr('transform', 'translate('+legend_left+','+legend_top+')')
			;


			var frame = base
			.append('rect')
			.attr('width', frame_width)
			.attr('height', frame_height)
			.attr('fill', 'white')
			.attr('stroke', 'black')
			;

			var i = 0;
			this.data.forEach(function(d){
				if (d.drawLegend) {
					var x = 10;
					var y = 15 + i*15;
					var title = legend.titles && legend.titles[i] ? legend.titles[i] : '';
					var g = base.append('g').attr('transform', 'translate('+x+','+y+')');
					d.drawLegend.call(this, d.data, title, g);
					i++;
				}
			}, this);
		},

		_drawPlotLegend: function(data, title, g) {
			var style = this._parsePlotOption(data[2]);
			var x_start=5, x_end = 35;
			var y = -5;
			if (style.circle) {
				for (var x=x_start ; x<=x_end ; x+=10) {
					g.append('circle')
					.attr('cx', x)
					.attr('cy', y)
					.attr('fill', style.circle.fill)
					.attr('r', 2)
					;
				}
			}
			if (style.line) {
				var line = g.append('line')
				.attr('x1', x_start)
				.attr('y1', y)
				.attr('x2', x_end)
				.attr('y2', y)
				.attr('stroke', style.line.stroke)
				.attr('stroke-width', 2)
				;
				if (style.line.stroke_dasharray) {
					line.attr('stroke-dasharray', style.line.stroke_dasharray);
				}
			}
			g.append('text').text(title)
			.attr('font-size', 10)
			.attr('x', x_end + 10)
			.attr('y', 0)
			;
		},

		_drawScatterLegend: function(data, title, g) {
			var x = data[0], y = data[1], color = data[2];
			var color_list = d3.scale.category20();

			var x_start=10, x_end = 30;
			var y = -3;

			var legend_color_list = [];
			if (color instanceof $M) {
				var color_ = $M.toArray(color.t())[0];
				var legend_color_list = color_.filter(function (x, i, self) { // Unique array
					return self.indexOf(x) === i;
				});
			} else {
				var legend_color_list = [1];
			}

			if (legend_color_list.length > 1) {
				for (var i=0 ; i<legend_color_list.length ; i++) {
					var x = x_start + (x_end - x_start) * i / (legend_color_list.length-1);
					g.append('circle')
					.attr('cx', x)
					.attr('cy', y)
					.attr('fill', color_list(legend_color_list[i]))
					.attr('r', 2);
					;
				}
			} else {
				g.append('circle')
				.attr('cx', (x_end-x_start)/2+x_start)
				.attr('cy', y)
				.attr('fill', color_list(legend_color_list[1]))
				.attr('r', 2);
				;
			}

			g.append('text').text(title)
			.attr('font-size', 10)
			.attr('x', x_end + 15)
			.attr('y', 0)
			;
		}

	};

	/* Static methods */
	Trinity.getStyle = function(el, prop) {
		if (el.currentStyle) {
			return el.currentStyle[prop];
		} else if (window.getComputedStyle) {
			return document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);
		}
		return null;
	}

})(AgentSmith.Matrix);