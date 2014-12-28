var nodejs = (typeof window === 'undefined');
if (nodejs) {
	TestMain = require('./main');
}

TestMain.Tester.addTest('LoaderTest', [
	{
		name : '',
		test : function() {
			
		}
	}
]);