randmServices.factory('AuthenticationService', function($http, $location, $window, $q, $timeout) {

    console.log('AuthenticationService'); 

    var deviceUser = {
        name : "Anonymous",
        loginTime : new Date(),
        photo : "img/randm-slate-blue.jpg",
        email : "",
        account : "",
        login : false
    };

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }

    var googleLogin = function() {
        return $q(function(resolve, reject) {
            console.log("Login with googleLogin");

            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            var clientId = "927307371377-k9o6j5du70rpttnjikkea6pdeil2h9e8.apps.googleusercontent.com";
            var clientSecret = "HCZ1V15WAxEpUwCihToD1JNe";

            var ref = window.open('https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=' + clientId + '&redirect_uri=http://localhost/callback&scope=' + 'email profile' + '&state=something', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
            //?client_id=' + clientId + '&redirect_uri=http://localhost/callback&scope=https://www.googleapis.com/auth/urlshortener&approval_prompt=force&response_type=token', '_blank', 'location=no');
            ref.addEventListener('loadstart', function(event) {
                if ((event.url).startsWith("http://localhost/callback")) {
                    console.log("event: " + JSON.stringify(event));
                    var requestToken = (event.url).split("code=")[1];
                    console.log("requestToken" + requestToken);
                    var req = {
                        'method': 'post',
                        'url': 'https://accounts.google.com/o/oauth2/token',
                        'data': 'client_id=' + clientId + '&client_secret=' + clientSecret + '&redirect_uri=http://localhost/callback' + '&grant_type=authorization_code' + '&code=' + requestToken
                    };
                    // var req = {
                    //     method: 'POST',
                    //     url: 'https://www.googleapis.com/oauth2/v4/token',
                    //     headers: {
                    //         'Content-Type': 'application/x-www-form-urlencoded'
                    //     },
                    //     data: {
                    //         "code": requestToken,
                    //         "client_id": clientId,
                    //         "client_secret": clientSecret,
                    //         "redirect_uri": 'http://localhost/callback',
                    //         "grant_type": 'authorization_code'

                    //     }
                    //}
                    console.log(JSON.stringify(req));
                    $http(req).then(function(data) {
                        console.log(" Success - access token: " + JSON.stringify(data));
                        var req = {
                            method: 'GET',
                            url: 'https://www.googleapis.com/oauth2/v2/userinfo',
                            headers: {
                                'Authorization': 'Bearer ' + data.data.access_token
                            }
                        };
                        $http(req).then(function(profile) {
                            console.log("Success - profile: " + JSON.stringify(profile));
                            deviceUser.name = profile.data.name;
                            deviceUser.loginTime = new Date();
                            deviceUser.photo = profile.data.picture;
                            deviceUser.email = profile.data.email;
                            deviceUser.account = "Google";
                            deviceUser.login = true;
                            resolve(deviceUser);
                        }, function(err) {
                            console.log("ERROR - profile: " + JSON.stringify(err));
                            reject(err);
                        });
                    }, function(err) {
                        console.log("ERROR - access_token: " + JSON.stringify(err));
                        reject(err);
                    });
                    ref.close();
                }
            });
        });

    };

    var facebookLogin = function() {
        return $q(function(resolve, reject) {
            console.info("Login with facebookLogin");
            var fbClientId = "844569548985350";
            var fbClientSecret = "70147d488d2a595eb37a014a4e615bd9";
            var browserRef = window.open("https://www.facebook.com/v2.0/dialog/oauth?client_id=" + fbClientId + "&redirect_uri=http://localhost/callback&response_type=token&scope=public_profile,email", "_blank", "location=no,clearsessioncache=yes,clearcache=yes");
            // browserRef.addEventListener("exit", function(event) {
            // 	console.log("ERROR - Browser Closed");
            //     reject("The Facebook sign in flow was canceled");
            // });
            browserRef.addEventListener("loadstart", function(event) {
                if ((event.url).indexOf("http://localhost/callback") === 0) {
                    // browserRef.removeEventListener("exit", function(event) {});
                    browserRef.close();
                    var responseParameters = ((event.url).split("#")[1]).split("&");
                    var parsedResponse = {};
                    for (var i = 0; i < responseParameters.length; i++) {
                        parsedResponse[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                    }
                    if (parsedResponse["access_token"] !== undefined && parsedResponse["access_token"] !== null) {
                        console.log(" Success - access_token: " + JSON.stringify(parsedResponse));
                        var req = {
                            method: 'GET',
                            url: 'https://graph.facebook.com/v2.5/me',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            params: {
                                'access_token': parsedResponse["access_token"],
                                'fields': 'id,name,picture,email'
                            }
                        };
                        $http(req).then(function(profile) {
                            console.log("Success - profile: " + JSON.stringify(profile));
                            deviceUser.name = profile.data.name;
                            deviceUser.loginTime = new Date();
                            deviceUser.photo = profile.data.picture.data.url;
                            deviceUser.email = profile.data.email;
                            deviceUser.account = "Facebook";
                            deviceUser.login = true;
                            resolve(deviceUser);
                        }, function(err) {
                            console.log("ERROR - profile: " + JSON.stringify(err));
                            reject(err);
                        });
                    } else {
                        console.log("ERROR - access_token: " + JSON.stringify(err));
                        reject("Problem authenticating with Facebook");
                    }
                }
            });

        })
    };

    return {
        google: function() {
            return googleLogin();
        },
        facebook: function() {
            return facebookLogin();
        },
        logout: function() {
            deviceUser.name = "Anonymous",
            deviceUser.loginTime = new Date(),
            deviceUser.photo = "img/randm-slate-blue.jpg",
            deviceUser.email = "",
            deviceUser.account = "",
            deviceUser.login = false
        },
        user: deviceUser 
    };

});
