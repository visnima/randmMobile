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