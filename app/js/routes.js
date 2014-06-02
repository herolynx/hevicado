'use strict';

var routes = angular.module('kunishu-routes', []);

/**
 * Configure routing rules between application states
 * @param $stateProvider: application state manager
 * @param $urlRouterProvider application URL manager
 * @param ACCESS_LEVELS: available access levels in application
 */
routes.config(function ($stateProvider, $urlRouterProvider, ACCESS_LEVELS) {
    //
    // for any unmatched url, redirect to /login
    $urlRouterProvider.otherwise("/login");
    //
    // access level: public (access for not logged in users)
    $stateProvider.
        state('login', {
            url: "/login",
            templateUrl: "/app/modules/auth/partials/login.html",
            data: {
                access: ACCESS_LEVELS.public
            }
        })
    //
    // access level: user (logged in users)
    $stateProvider.
        state('calendar', {
            url: "/calendar",
            templateUrl: "/app/partials/calendar.html",
            data: {
                access: ACCESS_LEVELS.user
            }
        }).
        state('messages', {
            url: "/messages",
            templateUrl: "/app/partials/messages.html",
            data: {
                access: ACCESS_LEVELS.user
            }
        })
    //
    // access level: admin
    $stateProvider.
        state('users', {
            url: "/users",
            templateUrl: "/app/partials/userList.html",
            data: {
                access: ACCESS_LEVELS.admin
            }
        })
});

