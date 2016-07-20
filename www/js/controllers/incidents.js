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
