randmServices.factory('RefreshService', function ($interval, monitoringService) {
    var autoRefreshInterval = "0";
    var autoRefreshCount = "1";

    return {
        getAutoRefreshInverval: function() {
            return autoRefreshInterval;
        },
        setAutoRefreshInterval: function(refreshInterval) {
            autoRefreshInterval = refreshInterval*1000;
        },
        getAutoRefreshCount: function() {
            return autoRefreshCount;
        },
        setAutoRefreshCount: function(refreshCount) {
            autoRefreshCount = refreshCount;
        }

    }
    
});