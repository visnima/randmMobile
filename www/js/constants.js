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
            { "text": "Open", "value": "Open" }, { "text": "Closed", "value": "Closed" }],
        'prioritylist': [
            { "text": "Low", "value": "Low" }, { "text": "Medium", "value": "Medium" }, { "text": "High", "value": "High" }]

    });
