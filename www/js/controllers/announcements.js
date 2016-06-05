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
