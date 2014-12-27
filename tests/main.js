var TestMain = {};

(function() {
	var nodejs = (typeof window === 'undefined');
	if (nodejs) {
		AgentSmith = require('../agent_smith/agent_smith');
		require('../agent_smith/agent_smith_cl');
	}
	var $M = AgentSmith.Matrix;
	
	if ($M.CL) {
		console.log('using device : ' + $M.CL.device_info + ' (' + $M.CL.platform_info + ')');
	}
	
	TestMain.Tester = {
		tests : {},
		notifier : function(msg) { console.log(msg) },
		addTest : function(name, test_cases) {
			this.tests[name] = test_cases;
		},
		getTestNames : function() {
			return Object.keys(this.tests)
		},
		setNotifier : function(notifier) {
			this.notifier = notifier;
		},
		notify : function(msg) {
			this.notifier(msg);
		},
		doTest : function(name) {
			var idx = 0;
			var success = 0;
			var all = 0;
			var na = 0;
			var test_cases = this.tests[name];
			this.notify('START TEST')
			var doNextTest = function() {
				if (idx === test_cases.length) {
					this.notify('FINISH TEST');
					this.notify('SUCCESS : ' + success + ' / ' + all + ' (' + na + ')');
					this.notify('');
					return;
				}
				var start_time = (new Date()).getTime();
				var result = false;
				this.notify('- TEST CASE : ' + test_cases[idx].name);
				try {
					var result = test_cases[idx].test();
				} catch (exception) {
					this.notify('-- exception catched');
					console.error(exception);
				} finally {
					if (result === void 0) {
						this.notify('-- RESULT : benchmark');
					} else if (result === null) {
						this.notify('-- RESULT : N/A')
					} else {
						this.notify('-- RESULT : ' + result);
					}
					this.notify('elapsed time : ' + ((new Date()).getTime() - start_time) + ' ms');
					if (result === true) {
						success++;
					} else if (result === null) {
						na++;
					}
					if (result === true || result === false) {
						all++;
					}
				};
				idx++;
				setTimeout(doNextTest.bind(this), 0);
			};
			doNextTest.call(this);
		}
	};
	
	if (nodejs) {
		module.exports = TestMain;
	}
})();
