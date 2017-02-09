
randmControllers.controller('ContactsCtrl', function ($scope, $window, $http, $stateParams, $ionicHistory, $state, $timeout, ContactsDataService, IncidentService) {
	console.log('ContactsCtrl');
	console.log('incidentId', $stateParams.incidentId);

	$scope.data = {}

	$scope.doRefresh = function () {
		console.log("doRefresh");
		ContactsDataService.query().then(function(response){
			//console.log("contacts : " + JSON.stringify(response));
			$scope.data.contacts = response;
		}).finally(function(){
            console.log("finally");
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
		})

	};

	$scope.doRefresh();

	$scope.onSelect = function (item) {
		console.log("Contact selected : " + JSON.stringify(item));
		$window.location.href = "tel:" + item.doc.number;
		var backView = $ionicHistory.backView();
		if (backView != null && backView.stateName == "app.incidents") {
			$timeout(function () {
				var incident = IncidentService.getIncident($stateParams.incidentId);
				console.log("Testing new method: " + JSON.stringify(incident));
				var workinfo = IncidentService.workinfo();
				workinfo.summary = "Called " + item.doc.name;
				workinfo.date = new Date();
				incident.workinfo.unshift(workinfo);
				console.log("Current incident : " + JSON.stringify(IncidentService.getIncident(incident.incidentnumber)));
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				/*				$ionicHistory.clearCache();
								$ionicHistory.clearHistory()
								$state.go("app.incidents", { incidentId: incident.incidentnumber });*/
				$ionicHistory.goBack();
			}, 100);
		}
	};
});