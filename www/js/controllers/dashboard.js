
randmControllers.controller('DashboardCtrl', function ($scope, $q, $timeout, $interval, $state, $ionicHistory, AuthenticationService,ContactsDataService, announcementDataService, IncidentService, monitoringService, RefreshService) {

	console.log("DashboardCtrl");
	$scope.refresh = false;
	$scope.data = {};
	$scope.data.refreshtext = "Auto Refresh";
	$scope.data.autoRefreshMode = false;
	$scope.data.user = AuthenticationService.user;
	$scope.data.dashboard = {
		oncalluser: "Gihan Kannangara",
		oncallimotion: "Refresh data",
		loading: "Refresh data...",
		prodstate: {
			notifications: 0,
			incidents: 0,
			monitoring: 0,
		},
		evtestate: {
			notifications: 0,
			monitoring: 0,
			incidents: 0,
		}
	}



	var refresh;
	var refreshinterval = 0;
	var refreshcount = 1;

	var initialize = function () {
		$scope.data.dashboard.prodstate.notifications = 0,
		$scope.data.dashboard.prodstate.incidents = 0,
		$scope.data.dashboard.prodstate.monitoring = 0

		$scope.data.dashboard.evtestate.notifications = 0,
		$scope.data.dashboard.evtestate.incidents = 0,
		$scope.data.dashboard.evtestate.monitoring = 0

	};

	$scope.$on("$ionicView.afterEnter", function (event, data) {
        var forwardView = $ionicHistory.forwardView();
		console.log("$ionicHistory : " + JSON.stringify($ionicHistory));
        var backView = $ionicHistory.backView();
        console.log("backView : " + backView);
		console.log("forwardView : " + forwardView);
        if (angular.isDefined(forwardView) && forwardView != null) {
			if (forwardView.stateName == "app.login" || forwardView.stateName == "app.logout") {
				$scope.doRefresh();
			}
		}
	});
	
	$scope.autoRefreshChanged = function () {
		console.log("Auto refresh mode:" + $scope.data.autoRefreshMode);
		if ($scope.data.autoRefreshMode) {
			refreshinterval = RefreshService.getAutoRefreshInverval();
			refreshcount = RefreshService.getAutoRefreshCount();
			console.log("refreshinterval:" + refreshinterval, "refreshcount:" + refreshcount);
			$scope.doRefresh();
		}
		else {
			if (angular.isDefined(refresh)) {
				$interval.cancel(refresh);
				refresh = undefined;
			}
		}
	};

	$scope.pullRefresh = function () {
		if (angular.isDefined(refresh)) {
			$interval.cancel(refresh);
			refresh = undefined;
		}
		refreshinterval = 0;
		refreshcount = 1;
		$scope.doRefresh();
	};

	$scope.changeSate = function (state, count) {
		if (count > 0) {
			$state.go(state);
		}
	}

	$scope.doRefresh = function () {
		$scope.refresh = true;
		var refreshingtext = [" incidents", " announcements", " monitoring"];
		$scope.data.dashboard.loading = "Loading " + refreshingtext.toString();
		$scope.data.refreshtext = $scope.data.dashboard.loading;

		// check failed monitoring
		var count = 0;
		refresh = $interval(function () {
			initialize();
			$q.all([
				monitoringService.query().then(function (responseData) {
					refreshingtext.splice(refreshingtext.indexOf(" monitoring"), 1);
					for (var row in responseData.data.rows) {
						if (responseData.data.rows[row].key[0].startsWith("EVTE") && responseData.data.rows[row].value.status == "FAILED") {
							$scope.data.dashboard.evtestate.monitoring++;
						}
						if (responseData.data.rows[row].key[0].startsWith("PROD") && responseData.data.rows[row].value.status == "FAILED") {
							$scope.data.dashboard.prodstate.monitoring++;
						}
					}

					$scope.data.dashboard.loading = "Retrieving " + refreshingtext.toString() + "...";
					$scope.data.refreshtext = $scope.data.dashboard.loading;
				}).catch(function (err) {
					console.error('ERR', JSON.stringify(err));
				}),
				(AuthenticationService.user.login? IncidentService.query().then(function (incidents) {
					//console.log("loading incidents : " + JSON.stringify(incidents));
					refreshingtext.splice(refreshingtext.indexOf(" incidents"), 1);
					for (var index = 0; index < incidents.length; index++) {
						var element = incidents[index];
						console.log(element.doc.env)
						if (element.doc.env.startsWith("EVTE") && element.doc.status === "Open") {
							$scope.data.dashboard.evtestate.incidents++;
						}
						if (element.doc.env.startsWith("PROD") && element.doc.status === "Open") {
							$scope.data.dashboard.prodstate.incidents++;
						}

					}
					$scope.refresh = false;
					$scope.data.dashboard.loading = "Retrieving " + refreshingtext.toString() + "...";
					$scope.data.refreshtext = $scope.data.dashboard.loading;
				}):''),
				announcementDataService.query().then(function (announcements) {
					console.log("loading announcements");
					refreshingtext.splice(refreshingtext.indexOf(" announcements"), 1);
					for (var index = 0; index < announcements.length; index++) {
						var element = announcements[index];
						console.log(element.doc.env)
						if (element.doc.env.startsWith("EVTE") && element.doc.status === "Open") {
							$scope.data.dashboard.evtestate.notifications++;
						}
						if (element.doc.env.startsWith("PROD") && element.doc.status === "Open") {
							$scope.data.dashboard.prodstate.notifications++;
						}

					}

					$scope.refresh = false;
					$scope.data.dashboard.loading = "Retrieving " + refreshingtext.toString() + "...";
					$scope.data.refreshtext = $scope.data.dashboard.loading;
				}),
				ContactsDataService.query().then(function (users) {
					console.info("Querring users");
					var today = new Date();
					var dayFriday = today.getDate() - today.getDay() + 5;
					var weekenddate = new Date(today.getFullYear(), today.getMonth(), dayFriday, 17, 0, 0);
					var weekstartdate = new Date(today.getFullYear(), today.getMonth(), dayFriday - 7, 17, 0, 0);
					for (var index = 0; index < users.length; index++) {
						var element = users[index];
						if (element.doc.oncall != "") {
							var oncallday = new Date(element.doc.oncall);
							console.log(oncallday);
							if (oncallday > weekstartdate && oncallday < weekenddate) {
								console.log("On-call user : " + element.doc.name);
								$scope.data.dashboard.oncalluser = element.doc.name;
							}
						}
					}
				})
			]).then(function () {
				console.log('all');
				// Stop the ion-refresher from spinning
				$scope.$broadcast('scroll.refreshComplete');
				$scope.data.refreshtext = "Auto Refresh";
				count++;
				console.log("refreshcount :" + refreshcount + " ,count :" + count);
				if (count == refreshcount) {
					$scope.data.autoRefreshMode = false;
				}
			});

		}, refreshinterval, refreshcount);


		/*		$timeout(function (){
					console.log("timeout");
					$scope.data.dashboard.loading = "Loading incidents...";
				}, 1000);
				$timeout(function (){
					console.log("timeout");
					$scope.data.dashboard.loading = "Loading monitoring...";
				}, 3000);
.finally(function() {
					console.log("finally");
					// Stop the ion-refresher from spinning
					$scope.$broadcast('scroll.refreshComplete');
				});*/

	}

	$scope.doRefresh();
});