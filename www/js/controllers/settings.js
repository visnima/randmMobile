randmControllers.controller('SettingsCtrl', function($scope, RMSelect, RefreshService) {

	console.log("SettingsCtrl");
	$scope.data = {};

	$scope.data.refreshIntervalSelect = RMSelect.refreshintervallist;
	$scope.data.refreshCountSelect = RMSelect.refreshCountlist;
	console.log(JSON.stringify($scope.data.refreshIntervalSelect));

	$scope.onChangeRefreshCount = function() {
		console.log("RefreshCount:" + $scope.data.autoRefreshCount);
		RefreshService.setAutoRefreshCount($scope.data.autoRefreshCount);
	}

	$scope.onChangeRefreshInterval = function() {
		console.log("AutoRefreshInterval:" + $scope.data.autoRefreshInterval);
		RefreshService.setAutoRefreshInterval($scope.data.autoRefreshInterval);
	}

	$scope.data.autoRefreshCount = RefreshService.getAutoRefreshCount();
	$scope.data.autoRefreshInterval = RefreshService.getAutoRefreshInverval();
});