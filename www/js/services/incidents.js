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