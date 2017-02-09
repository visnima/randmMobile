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