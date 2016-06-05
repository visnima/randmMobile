var randmServices = angular.module('randm.services', []);

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
randmServices.factory('incidentDataService', function($http) {

    var responseData;

    return {
        query: function() {
            return $http.get('appdata/mock_incident.json').then(function(response) {
                console.log('Success', JSON.stringify(response));
                responseData = response.data;
                return responseData;
            }, function(err) {
                console.error('ERR', err);
                // err.status will contain the status code
            });
        }
    }
})
//factory for processing push notifications.
randmServices.factory('PushService', function($http, $state, PushEndpoint) {

        var applicationId = "4562bb79-99c7-45b1-a062-cd043431ea6d";
        var senderID = "1017710972026";

        var registrationid;
        var uuid;

        var pushDevice = {};

        //success callback for when a message comes in
        var pushReceived = function(info) {
            console.log("registerListener - ");
            //alert('got a push message! ');
        };

        var onNotificationConfirm = function(buttonIndex, data) {
            console.log("onNotificationConfirm", JSON.stringify(data));
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

        var pushRegistered = function(data) {
            console.info("Push Registered");
            registrationid = data.registrationId;
            // Add device to the push service
            var pushServiceURL = PushEndpoint.url + '/' + applicationId + '/devices/' + uuid;
            $http.get(pushServiceURL).then(function(response) {
                console.log("device already added", JSON.stringify(response));
                pushDevice = response.data;

            }).catch(function(err) {
                console.log('Error', JSON.stringify(err));

            });
        }

        return {
            initialize: function() {
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

                push.on('registration', function(data) {
                    console.log("Push - registered", data.registrationId);
                    pushRegistered(data);
                });

                push.on('notification', function(data) {
                    console.log("notification received", JSON.stringify(data));
                    navigator.notification.confirm(data.message, function(buttonIndex) {
                        onNotificationConfirm(buttonIndex, data);
                    }, "R & M notification", ["Cancel", "Ok"]);
                    // data.message,
                    // data.title,
                    // data.count,
                    // data.sound,
                    // data.image, 
                    // data.additionalData
                });

                push.on('error', function(e) {
                    console.log("Push Error", e.message);
                });

            },
            subscribe: function() {
                console.info('Subscribe to Push Notifications');
                console.info('Registrationid' + registrationid);
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
                        var req = {
                            method: 'POST',
                            url: PushEndpoint.url + '/' + applicationId + '/devices',
                            headers: {

                            },
                            data: {
                                "createdMode": "randmMobile",
                                "deviceId": uuid,
                                "platform": "G",
                                "token": registrationid,
                                "userId": "TestUser"
                            }
                        };

                        $http(req).then(function(response) {
                            console.log('add device - Success', JSON.stringify(response));
                            pushDevice = response.data;
                        }, function(err) {
                            console.error('ERR', JSON.stringify(err));
                        });
                    }
                    // TODO:: subscriptions for tags

                }
            },
            unsubscribe: function() {
                console.info('Unsubscribe to Push Notifications');
                var req = {
                    method: 'DELETE',
                    url: PushEndpoint.url + '/' + applicationId + '/devices/' + uuid,
                    headers: {

                    },
                    data: {}
                };

                $http(req).then(function(response) {
                    console.log('delete device - Success', JSON.stringify(response));
                    pushDevice = {};
                }, function(err) {
                    console.error('ERR', JSON.stringify(err));
                });
            },
            share: function() {
                console.info('Share data using Push Notifications');
                var req = {
                    method: 'POST',
                    url: PushEndpoint.url + '/' + applicationId + '/messages',
                    headers: {
                        "appSecret": "a864d6c4-6555-4e16-8283-a12520a48aa2"
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
                        }

                    }
                };

                $http(req).then(function(response) {
                    console.log('Share using Push - Success', JSON.stringify(response));
                }, function(err) {
                    console.error('ERR', JSON.stringify(err));
                });
            }
        }

    });