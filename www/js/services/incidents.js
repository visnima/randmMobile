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