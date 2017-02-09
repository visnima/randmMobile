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
