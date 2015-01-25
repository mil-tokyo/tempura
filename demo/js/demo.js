var AgentSmithDemo = {};

(function($M, $T, $){
	AgentSmithDemo = {
		demos: {},
		class_input_group: "input-group",
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
				args[arg_name] = 'default' in args_settings[arg_name] ? args_settings[arg_name].default : null;
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
				for (var arg_name in this.demos[name].args) {
					args[arg_name] = $M.fromArray(JSON.parse($input.find("#arg-" + arg_name).val()));
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
					var arg = this.demos[name].args[arg_name].default;
					var $arg_group = $("<div>").addClass(this.class_input_group);
					$arg_group
						.append(
							$("<p>").text(arg_name)
						)
						.append(
							$("<textarea>").addClass(this.class_arg_textarea).attr("id", "arg-"+arg_name).val(JSON.stringify($M.toArray(arg)))
						)
					;
					$input.append(
						$arg_group
					);
				}
			}
		}
	}
	
})(AgentSmith.Matrix, Trinity, jQuery);
	