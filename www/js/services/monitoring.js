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



