var AgentSmithDemo = {};

(function($M, $T, $){
	AgentSmithDemo = {
		demos: {},
		class_input_wrapper: "input-group",
		class_arg_name: "arg-name",
		class_arg_description: "arg-description",
		class_arg_textarea: "arg-input",
		
		setDrawArea: function($draw_area) {
			this.$draw_area = $draw_area;
		},
		
		addDemo: function(title, description, demo, demo_) {
			var demo_func, args;
			if (typeof demo_ === 'function') {
				demo_func = demo_;
				args = demo;
			} else {
				demo_func = demo;
				args = {};
			}
			this.demos[title] = {
				title: title,
				description: description,
				demo: demo_func,
				args: args
			}
		},
		
		getDemoNames: function() {
			return Object.keys(this.demos);
		},

		getDescription: function(name) {
			return this.demos[name].description;
		},
		
		runDemo: function(name) {
			if (!this.$draw_area) {
				console.log('Draw area not set');
				return;
			}
			
			console.log('Run: '+name);
			
			// Create plotter object
			this.$draw_area.empty();
			var plt = new $T("#" + this.$draw_area.attr("id"));
			
			// Set default arguments
			var args_settings = this.demos[name].args;
			var args = {};
			for (var arg_name in args_settings) {
				args[arg_name] = 'init' in args_settings[arg_name] ? args_settings[arg_name].init : null;
			}
			
			// Run demo
			this.demos[name].demo(plt, args);
		},
		
		runDemoByInput: function($input, name) {
			if (!this.$draw_area) {
				console.log('Draw area not set');
				return;
			}
			
			console.log('Run: '+name);
			
			// Create plotter object
			this.$draw_area.empty();
			var plt = new $T("#" + this.$draw_area.attr("id"));
			
			var args = AgentSmithDemo.getArgsFromInput($input, name);
			this.demos[name].demo(plt, args);
		},
		
		getArgsFromInput: function($input, name) {
			var args = {};
			if (name in this.demos) {
				var arg_setting = this.demos[name].args;
				for (var arg_name in arg_setting) {
					var data_str = $input.find("#arg-" + arg_name).val();
					switch (arg_setting[arg_name].type) {
						case 'integer':
						args[arg_name] = data_str;
						break;

						case 'matrix':
						default:
						args[arg_name] = $M.fromArray(JSON.parse(data_str));
						break;
					}
				}
			}
			return args;
		},

		getCode: function(name) {
			return this.demos[name].demo.toString();
		},
		
		setArgsInput: function($input, name) {
			$input.empty();
			if (name in this.demos) {
				for (var arg_name in this.demos[name].args) {
					var arg_setting = this.demos[name].args[arg_name];
					var description = 'description' in arg_setting ? arg_setting.description : "";
					var arg = arg_setting.init;
					var $arg_wrapper = $("<div>").addClass(this.class_input_wrapper);
					var data_str;
					switch(arg_setting.type) {
						case 'integer':
						data_str = arg;
						break;

						case 'matrix':
						default:
						data_str = JSON.stringify($M.toArray(arg));
						break;
					}
					$arg_wrapper
						.append(
							$("<h5>").addClass(this.class_arg_name).text(arg_name)
						)
						.append(
							$("<p>").addClass(this.class_arg_description).text(description)
						)
						.append(
							$("<textarea>").addClass(this.class_arg_textarea).attr("id", "arg-"+arg_name).val(data_str)
						)
					;
					$input.append(
						$arg_wrapper
					);
				}
			}
		}
	}
	
})(AgentSmith.Matrix, Trinity, jQuery);
	