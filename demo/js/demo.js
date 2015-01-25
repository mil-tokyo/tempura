var AgentSmithDemo = {};

(function($M){
	AgentSmithDemo = {
		demos: {},
		initializer: function(){},
		
		addDemo: function(title, description, demo) {
			this.demos[title] = {
				title: title,
				description: description,
				demo: demo
			}
		},
		
		getDemoNames: function() {
			return Object.keys(this.demos);
		},

		getDescription: function(name) {
			return this.demos[name].description;
		},
		
		setInitializer: function(initFunc) {
			this.initializer = initFunc;
		},
		
		runDemo: function(name) {
			console.log('Run: '+name);
			this.initializer();
			this.demos[name].demo();
		},

		getCode: function(name) {
			return this.demos[name].demo.toString();
		}
	}
	
})(AgentSmith.Matrix);
	