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