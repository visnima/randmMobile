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
