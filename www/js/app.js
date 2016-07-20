// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var randmMobile = angular.module('randmMobile', ['ionic', 'randmMobile.controllers']);

randmMobile.run(function($ionicPlatform, PushService) {
    $ionicPlatform.ready(function() {
        console.log("Testing console logging");

        function onDeviceReady() {
            console.log("onDeviceReady");
            PushService.initialize();

        };

        document.addEventListener('deviceready', onDeviceReady, false);
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
});

randmMobile.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'AppCtrl'
        })

    .state('app.login', {
        url: '/login',
        views: {
            'menuContent': {
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            }
        }
    })

    .state('app.logout', {
        url: '/logout',
        views: {
            'menuContent': {
                templateUrl: 'templates/logout.html',
                controller: 'LogoutCtrl'
            }
        }
    })
    .state('app.dashboard', {
        url: '/dashboard',
        views: {
            'menuContent': {
                templateUrl: 'templates/dashboard.html',
                controller: 'DashboardCtrl'
            }
        }
    })

    .state('app.announcements', {
            url: '/announcements',
            views: {
                'menuContent': {
                    templateUrl: 'templates/announcements.html',
                    controller: 'AnnouncementsCtrl'
                }
            }
        })
        .state('app.monitoring', {
            url: '/monitoring',
            views: {
                'menuContent': {
                    templateUrl: 'templates/monitoring.html',
                    controller: 'MonitoringCtrl'
                }
            }
        })
        .state('app.monitoringDetailsScroll', {
            url: "/monitoringDetailsScroll/:scenarioName",
            views: {
                'menuContent': {
                    templateUrl: "templates/monitoringDetailsScroll.html",
                    controller: 'MonitoringDetailsScrollCtr'
                }
            }
        })
        .state('app.incidents', {
            url: '/incidents:incidentId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/incidents.html',
                    controller: 'IncidentsCtrl'
                }
            }
        })
        .state('app.notifications', {
            url: '/notifications',
            views: {
                'menuContent': {
                    templateUrl: 'templates/notifications.html',
                    controller: 'NotificationCtrl'
                }
            }
        })
        .state('app.knowledgeCenter', {
            url: '/knowledgeCenter',
            views: {
                'menuContent': {
                    templateUrl: 'templates/knowledgeCenter.html',
                    controller: 'KnowledgeCenterCtrl'
                }
            }
        })
        .state('app.contacts', {
            url: '/contacts',
            views: {
                'menuContent': {
                    templateUrl: 'templates/contacts.html',
                    controller: 'ContactsCtrl'
                }
            }
        })
        .state('app.settings', {
            url: '/settings',
            views: {
                'menuContent': {
                    templateUrl: 'templates/settings.html',
                    controller: 'SettingsCtrl'
                }
            }
        })
        .state('app.single', {
            url: '/playlists/:playlistId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/playlist.html',
                    controller: 'PlaylistCtrl'
                }
            }
        });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/dashboard');
});
