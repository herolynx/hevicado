'use strict';


// Declare app level module which depends on filters, and services
angular.module('kunishu', [
    'ngRoute',
    'kunishu.filters',
    'kunishu.services',
    'kunishu.directives',
    'kunishu.controllers'
]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/userList', {templateUrl: 'partials/userList.html', controller: 'MyCtrl1'});
        $routeProvider.when('/messages', {templateUrl: 'partials/messages.html', controller: 'MyCtrl2'});
        $routeProvider.when('/calendar', {templateUrl: 'partials/calendar.html', controller: 'MyCtrl2'});
        $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'MyCtrl2'});
        $routeProvider.otherwise({redirectTo: '/login'});
    }]);
