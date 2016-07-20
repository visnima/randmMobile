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
