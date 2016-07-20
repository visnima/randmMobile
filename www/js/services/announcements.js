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