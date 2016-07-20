
randmControllers.controller('DashboardCtrl', function($scope) {

	console.log("DashboardCtrl");
	$scope.data = {};
	$scope.data.dashboard = {
		oncalluser: "Gihan Kannangara",
		oncallimotion:"I feel really tired",
		prodstate: {
			notifications:0,
			incidents:5,
			monitoring:5
		},
		evtestate: {
			notifications:1,
			incidents:1,
			monitoring:0
		}
	}
});