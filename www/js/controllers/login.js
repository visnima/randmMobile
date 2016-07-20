randmControllers.controller("LoginCtrl", function ($scope, $ionicHistory, $localstorage, $ionicLoading, loginService) {
    console.log("LoginController");

    var isWebView = ionic.Platform.isWebView();
    console.log("Platform : " + ionic.Platform.platform());
    console.log("isWebView : " + isWebView);
    $scope.loginSuccess = true;
    console.log("User : " + JSON.stringify($scope.user));

    $scope.googleLogin = function () {
        console.log("googleLogin");
        console.log("User : " + JSON.stringify($scope.user.name));
        if (isWebView) {
            console.log("User : " + JSON.stringify($scope.user.name));
            $ionicLoading.show();
            var googleLogin = loginService.google();
            googleLogin.then(function (profile) {
                console.log("profile :: " + profile);
                console.log(JSON.stringify($localstorage.getObject("user")));
                $scope.user.name = profile.data.name;
                $scope.user.loginTime = new Date();
                $scope.user.photo = profile.data.picture;
                $scope.user.email = profile.data.email;
                $scope.user.account = "Google";
                $scope.user.login = true;
                $scope.loginSuccess = true;
                $localstorage.setObject("user", $scope.user);
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
            var facebookLogin = loginService.facebook();
            facebookLogin.then(function (profile) {
                console.log("profile :: " + profile);
                console.log(JSON.stringify($localstorage.getObject("user")));
                $scope.user.name = profile.data.name;
                $scope.user.loginTime = new Date();
                $scope.user.photo = profile.data.picture.data.url;
                $scope.user.email = profile.data.email;
                $scope.user.account = "Facebook";
                $scope.user.login = true;
                $scope.loginSuccess = true;
                $localstorage.setObject("user", $scope.user);
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

randmControllers.controller("LogoutCtrl", function ($scope, $ionicHistory, $localstorage, $state, loginService) {
    console.log("LogoutCtrl");
    $scope.logout = function () {
        $scope.user.name = "Anonymous";
        $scope.user.loginTime = new Date();
        $scope.user.photo = "img/randm-slate-blue.jpg";
        $scope.user.email = "";
        $scope.user.account = "";
        $scope.user.login = false;
        $localstorage.setObject("user", $scope.user);
            
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        $state.go('app.dashboard');
    }
});
