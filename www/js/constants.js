angular.module('randmMobile.constants', ['ionic'])

.constant('$ionicLoadingConfig', {
    template: 'Loading..'
})

.constant('HealthCheckEndpoint', {
    url: 'http://192.168.1.22:8100/healthcheck/api'
})

.constant('PushEndpoint', {
    url: 'http://192.168.1.22:8100/push/api'
});
