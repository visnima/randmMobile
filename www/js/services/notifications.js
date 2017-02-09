//factory for processing push notifications.
randmServices.factory('PushService', function ($q, $http, $state, $localstorage, AuthenticationService, PushEndpoint) {

    var applicationId = "4562bb79-99c7-45b1-a062-cd043431ea6d";
    var clientSecret = "25ef6b14-2d2b-485a-9fab-f9324f9f99a1";
    var appSecret = "a864d6c4-6555-4e16-8283-a12520a48aa2";
    var senderID = "1017710972026";

    var registrationid;
    var uuid;

    var pushDevice = {};
    var subscriptions = {};
    var subscribedTags = {};
    var deviceSubscriptions;
    var tags;
    var incidentSubscription = {};
    var devices;
    var deviceUsers = {};

    var patt = /INC[0-9]*$/;

    //success callback for when a message comes in
    var pushReceived = function (info) {
        console.log("registerListener - ");
        //alert('got a push message! ');
    };

    var getDevices = function () {
        var pushServiceURL = PushEndpoint.url + '/' + applicationId + '/devices';
        $http.get(pushServiceURL).then(function (response) {
            console.log("Devices : " + JSON.stringify(response.data));
            devices = response.data.devices;
            angular.forEach(devices, function (value, key) {
                deviceUsers[value.deviceId] = value.userId;
            });
            console.log("deviceUsers: " + JSON.stringify(deviceUsers));
        }).catch(function (err) {
            console.log('Error' + JSON.stringify(err));

        });
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
        console.info("Push Registration id: " + data.registrationId);
        registrationid = data.registrationId;
        // Add device to the push service
        var pushServiceURL = PushEndpoint.url + '/' + applicationId + '/devices/' + uuid;
        $http.get(pushServiceURL).then(function (response) {
            console.log("Device already registered for Push notifications");
            console.log(JSON.stringify(response.data));
            pushDevice = response.data;

        }).catch(function (err) {
            console.log('Error' + JSON.stringify(err));

        });
    };

    var addDevice = function (user) {

        var req = {
            method: 'POST',
            url: PushEndpoint.url + '/' + applicationId + '/devices',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "clientSecret": clientSecret
            },
            data: {
                "createdMode": "randmMobile",
                "deviceId": uuid,
                "platform": "G",
                "token": registrationid,
                "userId": user.name
            }
        };
        console.log("add device request: " + JSON.stringify(req));
        return $http(req).then(function (response) {
            console.log('add device - Success' + JSON.stringify(response));
            pushDevice = response.data;
            return response.data;
        }, function (err) {
            console.error('ERR' + JSON.stringify(err));
        });
    };

    var getDeviceSubcriptions = function (deviceId) {
        console.info("Retrieve all subscriptions for device: " + deviceId);
        var req = {
            method: 'GET',
            url: PushEndpoint.url + '/' + applicationId + '/subscriptions',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            params: {
                "deviceId": deviceId
            },
            timeout: 5000
        }
        return $http(req).then(function (response) {
            console.log('Device Subscriptions - Success ' + JSON.stringify(response));
            deviceSubscriptions = response.data;
            return deviceSubscriptions;
        }, function (err) {
            console.error('ERR - Device Subscriptions' + JSON.stringify(err));
        });
    };

    var getTags = function () {
        console.log("Retrieve all tags");
        var req = {
            method: 'GET',
            url: PushEndpoint.url + '/' + applicationId + '/tags',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }
        return $http(req).then(function (response) {
            console.log('Retrieve tags - Success ' + JSON.stringify(response));
            tags = response.data;
            return tags;
        }, function (err) {
            console.error('ERR' + JSON.stringify(err));
        });
    }

    return {
        initialize: function () {
            console.info('Pushservice  initializing');
            //alert('NOTIFY  initializing');
            console.info("Device id: " + device.uuid);
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
        addMobileDevice: function () {
            console.log("add device");
            console.info('Registrationid: ' + registrationid);
            var user = AuthenticationService.user;
            if (registrationid != '') {
                // if device already added, check user
                if (angular.isDefined(pushDevice.deviceId) && user.login) {
                    console.log("check user and update");
                } else if (user.login) {
                    console.log("add device");
                    addDevice(user);
                }
            }
            else {
                console.log("Push not registered");
                // push initialize
                PushService.initialize();
            }

        },
        subscriptions: function () {
            var deviceId = uuid;
             if (!window.cordova) {
                 deviceId = "TestDeviceId";
             }
            return $q(function (resolve, reject) {
                var subscribedTags = {};
                getDeviceSubcriptions(deviceId).then(function (response) {
                    angular.forEach(response.subscriptions, function (value, key) {
                        console.log("Key : " + key);
                        console.log("tagName : " + value.tagName);
                        subscribedTags[value.tagName] = true;
                    });
                    getTags().then(function (responseData) {
                        console.log("Tags : " + JSON.stringify(responseData));
                        subscriptions = responseData.tags;
                        
                        angular.forEach(subscriptions, function (value, key) {
                            if (angular.isDefined(subscribedTags[value.name])) {
                                value['subscribed'] = true;
                            }
                            else {
                                value['subscribed'] = false;
                            }
                            if (patt.test(value.name)) {
                                incidentSubscription[value.name] = value.subscribed;
                            }
                        });
                        console.log("Subscriptions for tags : " + JSON.stringify(subscriptions));
                        console.log("Incident subscription : " + JSON.stringify(incidentSubscription));
                        resolve(subscriptions);
                    }, function (err) {
                        console.error('ERR', JSON.stringify(err));
                        reject(err);
                    });

                }), function (err) {
                    console.error('ERR', JSON.stringify(err));
                    reject(err);
                };
            });
        },
        subscribe: function (tagName) {
            console.info('Subscribe to Push Notifications, tag: ' + tagName);
            //if (registrationid != '' && angular.isDefined(pushDevice.deviceId)) {
                // subsribing
                uuid = "TestDeviceId";
                var req = {
                    method: 'POST',
                    url: PushEndpoint.url + '/' + applicationId + '/subscriptions',
                    headers: {
                        "appSecret": appSecret,
                        "clientSecret": clientSecret,
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    data: {
                        "deviceId": uuid,
                        "tagName": tagName
                    }
                }
                $http(req).then(function (response) {
                    console.log('subscribe - Success ' + JSON.stringify(response));
                     if (patt.test(tagName)) {
                        incidentSubscription[tagName] = true;
                    }
                }, function (err) {
                    console.error('ERR' + JSON.stringify(err));
                });

            //}
        },
        unsubscribe: function (tagName) {
            console.info('Unsubscribe to Push Notifications');
             if (!window.cordova) {
                 uuid = "TestDeviceId";
             }
            var req = {
                method: 'DELETE',
                url: PushEndpoint.url + '/' + applicationId + '/subscriptions',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "clientSecret": clientSecret
                },
                params: {
                    "deviceId": uuid,
                    "tagName": tagName
                }
            }
            $http(req).then(function (response) {
                console.log('unsubscribe - Success ' + JSON.stringify(response));

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
                    "clientSecret": clientSecret,
                    "Accept": "application/json"
                },
                params: {
                    "tagName": tagName
                }
            }
            return $http(req).then(function (response) {
                console.log('Get Subscription - Success :' + JSON.stringify(response));
                var tagSubscriptions = response.data.subscriptions;
                console.log("tagSubscriptions : " + JSON.stringify(tagSubscriptions));
                return tagSubscriptions;
            });
        },
        createTag: function (tagName, description) {
            console.info('Creating Push tag: ' + tagName);
            var req = {
                method: 'POST',
                url: PushEndpoint.url + '/' + applicationId + '/tags',
                headers: {
                    "appSecret": appSecret,
                    "clientSecret": clientSecret,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                data: {
                    "description": description,
                    "name": tagName
                }
            };
            $http(req).then(function (response) {
                console.log('Creating Push tag - Success :' + JSON.stringify(response));
            }, function (err) {
                console.error('ERR :' + JSON.stringify(err));
            });

        },
        deleteTag: function (tagName) {
            console.info('Deleting Push tag: ' + tagName);
            var req = {
                method: 'POST',
                url: PushEndpoint.url + '/' + applicationId + '/tags',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                params: {
                    "applicationId": applicationId,
                    "tagName": tagName,
                    "appSecret": appSecret
                }
            };
            $http(req).then(function (response) {
                console.log('Deleting Push tag - Success :' + JSON.stringify(response));
            }, function (err) {
                console.error('ERR :' + JSON.stringify(err));
            });
        },
        incidentSubscriptions: function () {
            return incidentSubscription;
        },
        share: function (share) {
            console.info('Share data using Push Notifications');
            var req = {
                method: 'POST',
                url: PushEndpoint.url + '/' + applicationId + '/messages',
                headers: {
                    "appSecret": appSecret,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                data: {
                    "message": share.message,
                    "settings": {
                        "apns": {
                            "payload": {
                                "params": share.params
                            }
                        },
                        "gcm": {
                            "payload": {
                                "params": share.params
                            }
                        }
                    },
                    "target": share.target
                }
            };

            $http(req).then(function (response) {
                console.log('Share using Push - Success :' + JSON.stringify(response));
            }, function (err) {
                console.error('ERR :' + JSON.stringify(err));
            });
        },
        getSubscriptions: function () {
            return subscriptions;
        },
        getDeviceUsers: function () {
            getDevices();
            return deviceUsers;
        }
    }

});
