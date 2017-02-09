var randmControllers = angular.module('randmMobile.controllers', ['randm.services', 'chart.js']);

randmControllers.controller('AppCtrl', function($scope, $ionicModal, $timeout, $localstorage, AuthenticationService) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.$on('$ionicView.enter', function(e) {
        $scope.user = AuthenticationService.user;
        console.info("user : " + JSON.stringify( $scope.user));
    });

    

});

randmControllers.controller('PlaylistsCtrl', function($scope) {
    $scope.playlists = [
        { title: 'Reggae', id: 1 },
        { title: 'Chill', id: 2 },
        { title: 'Dubstep', id: 3 },
        { title: 'Indie', id: 4 },
        { title: 'Rap', id: 5 },
        { title: 'Cowbell', id: 6 }
    ];
});

randmControllers.controller('PlaylistCtrl', function($scope, $stateParams) {});

randmControllers.controller('AnnouncementsCtrl', function ($scope, $ionicModal, $localstorage, $ionicLoading, announcementDataService, RMSelect) {

    console.log("AnnouncementsCtrl");
    $scope.data = {};
    $scope.data.announcements = [];
    $scope.data.statusList = RMSelect.statuslist;
    $scope.data.severityList = RMSelect.severitylist;
    $scope.data.envList = RMSelect.envlist;
    $scope.form = {};
    console.log("USER :: " + JSON.stringify($scope.user));
    //$scope.user = $localstorage.getObject("user");
    $scope.assess = { severity: false, status: false, env: false };

    // incident modal 
    $ionicModal.fromTemplateUrl('templates/announcementModal.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.announcementmodal = modal;
        console.log("announcement model dialog created");
    });

    var announcement = function () {
        return {

            "title": "",
            "announcement": "",
            "scheduled": new Date(),
            "env": "EVTE",
            "status": "Open",
            "severity": "Low",
            "user": $scope.user.name,
            "lastmodified": new Date()

        };
    }

    console.log("new announcement", JSON.stringify(announcement()));

    // retrieve current announcements
    $scope.getSeverityCSS = function (item) {
        console.log("getSeverityCSS");
        if (item.severity == "High") {
            console.log("Hihg")
            return 'item-energized';
        }
    };

    $ionicLoading.show({
        template: 'Loading Announcements...'
    }).then(function () {
        console.log("The loading indicator is now displayed");
    });

    // refresh view
    $scope.doRefresh = function () {
        announcementDataService.query().then(function (responseData) {
            console.log("refresh");
            $scope.data.announcements = responseData;
            //console.log(JSON.stringify(responseData));
            //console.log('announcements', JSON.stringify($scope.data.announcements));
        }).finally(function () {
            $ionicLoading.hide();
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.doRefresh();

    $scope.onSwipe = function () {
        console.log('onSwipe');
        $scope.checked = true;
    }

    $scope.showAnnouncement = function (item) {
        if (!$scope.user.login) {
            return;
        }
        if (angular.isDefined(item)) {
            console.log("edit announcement");
            $scope.data.announcement = item;
            $scope.data.announcement.scheduled = new Date($scope.data.announcement.scheduled);
            $scope.data.announcementmaster = angular.copy(item);
            $scope.data.announcementAdd = false;
        }
        else {
            console.log("add announcement");
            $scope.data.announcement = new announcement();
            $scope.data.announcementmaster = new announcement();
            console.log(JSON.stringify($scope.data.announcement));
            $scope.data.announcementAdd = true;
        }
        $scope.announcementmodal.show();
    };

    $scope.closeAnnouncement = function (announcement) {
        //$scope.closePopover();
        console.log("Form valid : " + $scope.form.announcementForm.$valid);
        if ($scope.assess.severity || $scope.assess.status || $scope.assess.env) {
            $scope.assess = { severity: false, status: false, env: false };
        }
        else {
            if (!angular.isDefined(announcement)) {
                // close or cancel
                angular.copy($scope.data.announcementmaster, $scope.data.announcement);
            }
            else {
                if ($scope.data.announcementAdd) {
                    console.log("Add announcement");
                }
                else {
                    console.log("Edit announcement");
                }
            }
            $scope.announcementmodal.hide();
        }

    };



});


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
randmControllers.controller('IncidentsCtrl', function ($scope, $ionicModal, $ionicListDelegate, $stateParams, $ionicScrollDelegate, $ionicLoading, $ionicActionSheet, $state, $ionicHistory, EmailService, RMSelect, IncidentService, PushService, ContactsDataService) {
    console.info("IncidentsCtrl");

    console.info("IncidentsCtrl - incidentId", $stateParams.incidentId);
    $scope.searchincident = $stateParams.incidentId;
    // data for incidents
    $scope.data = {};
    $scope.data.incidents = [];

    // form data for incident modal
    $scope.isincident = false;
    $scope.data.incidentmaster = {};
    $scope.data.incidentStatusList = RMSelect.statuslist;
    $scope.data.incidentPriorityList = RMSelect.severitylist;
    $scope.data.envList = RMSelect.envlist;
    $scope.form = {};

    var workinfo = function () {
        return {
            "summary": "",
            "notes": "",
            "date": "",
            "user": ""
        };
    }

    var incident = function () {
        return {
            "incidentnumber": "",
            "tasknumber": "",
            "summary": "",
            "notes": "",
            "impact": "",
            "rootcause":"",
            "status": "Open",
            "priority": "Low",
            "env": "EVTE",
            "createddate": new Date(),
            "createduser": $scope.user.name,
            "lastmodifiedtime": new Date(),
            "lastmodifieduser": $scope.user.name,
            "more": false,
            "workinfo": []

        };
    }


    // data for the workinfor modal
    $scope.data.workinfomaster = {};
    $scope.data.workinfo = new workinfo();
    $scope.data.workinfoAdd = false;
    $scope.data.showDelete = false;
    $scope.data.showReorder = false;
    $scope.data.listCanSwipe = true;

    PushService.subscriptions();
    $scope.incidentSubscriptions = PushService.incidentSubscriptions();
    //console.log("incidentSubscriptions" + JSON.stringify($scope.incidentSubscriptions));

    $scope.subscribe = function (incidentNumber) {
        PushService.subscribe(incidentNumber);
        $scope.incidentSubscriptions[incidentNumber] = true;
    };

    $scope.unsubscribe = function (incidentNumber) {
        PushService.unsubscribe(incidentNumber);
        $scope.incidentSubscriptions[incidentNumber] = false;
    }

    $scope.incidentSubscriptions = PushService.incidentSubscriptions();
    $scope.$on("$ionicView.afterEnter", function (event, data) {
        // handle event
        console.log("$ionicView.afterEnter : " + $scope.searchincident);
        if (typeof $scope.searchincident !== 'undefined' &&  $scope.searchincident !== null)  {
            console.log("scroll to top");
            $ionicScrollDelegate.scrollTop();
            $scope.searchincident = null;
        }
        var forwardView = $ionicHistory.forwardView();

        if (angular.isDefined(forwardView) && forwardView != null) {
            console.log("Forward view : " + JSON.stringify(forwardView));
            console.log("Current incident on view : " + JSON.stringify($scope.data.incident));
            console.log("length: " + $scope.data.incident.workinfo[0].length + $scope.data.incidentmaster.workinfo[0].length);
            if (forwardView.stateName == "app.contacts") {
                if($scope.data.incident.workinfo.length > $scope.data.incidentmaster.workinfo.length) {
                    $scope.editWorkInfo($scope.data.incident.workinfo[0]);
                    $scope.data.incident.more = true;
                }
            }
        }
    });

    // retrieve current incidents

    $ionicLoading.show({
        template: 'Loading Incidents...'
    }).then(function () {
        console.log("The loading indicator is now displayed");
    });


    $scope.doRefresh = function () {
        console.log("doRefresh");
        IncidentService.query($scope.searchincident).then(function (responseData) {
            console.log("refresh");
            $scope.data.incidents = responseData;
            //console.log('incidents', JSON.stringify($scope.data.incidents));
        }).finally(function () {
            // Stop the ion-refresher from spinning

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
        });

    };
    $scope.doRefresh();

    // show incident details
    $scope.onTap = function (item) {
        item.doc.more = !item.doc.more;
    }

    // scroll top
    $scope.scrollTop = function () {
        console.log("scroll - top");
        $ionicScrollDelegate.scrollTop();
    };

    // Create the incident modal 
    $ionicModal.fromTemplateUrl('templates/incidentModal.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.incidentmodal = modal;
        console.log("incident model dialog created");
    });

    // show incident
    $scope.showIncident = function (item) {
        console.log("show incidentModel");
        if (angular.isDefined(item)) {
            console.info("Edit incident");
            console.log("Work infor shown:" + $scope.workinfomodal.isShown());
            var active = document.getElementsByClassName('rm-workinfo-modal')
            if (angular.isDefined(active[0])) {
                var parentNode = active[0].parentNode.parentNode;
                parentNode.className = parentNode.className + " rm-incident-modal";
            }
            $scope.data.incident = item;
            $scope.data.incidentmaster = angular.copy(item);
            $scope.addIncident = false;
        }
        else {
            console.info("Add incident");
            $scope.form.incidentForm.$setPristine();
            $scope.data.incident = new incident();
            $scope.data.incidentmaster = new incident();
            $scope.isincident = true;
            $scope.addIncident = true;
        }

        $scope.incidentmodal.show();
    };


    // Triggered in the incident modal to close it
    $scope.closeIncident = function (incident) {
        console.info("Form valid" + $scope.form.incidentForm.$valid);

        if (!angular.isDefined(incident)) {
            console.log("incident close or cancelled");
            // close or cancel
            angular.copy($scope.data.incidentmaster, $scope.data.incident);
            
        }
        else {
            //TODO
            console.log("Save incident");
            if ($scope.form.incidentForm.$valid) {
                $scope.data.incident.lastmodifieduser = $scope.user.name;
                $scope.data.incident.lastmodifiedtime = new Date();
                IncidentService.save($scope.data.incident);
                if ($scope.addIncident) {
                    console.info("Form valid - creating incident" + $scope.form.incidentForm.$valid);
                    PushService.createTag($scope.data.incident.incidentnumber, $scope.data.incident.summary);
                    //PushService.share(['SHARE'], $scope.data.incident.summary, $scope.data.incident.incidentnumber);
                }
                console.log("Saving incidnet: " + JSON.stringify($scope.data.incident));
            }
        }
        $scope.incidentmodal.hide();


    };

    // Toggle between incident and workinfo
    $scope.ontoggleincident = function (isincident) {
        console.log("ontoggleincident");
        if (!$scope.addIncident) {
            $scope.isincident = !isincident;
        }
    }

    $scope.reorderItem = function (workinfo, fromIndex, toIndex) {
        $scope.data.incident.workinfo.splice(fromIndex, 1);
        $scope.data.incident.workinfo.splice(toIndex, 0, workinfo);
    };

    // Create the workinfo modal
    $ionicModal.fromTemplateUrl('templates/workinfoModal.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.workinfomodal = modal;
        console.log("Workinfo model dialog created");
    });

    // show workinfo modal
    $scope.addWorkInfo = function (item) {
        console.log("add workinfo");
        // add workinfo
        $scope.data.workinfoAdd = true;
        $scope.data.incident = item;
        $scope.data.workinfo = new workinfo();
        $scope.workinfomodal.show();
    };

    // show workinfo modal
    $scope.editWorkInfo = function (item) {
        console.log("edit workinfo");
        // edit workinfo
        if ($scope.incidentmodal.isShown()) {
            $ionicListDelegate.closeOptionButtons();
        }
        $scope.data.workinfomaster = angular.copy(item);
        $scope.data.workinfo = item;
        $scope.data.workinfoAdd = false;
        $scope.workinfomodal.show();
    };

    // Triggered in the workinfo modal to close it
    $scope.closeWorkInfo = function (workinfo) {
        console.log(workinfo);
        if (angular.isDefined(workinfo)) {
            // add or edit
            workinfo.date = new Date();
            workinfo.user = $scope.user.name;
            console.log("Work info add : " + $scope.data.workinfoAdd);
            if ($scope.data.workinfoAdd) {
                $scope.data.incident.workinfo.unshift(workinfo);
                console.info("Save incident");
            }
            IncidentService.save($scope.data.incident);
            //TODO notification
            console.log("work info: " + JSON.stringify(workinfo));
            printIncidents();
        } else {
            // close or cancel
            angular.copy($scope.data.workinfomaster, $scope.data.workinfo);
        }
        $scope.workinfomodal.hide();

    };

    $scope.emailIncident = function (item) {
        $scope.data.incident = item;
        EmailService.sendIncidentSummary($scope);
    };

    var printIncidents = function () {
        for (var i = $scope.data.incidents.length - 1; i >= 0; i--) {
            console.log(JSON.stringify($scope.data.incidents[i]));
        };
    }

    $scope.search = false;

    $scope.onSearch = function () {
        $scope.search = !$scope.search;
    }

    $scope.assess = false;

    $scope.onAssess = function (state) {
        console.log("onAssess");
        $scope.scrollTop();
        state = !state;
    }

    $ionicModal.fromTemplateUrl('templates/shareModal.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.sharemodal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/emailModal.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.emailmodal = modal;
    });

    $scope.data.email = {incident:{}, userlist:[], emailto:[]};
    $scope.showEmail = function (incident) {
        console.log("Show Email modal : " + incident);
        $scope.data.email.incident = incident;
        $scope.data.email.userlist = ContactsDataService.getUsers();
        console.log("users : " + JSON.stringify($scope.data.email.userlist));
        $scope.emailmodal.show();
    };

    // Triggered in the resolver note modal to close it
    $scope.closeEmail = function (incident) {
        console.log("closeEmail : " + incident);
        $scope.emailmodal.hide();
        
        if (angular.isDefined(incident) && incident != null) {
            for (var index = 0; index < $scope.data.email.userlist.length; index++) {
                var element = $scope.data.email.userlist[index];
                if (element.checked) {
                    $scope.data.email.emailto.push(element.doc.email);
                }
            } 
            console.log("emailto : " + JSON.stringify($scope.data.email.emailto)); 
            EmailService.sendIncidentSummary($scope);         
        }
    };

    $scope.data.share = { item: {}, title: {}, userlist: [] };
    $scope.showShare = function (shareItem) {
        $ionicLoading.show();
        console.log("Show Share modal");
        $scope.data.share.item = shareItem;
        $scope.data.deviceusers = PushService.getDeviceUsers();
        PushService.subscribers("SHARE").then(function (response) {
            //console.log("subscribers :" + JSON.stringify(response));
            $scope.data.share.title = "Share Incident";
            $scope.data.share.userlist = response;
            $scope.sharemodal.show();
        }).catch(function (err) {
            console.error(JSON.stringify(err));
        }).finally(function () {
            $ionicLoading.hide();
        });

    };
    // Triggered in the resolver note modal to close it
    $scope.closeShare = function (shareItem) {
        console.log("closeShare");
        $scope.sharemodal.hide();
    };

    $scope.share = function (shareItem) {
        console.log("Sharing..." + JSON.stringify(shareItem));
        //console.log("User list : " + JSON.stringify($scope.data.share.userlist));
        var deviceIds = [];
        for (var index = 0; index < $scope.data.share.userlist.length; index++) {
            var element = $scope.data.share.userlist[index];
            if (element.checked) {
                deviceIds.push(element.deviceId);
            }
        }
        var share = {
            "message": {
                "alert": shareItem.summary,
                "url": "app.incidents"
            },
            "params": {
                "incidentId": shareItem.incidentnumber
            },
            "target": {
                'deviceIds': deviceIds
            }
        };
        console.log(JSON.stringify(share));
        PushService.share(share);
        $scope.sharemodal.hide();
    }

    $scope.showActionsheet = function (incident) {
        // store current incident

        $scope.data.incident = incident;
        $scope.data.incidentmaster = angular.copy(incident);
        $ionicActionSheet.show({
            titleText: 'Share incident: ' + incident.incidentnumber,
            buttons: [
                { text: '<i class="icon ion-ios-telephone"></i> Call' },
                { text: '<i class="icon ion-email"></i> Email' },
                { text: '<i class="icon ion-social-whatsapp"></i> Group Chat' },
                { text: '<i class="icon ion-android-notifications"></i> Notify' },
            ],
            cancelText: 'Cancel',
            cancel: function () {
                console.log('CANCELLED');
            },
            buttonClicked: function (index) {
                console.log('BUTTON CLICKED', index);
                switch (index) {
                    case 0:
                        console.log("Navigating to contacts page");
                        $state.go("app.contacts", { 'incidentId': incident.incidentnumber });
                        break;
                    case 1:
                        console.log("Emailing");
                        //$scope.emailIncident(incident);
                        $scope.showEmail(incident);
                        break;
                    case 2:
                        console.log("Starting whatsapp");
                        window.open('whatsapp://send?text=' + incident.incidentnumber + " : " + incident.summary, '_system', 'location=no');
                        break;
                    case 3:
                        console.log("Sharing");
                        $scope.showShare(incident);
                        break;
                    default:
                        console.error('Action not found');
                }
                return true;
            },
            cssClass: 'rm-action-sheet'
        });
    };

})

randmControllers.controller('KnowledgeCenterCtrl', function($scope) {

	console.log("KnowledgeCenterCtrl");
});
randmControllers.controller("LoginCtrl", function ($scope, $ionicHistory, $localstorage, $ionicLoading, AuthenticationService, PushService) {
    console.log("LoginController");

    var isWebView = ionic.Platform.isWebView();
    console.log("Platform : " + ionic.Platform.platform());
    console.log("isWebView : " + isWebView);
    $scope.loginSuccess = true;

    var updatePushSubscriptions = function() {
        PushService.addMobileDevice();
        PushService.getSubscriptions();
    }

    $scope.googleLogin = function () {
        console.log("googleLogin");
        console.log("User : " + JSON.stringify($scope.user.name));
        if (isWebView) {
            console.log("User : " + JSON.stringify($scope.user.name));
            $ionicLoading.show();
            var googleLogin = AuthenticationService.google();
            googleLogin.then(function (profile) {
                console.log("profile :: " + profile);
                $scope.user = profile;
                $scope.loginSuccess = true;
                $localstorage.setObject("user", $scope.user);
                updatePushSubscriptions();
                $ionicLoading.hide();
                $ionicHistory.goBack();
            }, function (err) {
                console.log('login failed' + JSON.stringify(err));
                $scope.loginSuccess = false;
                $ionicLoading.hide();
            });
        }
    };

    $scope.facebookLogin = function () {
        console.log("facebookLogin");
        if (isWebView) {
            $ionicLoading.show();
            var facebookLogin = AuthenticationService.facebook();
            facebookLogin.then(function (profile) {
                console.log("profile :: " + profile);
                $scope.user = profile
                $scope.loginSuccess = true;
                $localstorage.setObject("user", $scope.user);
                updatePushSubscriptions();
                $ionicLoading.hide();
                $ionicHistory.goBack();
            }, function (err) {
                console.log('login failed' + JSON.stringify(err));
                $scope.loginSuccess = false;
                $ionicLoading.hide();
            });
        }
    };

    $scope.anonymousLogin = function () {
        console.log("anonymous login")
        if (!window.cordova) {
            console.log("Browser mode");
            $scope.user.login = true;
            $localstorage.setObject("user", $scope.user);
        }
        $ionicHistory.goBack();
    };
});

randmControllers.controller("LogoutCtrl", function ($scope, $ionicHistory, $localstorage, $state, AuthenticationService) {
    console.log("LogoutCtrl");
    $scope.logout = function () {
        AuthenticationService.logout();
        $scope.user = AuthenticationService.user;
        console.log(JSON.stringify($scope.user));
        $localstorage.setObject("user", $scope.user);
            
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });
        $ionicHistory.clearCache().then(function(){
            $state.go('app.dashboard');
        })
       

        
    }
});

randmControllers.controller("MonitoringSummaryCtrl", function($scope, $state, monitoringService, $ionicLoading, MonitoringTests) {
    console.log("MonitoringSummaryCtrl");

    $scope.monitoringresults = monitoringService.getMonitoringResults();
 
    $scope.doRefresh = function() {
          monitoringService.query().finally(function(){
              $scope.$broadcast('scroll.refreshComplete');
          });
    };


});

randmControllers.controller("MonitoringCtrl", function($scope, $state, $stateParams, monitoringService, $ionicLoading, MonitoringTests) {
    console.log("MonitoringCtrl");
    console.log("env :"+ $stateParams.env);

    /*    $scope.activeButton = 'ALL';

        $scope.type = "Line";
        $scope.labels = ["8:00 am", "8:15 am", "8:30 am", "8:45 am", "9:00 am", "9:15 am", "9:30 am", "9:45 am"];
        $scope.series = ['SRP P', 'SRP F', 'BBRP P', 'BBRP F'];
        $scope.data = [
            [6, 3, 1, 4, 5, 6, 6, 5],
            [0, 2, 5, 2, 1, 0, 0, 1],
            [5, 4, 3, 5, 4, 5, 5, 4],
            [0, 1, 2, 0, 1, 0, 0, 1]
        ];

        $scope.toggleLine = function() {
            $scope.type = $scope.type === 'Line' ?
                'Bar' : 'Line';
        };

        $scope.togglePie = function() {
            $scope.typeP = $scope.typeP === 'Doughnut' ?
                'Pie' : 'Doughnut';
        };

        $scope.typeP = "Doughnut";

        $scope.labelsP = ["S P", "S F", "B P", "B F"];
        $scope.seriesP = ["SRP Passed", "SRP Failed", "BBRP Passed", "BBRP Failed"];
        $scope.dataP = [300, 300, 200, 400];

        $scope.onBBRP = function() {
            $scope.activeButton = 'BBRP';
            $scope.type = "Line";
            $scope.labels = ["8:00 am", "8:15 am", "8:30 am", "8:45 am", "9:00 am"];
            $scope.series = ['BBRP P', 'BBRP F'];
            $scope.data = [
                [6, 3, 1, 4, 5],
                [0, 2, 5, 2, 1]
            ];

            $scope.labelsP = ["BBRP P", "BBRP F"];
            $scope.seriesP = ["BBRP Passed", "BBRP Failed"];
            $scope.dataP = [200, 400];
        };

        $scope.onSRP = function() {
            $scope.activeButton = 'SRP';
        };

        $scope.onALL = function() {
            $scope.activeButton = 'ALL';

            $scope.labels = ["8:00 am", "8:15 am", "8:30 am", "8:45 am", "9:00 am", "9:15 am", "9:30 am", "9:45 am"];
            $scope.series = ['SRP P', 'SRP F', 'BBRP P', 'BBRP F'];
            $scope.data = [
                [6, 3, 1, 4, 5, 6, 6, 5],
                [0, 2, 5, 2, 1, 0, 0, 1],
                [5, 4, 3, 5, 4, 5, 5, 4],
                [0, 1, 2, 0, 1, 0, 0, 1]
            ];


            $scope.labelsP = ["SRP P", "SRP F", "BBRP P", "BBRP F"];
            $scope.seriesP = ["SRP Passed", "SRP Failed", "BBRP Passed", "BBRP Failed"];
            $scope.dataP = [300, 300, 200, 400];
        };*/

    //$ionicLoading.show();
    $scope.data = {};
    $scope.doRefresh = function() {

          console.log("Env:" + $stateParams.env);
          $scope.data.rows = monitoringService.getMonitoringResults()[$stateParams.env].items;
          //console.log("monitoring - details : " + JSON.stringify($scope.data.rows));
          if ($scope.data.rows.length == 0) {
              monitoringService.query().finally(function(){
                  $scope.$broadcast('scroll.refreshComplete');
              });
          }
          else {
              $scope.$broadcast('scroll.refreshComplete');
          }

    };

    $scope.doRefresh();

    $scope.onTapSenario = function(item) {
        console.log("onTapSenario");
    };


});

randmControllers.controller('MonitoringDetailsScrollCtr', function($scope, monitoringDetailDataService, $stateParams) {

    console.log('MonitoringDetailsScrollCtr')
    var scenarioName = "R1_1_FTER_SRP_Valid";
    if ($stateParams.scenarioName != undefined) {
        scenarioName = $stateParams.scenarioName;
    }

    $scope.title = scenarioName;

    $scope.noMoreItemsAvailable = false;

    $scope.detailsview = {};

    $scope.startTime = new Date();
    $scope.detailsview.searchDate = $scope.startTime;
    $scope.detailsview.searchDateOK = true;
    console.log('startTime before ' + $scope.startTime)
    $scope.startTime.setHours($scope.startTime.getHours() - 3);
    console.log('startTime after ' + $scope.startTime)
    $scope.items = [];

    $scope.dateChange = function() {

        console.log("on Date change " + $scope.detailsview.searchDate);
        if ($scope.detailsview.searchDate != undefined && $scope.detailsview.searchDate < new Date()) {
            $scope.detailsview.searchDateOK = true;
            $scope.items = [];
            $scope.startTime = $scope.detailsview.searchDate;
            $scope.startTime.setHours(21);
            $scope.loadMore();
        } else {
            $scope.detailsview.searchDateOK = false;
        }


    }

    $scope.loadMore = function() {

        console.log('loadMore' + $scope.detailsview.searchDate);

        if ($scope.items.length >= 50) {
            $scope.noMoreItemsAvailable = true;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        } else {
            monitoringDetailDataService.queryInterval(scenarioName, $scope.startTime, 3).then(function(responseData) {
                    console.log("monitoringDetailDataService" + responseData.data.rows.length);
                    if (responseData.data.rows.length > 0) {
                        responseData.data.rows.sort(function(a, b) {
                            //console.log("berfore" + new Date(a.doc.transactionStartTime).toLocaleString());
                            //console.log("after" + new Date(a.doc.transactionStartTime));
                            a.doc.transactionStartTime = new Date(a.doc.transactionStartTime).getTime();
                            b.doc.transactionStartTime = new Date(b.doc.transactionStartTime).getTime();
                            //console.log("after" + new Date(a.doc.transactionStartTime).toLocaleString());
                            return (a.doc.transactionStartTime - b.doc.transactionStartTime);
                        });
                        responseData.data.rows = responseData.data.rows.reverse();
                        //console.log('responseData.data.rows', JSON.stringify(responseData.data.rows));
                    }

                    $scope.items = ($scope.items).concat(responseData.data.rows);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    console.log("item lentgth : " + $scope.items.length);
                    $scope.startTime.setHours($scope.startTime.getHours() - 3);
                })
                .finally(function() {
                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });

        }
    };


    //$scope.loadMore();

})

randmControllers.controller('NotificationsCtrl', function ($q, $scope, $localstorage,$ionicLoading, PushService) {

    console.log("NotificationsCtrl");
    //$scope.push = { 'incidents': false, 'announcements': false, 'share': false };
    $scope.subscriptions =  {};

    $ionicLoading.show({
        template: 'Loading Subscriptions...'
    }).then(function () {
        console.log("The loading indicator is now displayed");
    });
    
    
    $scope.doRefresh = function () {
        PushService.subscriptions().then(function(response){
            //console.log("All subscriptions : " + JSON.stringify(response));
            $scope.subscriptions = response;
        }).catch(function(err) {
            console.error('ERR', JSON.stringify(err));

        }).finally(function() {
            console.log("finally");
            $ionicLoading.hide();
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    };


   $scope.doRefresh();

    $scope.pushNotificationChange = function (tagName, checked) {
        //console.log("Push change : " + JSON.stringify($scope.subscriptions));
        if (checked) {
            console.log("subscribe to push");
            PushService.subscribe(tagName);
        } else {
            console.log("unsubscribe to push");
            PushService.unsubscribe(tagName);
        }

    };
});
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