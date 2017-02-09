var randmServices = angular.module('randm.services', ['randm.constants', 'randm.directives']);

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
randmServices.factory('announcementDataService', function($http, AnnouncementsEndPoint) {

    var announcement; 
    var cloudantUserName = "aidepleveseariveracessed:13bacc0b3e1226e1a6f31d61f92b65c10b856a69";

    return {

        query: function() {
            var req = {
                method: 'GET',
                url: AnnouncementsEndPoint.url + '/_all_docs?include_docs=true&conflicts=true',
                
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic YWlkZXBsZXZlc2Vhcml2ZXJhY2Vzc2VkOjEzYmFjYzBiM2UxMjI2ZTFhNmYzMWQ2MWY5MmI2NWMxMGI4NTZhNjk="
                },
                timeout: 5000
            };
            return $http(req).then(function(response) {
                console.log('Success - query Announcements :', JSON.stringify(response));
                announcements = response.data.rows;
                return announcements;
            }, function(err) {
                console.error('ERR - query Announcements :' + JSON.stringify(err));
                return err;
                // err.status will contain the status code
            });
        },
        update: function(announcement) {
            var req = {
                method: 'PUT',
                url: AnnouncementsEndPoint.url + '/' + announcement._id,
                
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic YWlkZXBsZXZlc2Vhcml2ZXJhY2Vzc2VkOjEzYmFjYzBiM2UxMjI2ZTFhNmYzMWQ2MWY5MmI2NWMxMGI4NTZhNjk="
                },
                timeout: 5000,
                data: announcement
            };
            return $http(req).then(function(response) {
                console.log('Success', JSON.stringify(response));
                return response;
            }, function(err) {
                console.error('ERR', err);
                // err.status will contain the status code
            });
        },
        create: function(announcement) {
            var req = {
                method: 'POST',
                url: AnnouncementsEndPoint.url ,
                
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic YWlkZXBsZXZlc2Vhcml2ZXJhY2Vzc2VkOjEzYmFjYzBiM2UxMjI2ZTFhNmYzMWQ2MWY5MmI2NWMxMGI4NTZhNjk="
                },
                timeout: 5000,
                data: announcement
            };
            return $http(req).then(function(response) {
                console.log('Success', JSON.stringify(response));
                return response;
            }, function(err) {
                console.error('ERR', err);
                // err.status will contain the status code
            });
        }
    }
});
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

randmServices.factory('ContactsDataService', function ($http) {
    var users = [];
    return {
        query: function (scenarioName) {
            var url = "appdata/mock_contacts.json";
            return $http.get(url, { timeout: 3000 }).then(function (response) {
                console.log('query - Success', JSON.stringify(response));
                users = response.data.rows;
                return users;
            }, function (err) {
                console.error('ERR', JSON.stringify(err));
                // err.status will contain the status code
            });
        },
        getUsers: function() {
            return users;
        }
    }
});
randmServices.factory('EmailService', function ($http, $timeout, $compile) {
    var email;
    
    return {
        sendIncidentSummary: function ($scope) {
            console.log("Emailing incident summary email");
            var templateURL = "templates/randm-email.html";
            $http.get(templateURL).success(function (data, status, headers, config) {
                $timeout(function () {
                    console.log(data);
                    console.log("incident : " +  JSON.stringify($scope.data.email.incident));
                    console.log("emailto : " + JSON.stringify($scope.data.email.emailto));
                    var templateRendered = $compile(angular.element(data))($scope);
                    $scope.$apply();
                    console.log("templateRendered", templateRendered.html());
                    // send email
                    if (cordova.plugins) {
                        cordova.plugins.email.isAvailable(
                            function (isAvailable) {
                                console.log("Email Service available", isAvailable);
                                var email = {
                                    to: $scope.data.email.emailto,
                                    cc: '',
                                    bcc: ['', ''],
                                    attachments: [
                                        // 'file://img/logo.png',
                                        // 'res://icon.png',
                                        // 'base64:icon.png//iVBORw0KGgoAAAANSUhEUg...',
                                        // 'file://README.pdf'
                                    ],
                                    subject: 'INC' + $scope.data.incident.incidentnumber + ' ' + $scope.data.incident.summary,
                                    body: templateRendered.html(),
                                    isHtml: true
                                };
                                cordova.plugins.email.open(email, function callback(argument) {
                                    // body...
                                    console.log(argument);
                                }, this);
                            }
                        );
                    }

                }, 0);

            });
        }
    };

});
randmServices.factory('IncidentService', function ($http, IncidentsEndPoint) {

    var incidents;
    var cloudantUserName = "catereficemingbitheredis:9726e94b015c66ca60ed807774511f5fd6da5f27";

    var setIncident = function (incident) {
        var found = false;
        for (var index = 0; index < incidents.length; index++) {
            var element = incidents[index];
            if (element.doc.incidentnumber === incident.incidentnumber) {
                incidents[index].doc = incident;
                found = true;
                break;
            }
        }
        if (!found) {
            incident._id = response.data.id;
            incident._rev = response.data.rev;
            var doc = {};
            doc["doc"] = incident;
            incidents.unshift(doc);
        }
    };

    return {
        query: function (incidentnumber) {
            var req = {
                method: 'GET',
                url: IncidentsEndPoint.url + '/_all_docs?include_docs=true&conflicts=true',

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic Y2F0ZXJlZmljZW1pbmdiaXRoZXJlZGlzOjk3MjZlOTRiMDE1YzY2Y2E2MGVkODA3Nzc0NTExZjVmZDZkYTVmMjc="
                },
                timeout: 5000
            }
            // return $http.get('appdata/mock_incident.json', { timeout: 5000 }).then(function (response) {
            return $http(req).then(function (response) {
                console.log('Success - query incidents :', JSON.stringify(response));
                incidents = response.data.rows;
                if (typeof incidentnumber !== 'undefined' && incidentnumber !== null) {
                    console.log("searching for incident : " + incidentnumber);
                    for (var index = 0; index < incidents.length; index++) {
                        var element = incidents[index];
                        console.log("incidentnumber : " + element.doc.incidentnumber);
                        if (element.doc.incidentnumber === incidentnumber) {
                            console.log("incident search successful");
                            var incident = incidents.splice(index, 1);
                            incident[0].doc.more = true;
                            console.log("searched incident : " + JSON.stringify(incident[0]));
                            incidents.unshift(incident[0]);
                            break;
                        }

                    }
                }
                return incidents;
            }, function (err) {
                console.error('ERR - query Incidents : ' + JSON.stringify(err));
                // err.status will contain the status code
            });
        },
        save: function (incident) {
            var req = {
                method: 'POST',
                url: IncidentsEndPoint.url,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic Y2F0ZXJlZmljZW1pbmdiaXRoZXJlZGlzOjk3MjZlOTRiMDE1YzY2Y2E2MGVkODA3Nzc0NTExZjVmZDZkYTVmMjc="
                },
                data: incident
            }

            $http(req).then(function (response) {
                console.log('Create incident - Success :' + JSON.stringify(response));
                setIncident(incident);
            }, function (err) {
                console.error('ERR :' + JSON.stringify(err));
            });
        },
        getIncident: function (incidentnumber) {
            var incident;
            for (var index = 0; index < incidents.length; index++) {
                var element = incidents[index];
                if (element.doc.incidentnumber === incidentnumber) {
                    incident = element.doc;
                    break;
                }

            }
            return incident;
            /*            var returnval = incidents.find(function(incident){
                             return incident.doc.incidentnumber === incidentnumber;
                        });
                        console.log(JSON.stringify(returnval.doc));
                        return returnval.doc;*/
        },
        workinfo: function () {
            return {
                "summary": "",
                "notes": "",
                "date": "",
                "user": ""

            }
        },
        incidents: incidents
    }
});
randmServices.factory('monitoringDetailDataService', function ($http, HealthCheckEndpoint) {
    var viewWindow = new Date();
    viewWindow.setHours(0, 0, 0, 0);

    var viewWindowUnix = function (dateTime, interval) {
        var viewWindowEnd = new Date(dateTime);
        console.log('dateTime : ' + dateTime);
        viewWindowEnd.setHours(viewWindowEnd.getHours() + interval);
        console.log('viewWindowEnd : ' + viewWindowEnd)
        return {
            start: dateTime.getTime(),
            end: viewWindowEnd.getTime()
        };
    };

    var helthDataUrl = function (scenarioName, dateTime, interval) {
        var helthDataUrl1 = HealthCheckEndpoint.url + "/_search/transactionsByNameAndDate?include_docs=true&limit=200&q=scenarioName:"
        var helthDataUrl2 = "+AND+transactionStartTime:%5B" + viewWindowUnix(dateTime, interval).start + "+TO+" + viewWindowUnix(dateTime, interval).end + "%5D";

        return helthDataUrl1 + scenarioName + helthDataUrl2;
    }

    var responseData = {};

    return {
        query: function (scenarioName) {
            var url = helthDataUrl(scenarioName, viewWindow, 24);
            return $http.get(url).then(function (response) {
                //console.log('query - Success', JSON.stringify(response));
                responseData = response;
                return responseData;
            }, function (err) {
                console.error('ERR', JSON.stringify(err));
                // err.status will contain the status code
            });
        },
        queryInterval: function (scenarioName, dateTime, interval) {
            console.log('queryInterval');
            var url = helthDataUrl(scenarioName, dateTime, interval);
            return $http.get(url).then(function (response) {
                //console.log('Success', JSON.stringify(response));
                responseData = response;
                return responseData;
            }, function (err) {
                console.error('ERR', err);
                console.error('ERR', JSON.stringify(err));

                // err.status will contain the status code
            });
        }
    }

});


randmServices.factory('monitoringService', function ($http, $q, HealthCheckEndpoint) {
    var querying = false;
    //var helthDataUrl = HealthCheckEndpoint.url + "/_view/latestTransaction?reduce=true&group_level=1";
    var helthDataUrl = HealthCheckEndpoint.url + "/latestTransaction?reduce=true&group_level=2";
    //var helthDataUrl = "https://ddb2d6fd-f74e-47f0-a758-b72fba205934-bluemix.cloudant.com/sbr2-result/_design/latestTransactionEVTE/_view/latestTransaction?reduce=true&group_level=2";
    var monitoringresults  = {
            EVTE: {
                SRP: {
                    failed: 0, 
                    passed: 0 
                },
                BBRP: {
                    failed: 0,
                    passed: 0
                },
                items:[]
            },
            EVTE3: {
                SRP: {
                    failed: 0,
                    passed: 0
                },
                BBRP: {
                    failed: 0,
                    passed: 0
                },
                items:[]
            },
            PROD: {
                SRP: {
                    failed: 0,
                    passed: 0                   
                },
                BBRP: {
                    failed: 0,
                    passed: 0
                },
                items:[]
            }
        };



    return {
        query: function () {
            console.log("monitoring - query");
            if (querying) {
                console.log("Monitoring - query is running, return");
                return $q(function(resolve, reject) {
                });
            }
            querying = true;
            for (var key in monitoringresults) {
                monitoringresults[key].SRP.failed = 0;
                monitoringresults[key].SRP.passed = 0;
                monitoringresults[key].BBRP.failed = 0;
                monitoringresults[key].BBRP.passed = 0;
                monitoringresults[key].items = [];
            }

            //console.log(JSON.stringify(monitoringresults));

            return $http.get(helthDataUrl, { timeout: 20000 }).then(function (response) {
                //console.log('Success', JSON.stringify(response));
                for (var row in response.data.rows) {
                    response.data.rows[row].value.transactionStartTime =  new Date(response.data.rows[row].value.transactionStartTime)
                    if (response.data.rows[row].value.status == "FAILED") {
                        monitoringresults[response.data.rows[row].key[0]][response.data.rows[row].value.requestType].failed++
                    } else if (response.data.rows[row].value.status == "PASSED") {
                        monitoringresults[response.data.rows[row].key[0]][response.data.rows[row].value.requestType].passed++
                    }
                    monitoringresults[response.data.rows[row].key[0]].items.push(response.data.rows[row]);
                }
                //console.info("monitoringresults" + JSON.stringify(monitoringresults));
                return response;
            }).finally(function(){
                console.log("This is finally");
                querying = false;
            });
        },
        getMonitoringResults: function () {
            return monitoringresults;
        }
    }
});




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

randmServices.factory('RefreshService', function ($interval, monitoringService) {
    var autoRefreshInterval = "0";
    var autoRefreshCount = "1";

    return {
        getAutoRefreshInverval: function() {
            return autoRefreshInterval;
        },
        setAutoRefreshInterval: function(refreshInterval) {
            autoRefreshInterval = refreshInterval*1000;
        },
        getAutoRefreshCount: function() {
            return autoRefreshCount;
        },
        setAutoRefreshCount: function(refreshCount) {
            autoRefreshCount = refreshCount;
        }

    }
    
});