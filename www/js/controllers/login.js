randmControllers.controller("LoginCtrl", function ($scope, $ionicHistory, $localstorage, $ionicLoading, AuthenticationService, PushService) {
    console.log("LoginController");

    var isWebView = ionic.Platform.isWebView();
    console.log("Platform : " + ionic.Platform.platform());
    console.log("isWebView : " + isWebView);
    $scope.loginSuccess = true;

    var updatePushSubscriptions = function() {
        PushService.addMobileDevice();
        PushService.getSubscriptions();
    }

    $scope.googleLogin = function () {
        console.log("googleLogin");
        console.log("User : " + JSON.stringify($scope.user.name));
        if (isWebView) {
            console.log("User : " + JSON.stringify($scope.user.name));
            $ionicLoading.show();
            var googleLogin = AuthenticationService.google();
            googleLogin.then(function (profile) {
                console.log("profile :: " + profile);
                $scope.user = profile;
                $scope.loginSuccess = true;
                $localstorage.setObject("user", $scope.user);
                updatePushSubscriptions();
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
            var facebookLogin = AuthenticationService.facebook();
            facebookLogin.then(function (profile) {
                console.log("profile :: " + profile);
                $scope.user = profile
                $scope.loginSuccess = true;
                $localstorage.setObject("user", $scope.user);
                updatePushSubscriptions();
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

randmControllers.controller("LogoutCtrl", function ($scope, $ionicHistory, $localstorage, $state, AuthenticationService) {
    console.log("LogoutCtrl");
    $scope.logout = function () {
        AuthenticationService.logout();
        $scope.user = AuthenticationService.user;
        console.log(JSON.stringify($scope.user));
        $localstorage.setObject("user", $scope.user);
            
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });
        $ionicHistory.clearCache().then(function(){
            $state.go('app.dashboard');
        })
       

        
    }
});
