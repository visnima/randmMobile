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



