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