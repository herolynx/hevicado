'use strict';

angular.module('kunishu',
    [
        'ngRoute',
        'kunishu.filters',
        'kunishu.services',
        'kunishu.directives',
        'kunishu.controllers',
        'kunishu-auth.controllers',
        'kunishu-auth.services'
    ]
).
    value('version', '0.01').
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/userList', {templateUrl: '/app/partials/userList.html', controller: 'EmptyCtrl'});
        $routeProvider.when('/messages', {templateUrl: '/app/partials/messages.html', controller: 'EmptyCtrl'});
        $routeProvider.when('/calendar', {templateUrl: '/app/partials/calendar.html', controller: 'EmptyCtrl'});
        $routeProvider.when('/login', {templateUrl: '/app/modules/auth/partials/login.html', controller: 'LoginCtrl'});
        $routeProvider.otherwise({redirectTo: '/login'});
    }]);
