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