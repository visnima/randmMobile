var randmServices = angular.module('randm.services', ['randm.constants']);

randmServices.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    }
}]);
randmServices.factory('announcementDataService', function($http) {

    var announcement;

    return {
        query: function() {
            return $http.get('appdata/mock_announcements.json').then(function(response) {
                console.log('Success', JSON.stringify(response));
                announcements = response.data;
                return announcements;
            }, function(err) {
                console.error('ERR', err);
                // err.status will contain the status code
            });
        }
    }
});
randmServices.factory('incidentDataService', function($http) {

    var incidents;

    return {
        query: function() {
            return $http.get('appdata/mock_incident.json').then(function(response) {
                console.log('Success', JSON.stringify(response));
                incidents = response.data;
                return incidents;
            }, function(err) {
                console.error('ERR', err);
                // err.status will contain the status code
            });
        }
    }
})
randmServices.factory('loginService', function($http, $location, $window, $q, $timeout) {

    console.log('loginService');

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
                        $http(req).then(function(data) {
                            console.log("Success - profile: " + JSON.stringify(data));
                            resolve(data);

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
                        $http(req).then(function(data) {
                            console.log("Success - profile: " + JSON.stringify(data));
                            resolve(data);
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
        }
    };

});

randmServices.factory('monitoringDetailDataService', function($http, HealthCheckEndpoint) {
    var viewWindow = new Date();
    viewWindow.setHours(0, 0, 0, 0);

    var viewWindowUnix = function(dateTime, interval) {
        var viewWindowEnd = new Date(dateTime);
        console.log('dateTime : ' + dateTime);
        viewWindowEnd.setHours(viewWindowEnd.getHours() + interval);
        console.log('viewWindowEnd : ' + viewWindowEnd)
        return {
            start: dateTime.getTime(),
            end: viewWindowEnd.getTime()
        };
    };

    var helthDataUrl = function(scenarioName, dateTime, interval) {
        var helthDataUrl1 = HealthCheckEndpoint.url + "/_search/transactionsByNameAndDate?include_docs=true&limit=200&q=scenarioName:"
        var helthDataUrl2 = "+AND+transactionStartTime:%5B" + viewWindowUnix(dateTime, interval).start + "+TO+" + viewWindowUnix(dateTime, interval).end + "%5D";

        return helthDataUrl1 + scenarioName + helthDataUrl2;
    }

    var responseData = {};

    return {
        query: function(scenarioName) {
            var url = helthDataUrl(scenarioName, viewWindow, 24);
            return $http.get(url).then(function(response) {
                console.log('query - Success', JSON.stringify(response));
                responseData = response;
                return responseData;
            }, function(err) {
                console.error('ERR', JSON.stringify(err));

                // err.status will contain the status code
            });
        },
        queryInterval: function(scenarioName, dateTime, interval) {
            console.log('queryInterval');
            var url = helthDataUrl(scenarioName, dateTime, interval);
            return $http.get(url).then(function(response) {
                //console.log('Success', JSON.stringify(response));
                responseData = response;
                return responseData;
            }, function(err) {
                console.error('ERR', err);
                console.error('ERR', JSON.stringify(err));

                // err.status will contain the status code
            });
        }
    }

});


randmServices.factory('monitoringService', function($http, HealthCheckEndpoint) {
    var helthDataUrl = HealthCheckEndpoint.url + "/_view/latestTransaction?reduce=true&group_level=1";
    var responseData = {};

    return {
        query: function() {
            return $http.get(helthDataUrl, {timeout:5000}).then(function(response) {
                console.log('Success', JSON.stringify(response));
                responseData = response;
                return responseData;
            });
        }
    }
});




//factory for processing push notifications.
randmServices.factory('PushService', function ($http, $state, $localstorage, PushEndpoint) {

    var applicationId = "4562bb79-99c7-45b1-a062-cd043431ea6d";
    var senderID = "1017710972026";

    var registrationid;
    var uuid;

    var pushDevice = {};

    //success callback for when a message comes in
    var pushReceived = function (info) {
        console.log("registerListener - ");
        //alert('got a push message! ');
    };

    var onNotificationConfirm = function (buttonIndex, data) {
        console.log("onNotificationConfirm" + JSON.stringify(data));
        console.log("url", data.additionalData.url);
        if (buttonIndex == 2) {
            if (angular.isDefined(data.additionalData.url)) {
                if (angular.isDefined(data.additionalData.payload.params)) {
                    $state.go(data.additionalData.url, data.additionalData.payload.params);
                } else {
                    $state.go(data.additionalData.url);
                }

            }

        }

    };

    var pushRegistered = function (data) {
        console.info("Push Registered");
        registrationid = data.registrationId;
        // Add device to the push service
        var pushServiceURL = PushEndpoint.url + '/' + applicationId + '/devices/' + uuid;
        $http.get(pushServiceURL).then(function (response) {
            console.log("device already added");
            console.log(JSON.stringify(response.data));
            pushDevice = response.data;

        }).catch(function (err) {
            console.log('Error' + JSON.stringify(err));

        });
    }

    return {
        initialize: function () {
            console.info('Pushservice  initializing');
            //alert('NOTIFY  initializing');
            console.info('NOTIFY  Device is ready');
            console.info(device.uuid);
            uuid = device.uuid;
            console.info('Registering with GCM');
            var push = PushNotification.init({
                "android": {
                    "senderID": senderID
                },
                "ios": {},
                "windows": {}
            });

            push.on('registration', function (data) {
                console.log("Push - registered: " + data.registrationId);
                pushRegistered(data);
            });

            push.on('notification', function (data) {
                console.log("Notification received: " + JSON.stringify(data));
                navigator.notification.confirm(data.message, function (buttonIndex) {
                    onNotificationConfirm(buttonIndex, data);
                }, "R & M notification", ["Cancel", "Ok"]);
                // data.message,
                // data.title,
                // data.count,
                // data.sound,
                // data.image, 
                // data.additionalData
            });

            push.on('error', function (e) {
                console.log("Push Error" + e.message);
            });

        },
        subscribe: function (tagName) {
            console.info('Subscribe to Push Notifications, tag: ' + tagName);
            console.info('Registrationid: ' + registrationid);
            if (registrationid == '') {
                // push initialize
                PushService.initialize();
            }
            if (registrationid != '') {
                // if device already added, check user
                if (angular.isDefined(pushDevice.deviceId)) {
                    console.log("check user and update");
                } else {
                    console.log("add device");
                    var user = $localstorage.getObject('user');

                    var req = {
                        method: 'POST',
                        url: PushEndpoint.url + '/' + applicationId + '/devices',
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        data: {
                            "createdMode": "randmMobile",
                            "deviceId": uuid,
                            "platform": "G",
                            "token": registrationid,
                            "userId": user.name
                        }
                    };

                    $http(req).then(function (response) {
                        console.log('add device - Success' + JSON.stringify(response));
                        pushDevice = response.data;
                    }, function (err) {
                        console.error('ERR' + JSON.stringify(err));
                    });
                }

                var req = {
                    method: 'POST',
                    url: PushEndpoint.url + '/' + applicationId + '/subscriptions',
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    data: {
                        "deviceId": uuid,
                        "tagName": tagName
                    }
                }
                $http(req).then(function (response) {
                    console.log('Subscription - Success ' + JSON.stringify(response));
                }, function (err) {
                    console.error('ERR' + JSON.stringify(err));
                });

            }
        },
        unsubscribe: function (tagName) {
            console.info('Unsubscribe to Push Notifications');
            var req = {
                method: 'DELETE',
                url: PushEndpoint.url + '/' + applicationId + '/subscriptions',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                params: {
                    "deviceId": uuid,
                    "tagName": tagName
                }
            }
            $http(req).then(function (response) {
                console.log('Subscription - Success ' + JSON.stringify(response));

            }, function (err) {
                console.error('ERR' + JSON.stringify(err));
            });

        },
        subscribers: function (tagName) {
            console.log("Get subscriptions by tagName");
            var req = {
                method: 'GET',
                url: PushEndpoint.url + '/' + applicationId + '/subscriptions',
                headers: {
                    "Accept": "application/json"
                },
                params: {
                    "tagName": tagName
                }
            }
            return $http(req).then(function (response) {
                console.log('Get Subscription - Success :' + JSON.stringify(response));
                return response;
            });
        },
        share: function () {
            console.info('Share data using Push Notifications');
            var req = {
                method: 'POST',
                url: PushEndpoint.url + '/' + applicationId + '/messages',
                headers: {
                    "appSecret": "a864d6c4-6555-4e16-8283-a12520a48aa2",
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                data: {
                    "message": {
                        "alert": "Notification alert message",
                        "url": "app.incidents"
                    },
                    "settings": {
                        "apns": {
                            "payload": {
                                "params": {
                                    "incidentId": "1234567890"
                                }
                            }
                        },
                        "gcm": {
                            "payload": {
                                "params": {
                                    "incidentId": "1234567890"
                                }
                            }
                        }
                    },
                    "target": {
                        "tagNames": ['SHARE']
                    }

                }
            };

            $http(req).then(function (response) {
                console.log('Share using Push - Success :' + JSON.stringify(response));
            }, function (err) {
                console.error('ERR :' + JSON.stringify(err));
            });
        }
    }

});
