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