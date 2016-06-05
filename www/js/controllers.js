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
            'loginTime': "28-2 @ 3:30 pm",
            'photo': "img/randm-slate-blue.jpg"
        };
    } else {

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

randmControllers.controller('AnnouncementsCtrl', function($scope, $ionicPopover) {

    console.log("AnnouncementsCtrl");
    $scope.onSwipe = function(){
    	console.log('onSwipe');
    	$scope.checked = true;
    }

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


randmControllers.controller('DashboardCtrl', function($scope) {

	console.log("DashboardCtrl");
});
randmControllers.controller('IncidentsCtrl', function($scope, $ionicModal, $ionicListDelegate, $stateParams, $http, $compile, $timeout, incidentDataService) {
    console.info("IncidentsCtrl");

    console.log("incidentId", $stateParams.incidentId);
    // data for the incidents 
    $scope.data = {};
    $scope.data.incidents = [];

    // form data for the incident modal
    $scope.isincident = false;
    $scope.data.incidentmaster = {};
    $scope.data.incidentStatusList = [{
        "text": "Open",
        "value": "Open"
    }, {
        "text": "Closed",
        "value": "Closed",
    }];

    $scope.data.incidentPriorityList = [{
        "text": "Low",
        "value": "Low"
    }, {
        "text": "Medium",
        "value": "Medium",
    }, {
        "text": "High",
        "value": "High",
    }];

    var workinfo = function() {
        return {
            "summary": "",
            "notes": "",
            "date": "",
            "user": ""
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

    $scope.doRefresh = function() {
        incidentDataService.query().then(function(responseData) {
                console.log("refresh");
                $scope.data.incidents = responseData;
                console.log(JSON.stringify(responseData));
                console.log('incidents', JSON.stringify($scope.data.incidents));
            })
            .finally(function() {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
    };
    $scope.doRefresh();

    // show incident details
    $scope.onTap = function(item) {
        item.doc.more = !item.doc.more;
    }

    // Create the incident modal 
    $ionicModal.fromTemplateUrl('templates/incidentModal.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.incidentmodal = modal;
        console.log("incident model dialog created");
    });

    // show incident
    $scope.showIncident = function(incident) {
        console.log("show incidentModel");
        console.log("Work infor shown:" + $scope.workinfomodal.isShown());
        var active = document.getElementsByClassName('rm-workinfo-modal')
        if (angular.isDefined(active[0])) {
            var parentNode = active[0].parentNode.parentNode;
            parentNode.className = parentNode.className + " rm-incident-modal";
        }
        $scope.data.incident = incident;
        $scope.data.incidentmaster = angular.copy(incident);
        $scope.incidentmodal.show();
    };


    // Triggered in the incident modal to close it
    $scope.closeIncident = function(incident) {
        if (!angular.isDefined(incident)) {
            console.log("incident close or cancelled");
            // close or cancel
            angular.copy($scope.data.incidentmaster, $scope.data.incident);
        }
        $scope.incidentmodal.hide();
    };

    // Toggle between incident and workinfo
    $scope.ontoggleincident = function(isincident) {
        console.log("ontoggleincident");
        $scope.isincident = !isincident;
    }

    $scope.reorderItem = function(workinfo, fromIndex, toIndex) {
        $scope.data.incident.workinfo.splice(fromIndex, 1);
        $scope.data.incident.workinfo.splice(toIndex, 0, workinfo);
    };

    // Create the workinfo modal
    $ionicModal.fromTemplateUrl('templates/workinfoModal.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.workinfomodal = modal;
        console.log("Workinfo model dialog created");
    });

    // show workinfo modal
    $scope.addWorkInfo = function(item) {
        console.log("add workinfo");
        // add workinfo
        $scope.data.workinfoAdd = true;
        $scope.data.incident = item;
        $scope.data.workinfo = new workinfo();
        $scope.workinfomodal.show();
    };

    // show workinfo modal
    $scope.editWorkInfo = function(item) {
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
    $scope.closeWorkInfo = function(workinfo) {
        console.log(workinfo);
        if (angular.isDefined(workinfo)) {
            // add or edit
            workinfo.date = new Date();
            console.log("Work info add : " + $scope.data.workinfoAdd);
            if ($scope.data.workinfoAdd) {
                $scope.data.incident.workinfo.push(workinfo);
            }
            console.log(JSON.stringify(workinfo));
            printIncidents();
        } else {
            // close or cancel
            angular.copy($scope.data.workinfomaster, $scope.data.workinfo);
        }
        $scope.workinfomodal.hide();

    };

    $scope.emailIncident = function(item) {
        $scope.data.incident = item;
        var templateURL = "templates/randm-email.html";
        $http.get(templateURL).success(function(data, status, headers, config) {
            $timeout(function() {
                console.log(data);
                console.log("incident", JSON.stringify($scope.data.incident));
                var templateRendered = $compile(angular.element(data))($scope);
                $scope.$apply();
                console.log("templateRendered", templateRendered.html());
                // send email
                if (window.plugin) {
                    window.plugin.email.isAvailable(
                        function(isAvailable) {
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
                                subject: 'INC' + $scope.data.incident.incidentnumber  + ' ' + $scope.data.incident.summary,
                                body: templateRendered.html(),
                                isHtml: true
                            };
                            window.plugin.email.open(email, function callback(argument) {
                                // body...
                                console.log(argument);
                            }, this);
                        }
                    );
                }

                /*                $cordovaEmailComposer.isAvailable().then(function() {
                                    // is available
                                    console.log("cordovaEmailComposer available");
                                    var email = {
                                        to: 'max@mustermann.de',
                                        cc: 'erika@mustermann.de',
                                        bcc: ['john@doe.com', 'jane@doe.com'],
                                        attachments: [
                                            // 'file://img/logo.png',
                                            // 'res://icon.png',
                                            // 'base64:icon.png//iVBORw0KGgoAAAANSUhEUg...',
                                            // 'file://README.pdf'
                                        ],
                                        subject: 'Cordova Icons',
                                        body: 'How are you? Nice greetings from Leipzig',
                                        isHtml: true
                                    };

                                    $cordovaEmailComposer.open(email).then(null, function() {
                                        // user cancelled email
                                        console.log("cordovaEmailComposer cancelled");
                                    });
                                }, function() {
                                    // not available
                                    console.log("cordovaEmailComposer not available");
                                });*/

            }, 0);

        });

    };

    var printIncidents = function() {
        for (var i = $scope.data.incidents.length - 1; i >= 0; i--) {
            console.log(JSON.stringify($scope.data.incidents[i]));
        };
    }

    $scope.search = false;

    $scope.onSearch = function(){
        $scope.search = !$scope.search;
    }

    $scope.assess = false;

    $scope.onAssess = function(){
        $scope.assess = !$scope.assess;
    }

})
randmControllers.controller("MonitoringCtrl", function($scope) {
    console.log("MonitoringCtrl");
    $scope.activeButton = 'ALL';

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
    };
});
