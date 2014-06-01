'use strict';

angular.module('kunishu',
    [
        'ngRoute',
        'ngCookies',
        'kunishu-auth',
        'kunishu.filters',
        'kunishu.services',
        'kunishu.directives',
        'kunishu.controllers'
    ]
).
    value('version', '0.01').
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/userList', {templateUrl: '/app/partials/userList.html', controller: 'EmptyCtrl'});
        $routeProvider.when('/messages', {templateUrl: '/app/partials/messages.html', controller: 'EmptyCtrl'});
        $routeProvider.when('/calendar', {templateUrl: '/app/partials/calendar.html', controller: 'EmptyCtrl'});
        $routeProvider.when('/login', {templateUrl: '/app/modules/auth/partials/login.html', controller: 'LoginCtrl'});
        $routeProvider.otherwise({redirectTo: '/login'});
    }]).
    config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    });
;
