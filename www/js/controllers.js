var randmControllers = angular.module('randmMobile.controllers', ['randm.services', 'chart.js']);

randmControllers.controller('AppCtrl', function($scope, $ionicModal, $timeout, $localstorage) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
            $scope.closeLogin();
        }, 1000);
    };

    var userProfile = $localstorage.getObject('user');

    console.log(userProfile);
    console.log(JSON.stringify(userProfile));

    if (angular.isUndefined(userProfile.name)) {
        console.log("userProfile not defined");
        var user = {
            'name': "Anonymous",
            'loginTime': new Date(),
            'photo': "img/randm-slate-blue.jpg",
            'email': "",
            'account': "",
            'login': false
        };
    } else {
        console.log("userProfile not defined");
        var user = {
            'name': "Anonymous",
            'loginTime': new Date(),
            'photo': "img/randm-slate-blue.jpg",
            'email': "",
            'account': "",
            'login': false
        };
    };

    $scope.user = user;


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

randmControllers.controller('AnnouncementsCtrl', function($scope, $ionicPopover, $ionicModal, announcementDataService) {

    console.log("AnnouncementsCtrl");
    $scope.data = {};
    $scope.data.announcements = [];
    // retrieve current announcements
    $scope.getSeverityCSS = function(item){
        console.log("getSeverityCSS");
        if (item.severity == "High") {
            console.log("Hihg")
            return 'item-energized';
        }
    };
    $scope.doRefresh = function () {
        announcementDataService.query().then(function (responseData) {
            console.log("refresh");
            $scope.data.announcements = responseData;
            console.log(JSON.stringify(responseData));
            console.log('announcements', JSON.stringify($scope.data.announcements));
        }).finally(function () {
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.doRefresh();



    $scope.onSwipe = function(){
    	console.log('onSwipe');
    	$scope.checked = true;
    }

    // Create the incident modal 
    $ionicModal.fromTemplateUrl('templates/announcementModal.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.announcementmodal = modal;
        console.log("announcement model dialog created");
    });

    $scope.showAnnouncement = function($event) {
        $scope.announcementmodal.show($event);
    };
    $scope.closeAnnouncement = function() {
        //$scope.closePopover();
        $scope.announcementmodal.hide();
    };

    $scope.popover = {};

    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('templates/announcementsPopover.html', {
        scope: $scope
    }).then(function(popover) {
    	console.log("popover initialized");
        $scope.popover = popover;
    });


    $scope.openPopover = function($event) {
        $scope.popover.show($event);
    };
    $scope.closePopover = function() {
        $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.popover.remove();
    });
    // Execute action on hide popover
    $scope.$on('popover.hidden', function() {
        // Execute action
    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function() {
        // Execute action
    });
});


randmControllers.controller('ContactsCtrl', function($scope) {
	console.log('ContactsCtrl');
});

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
randmControllers.controller('IncidentsCtrl', function ($scope, $ionicModal, $ionicListDelegate, $stateParams, $http, $compile, $timeout, $ionicLoading, RMSelect, incidentDataService, PushService) {
    console.info("IncidentsCtrl");

    console.log("incidentId", $stateParams.incidentId);
    // data for incidents 
    $scope.data = {};
    $scope.data.incidents = [];

    // form data for incident modal
    $scope.isincident = false;
    $scope.data.incidentmaster = {};
    $scope.data.incidentStatusList = RMSelect.statuslist;
    $scope.data.incidentPriorityList = RMSelect.prioritylist;

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
            "doc": {
                "incidentnumber": "",
                "tasknumber": "",
                "summary": "",
                "notes": "",
                "impact": "",
                "status": "",
                "priority": "",
                "createddate": "",
                "createduser": "",
                "lastmodifiedtime": "",
                "lastmodifieduser": "",
                "more": false,
                "workinfo": []
            }
        };
    }


    // data for the workinfor modal
    $scope.data.workinfomaster = {};
    $scope.data.workinfo = new workinfo();
    $scope.data.workinfoAdd = false;
    $scope.data.showDelete = false;
    $scope.data.showReorder = false;
    $scope.data.listCanSwipe = true;

    // retrieve current incidents

    $scope.doRefresh = function () {
        incidentDataService.query().then(function (responseData) {
            console.log("refresh");
            $scope.data.incidents = responseData;
            console.log(JSON.stringify(responseData));
            console.log('incidents', JSON.stringify($scope.data.incidents));
        }).finally(function () {
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.doRefresh();

    // show incident details
    $scope.onTap = function (item) {
        item.doc.more = !item.doc.more;
    }

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
        }
        else {
            console.info("Add incident");
            $scope.data.incident = new incident();
            $scope.data.incidentmaster = new incident();
            $scope.isincident = true;
        }

        $scope.incidentmodal.show();
    };


    // Triggered in the incident modal to close it
    $scope.closeIncident = function (incident) {
        if (!angular.isDefined(incident)) {
            console.log("incident close or cancelled");
            // close or cancel
            angular.copy($scope.data.incidentmaster, $scope.data.incident);
        }
        else {
            //TODO
            console.log("Save incident");
        }
        $scope.incidentmodal.hide();
    };

    // Toggle between incident and workinfo
    $scope.ontoggleincident = function (isincident) {
        console.log("ontoggleincident");
        $scope.isincident = !isincident;
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
                $scope.data.incident.workinfo.push(workinfo);
                //TODO
                console.info("Save incident");
            }
            console.log(JSON.stringify(workinfo));
            printIncidents();
        } else {
            // close or cancel
            angular.copy($scope.data.workinfomaster, $scope.data.workinfo);
        }
        $scope.workinfomodal.hide();

    };

    $scope.emailIncident = function (item) {
        $scope.data.incident = item;
        var templateURL = "templates/randm-email.html";
        $http.get(templateURL).success(function (data, status, headers, config) {
            $timeout(function () {
                console.log(data);
                console.log("incident", JSON.stringify($scope.data.incident));
                var templateRendered = $compile(angular.element(data))($scope);
                $scope.$apply();
                console.log("templateRendered", templateRendered.html());
                // send email
                if (cordova.plugins) {
                    cordova.plugins.email.isAvailable(
                        function (isAvailable) {
                            console.log("Email Service available", isAvailable);
                            var email = {
                                to: '',
                                cc: '',
                                bcc: ['', ''],
                                attachments: [
                                    // 'file://img/logo.png',
                                    // 'res://icon.png',
                                    // 'base64:icon.png//iVBORw0KGgoAAAANSUhEUg...',
                                    // 'file://README.pdf'
                                ],
                                subject: 'INC' + $scope.data.incident.incidentnumber + ' ' + $scope.data.incident.summary,
                                body: templateRendered.html(),
                                isHtml: true
                            };
                            cordova.plugins.email.open(email, function callback(argument) {
                                // body...
                                console.log(argument);
                            }, this);
                        }
                    );
                }

            }, 0);

        });

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

    $scope.onAssess = function () {
        $scope.assess = !$scope.assess;
    }

    $ionicModal.fromTemplateUrl('templates/shareModal.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.sharemodal = modal;
    });

    $scope.data.share = { item: {}, title: {}, userlist: [] };
    $scope.showShare = function (shareItem) {
        $ionicLoading.show();
        console.log("Show Share modal");
        $scope.data.share.item = shareItem;
        PushService.subscribers("SHARE").then(function (responseData) {
            console.log("subscribers :" + JSON.stringify(responseData));
            $scope.data.share.title = "Share Incident";
            $scope.data.share.userlist = responseData.data.subscriptions;
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
        console.log("Sharing...");
        PushService.share();
        $scope.sharemodal.hide();
    }

})

randmControllers.controller('KnowledgeCenterCtrl', function($scope) {

	console.log("KnowledgeCenterCtrl");
});
randmControllers.controller("LoginCtrl", function ($scope, $ionicHistory, $localstorage, $ionicLoading, loginService) {
    console.log("LoginController");

    var isWebView = ionic.Platform.isWebView();
    console.log("Platform : " + ionic.Platform.platform());
    console.log("isWebView : " + isWebView);
    $scope.loginSuccess = true;
    console.log("User : " + JSON.stringify($scope.user));

    $scope.googleLogin = function () {
        console.log("googleLogin");
        console.log("User : " + JSON.stringify($scope.user.name));
        if (isWebView) {
            console.log("User : " + JSON.stringify($scope.user.name));
            $ionicLoading.show();
            var googleLogin = loginService.google();
            googleLogin.then(function (profile) {
                console.log("profile :: " + profile);
                console.log(JSON.stringify($localstorage.getObject("user")));
                $scope.user.name = profile.data.name;
                $scope.user.loginTime = new Date();
                $scope.user.photo = profile.data.picture;
                $scope.user.email = profile.data.email;
                $scope.user.account = "Google";
                $scope.user.login = true;
                $scope.loginSuccess = true;
                $localstorage.setObject("user", $scope.user);
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
            var facebookLogin = loginService.facebook();
            facebookLogin.then(function (profile) {
                console.log("profile :: " + profile);
                console.log(JSON.stringify($localstorage.getObject("user")));
                $scope.user.name = profile.data.name;
                $scope.user.loginTime = new Date();
                $scope.user.photo = profile.data.picture.data.url;
                $scope.user.email = profile.data.email;
                $scope.user.account = "Facebook";
                $scope.user.login = true;
                $scope.loginSuccess = true;
                $localstorage.setObject("user", $scope.user);
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

randmControllers.controller("LogoutCtrl", function ($scope, $ionicHistory, $localstorage, $state, loginService) {
    console.log("LogoutCtrl");
    $scope.logout = function () {
        $scope.user.name = "Anonymous";
        $scope.user.loginTime = new Date();
        $scope.user.photo = "img/randm-slate-blue.jpg";
        $scope.user.email = "";
        $scope.user.account = "";
        $scope.user.login = false;
        $localstorage.setObject("user", $scope.user);
            
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        $state.go('app.dashboard');
    }
});

randmControllers.controller("MonitoringCtrl", function($scope, monitoringService, $ionicLoading, MonitoringTests) {
    console.log("MonitoringCtrl");
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

    $ionicLoading.show();

    $scope.doRefresh = function() {
        monitoringService.query().then(function(responseData) {
            console.log("refresh");
            var row;
            $scope.data = responseData.data;
            for (row in $scope.data.rows) {
                //console.log("Row key : " + $scope.data.rows[row].key);
                // Convert scenarios to english names if they exist
                var scenarioName = $scope.data.rows[row].key;
                if (MonitoringTests.hasOwnProperty(scenarioName)) {
                    $scope.data.rows[row].scenarioName = MonitoringTests[scenarioName].name;
                    $scope.data.rows[row].subsystem = MonitoringTests[scenarioName].subsystem;
                } 
                else {
                    $scope.data.rows[row].scenarioName = scenarioName;
                }
                //console.log("Row new name : " + $scope.data.rows[row].scenarioName);
                //console.log("Row subsystem: " +$scope.data.rows[row].subsystem);
                if ($scope.data.rows[row].value.responseTime === '0') {
                    $scope.data.rows[row].value.responseTime = "-";
                }
                $scope.data.rows[row].value.transactionStartTime = new Date($scope.data.rows[row].value.transactionStartTime);
            }

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
    console.log($scope.data);

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
                        console.log('responseData.data.rows', JSON.stringify(responseData.data.rows));
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

randmControllers.controller('NotificationCtrl', function($scope) {

	console.log("NotificationCtrl");
});
randmControllers.controller('SettingsCtrl', function($q, $scope, $localstorage, PushService) {

	console.log("SettingsCtrl");
    $scope.push = {'evte':false, 'prod':true, 'share':false};
    $localstorage.setObject('PUSH' , $scope.push);
    $scope.push = $localstorage.getObject('PUSH');
    console.log("Push settings: " + JSON.stringify($scope.push));

    $scope.pushNotificationChange = function(tagName, checked) {
        console.log("Push change : " + JSON.stringify($scope.push));
        $localstorage.setObject('PUSH' , $scope.push);
        if (checked) {
            console.log("subscribe to push");
            PushService.subscribe(tagName);
        } else {
            console.log("unsubscribe to push");
            PushService.unsubscribe(tagName);
        }

    };
});