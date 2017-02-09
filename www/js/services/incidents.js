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