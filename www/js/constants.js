angular.module('randm.constants', ['ionic'])

    .constant('$ionicLoadingConfig', {
        template: 'Loading..'
    })

    .constant('HealthCheckEndpoint', {
        url: "http://localhost:8100/healthcheck/api"
    })

    .constant('PushEndpoint', {
        url: "http://localhost:8100/push/api"
    })

    .constant('IncidentsEndPoint', {
        url: "http://localhost:8100/incidents/api"
    })

    .constant('AnnouncementsEndPoint', {
        url: "http://localhost:8100/announcements/api"
    })

    .constant('MonitoringTests', {
        /* SRP */
        'IITR_2-7_SRP_Valid_Submit': { 'name': 'IITR Lodge', 'subsystem': 'SRP' },
        'RequestASClientReport': { 'name': 'Request AS Client Report', 'subsystem': 'SRP' },
        'R1_1_FTER_SRP_Valid': { 'name': 'FTER Lodge', 'subsystem': 'SRP' },
        'R1_1_CUREL_SRP_Valid': { 'name': 'Client Relationship Update', 'subsystem': 'SRP' },
        'R1_4_ASLODGE_BAS-A_SRP': { 'name': 'AS Lodge', 'subsystem': 'SRP' },
        'R1_1_FBT_SRP_Valid': { 'name': 'FBT Lodge', 'subsystem': 'SRP' },
        /* BBRP */
        'GetReport_ASClientReport': { 'name': 'Get AS Client Report', 'subsystem': 'BBRP' },
        'R1_1_FTER_BBRP_Valid': { 'name': 'Bulk FTER Lodge', 'subsystem': 'BBRP' },
        'R1_3_CUDTL_BBRP_Valid': { 'name': 'Bulk Client Details Update', 'subsystem': 'BBRP' },
        'R2_4_FVSG-All_BBRP': { 'name': 'Retrieve FVS Register', 'subsystem': 'BBRP' },
        'R1_2_CTR_BBRP_Valid': { 'name': 'Bulk CTR Lodge', 'subsystem': 'BBRP' }
    })

    .constant('RMSelect', {
        'statuslist': [
            { "text": "Open", "value": "Open" }, { "text": "Pending", "value" : "Pending"},{ "text": "Close", "value": "Close" }],
        'severitylist': [
            { "text": "Low", "value": "Low" }, { "text": "Medium", "value": "Medium" }, { "text": "High", "value": "High" }],
        'envlist': [{"text":"Production", "value":"PROD"}, {"text":"Enterprise Test","value":"EVTE"}],
        'refreshintervallist' : [{text:"Now", value:0},{text:5, value:5},{text:10,value:10},{text:20,value:20},{text:30,value:30}],
        'refreshCountlist' : [{text:"Once", value:1},{text:3, value:3},{text:9, value:9},{text:12,value:12},{text:"Unlimited",value:0}]

    });
