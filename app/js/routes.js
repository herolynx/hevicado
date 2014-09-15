'use strict';

var routes = angular.module('angular-base.routes', []);

/**
 * Configure routing rules between application states
 * @param $stateProvider application state manager
 * @param $urlRouterProvider application URL manager
 * @param ACCESS_LEVELS available access levels in application
 */
routes.config(function ($stateProvider, $urlRouterProvider, ACCESS_LEVELS) {
    //
    // for any unmatched url, redirect to /login
    $urlRouterProvider.otherwise("/login");
    //
    // access level: PUBLIC (access for not logged in users)
    $stateProvider.
        state('login', {
            url: "/login",
            templateUrl: "modules/bolt/partials/login.html",
            data: {
                access: ACCESS_LEVELS.PUBLIC
            }
        }).
        state('registration', {
            url: "/registration",
            templateUrl: "modules/users/partials/registration.html",
            data: {
                access: ACCESS_LEVELS.PUBLIC
            }
        }).
        state('default', {
            url: "/public",
            templateUrl: "partials/public.html",
            data: {
                access: ACCESS_LEVELS.PUBLIC
            }
        }).
        state('public', {
            url: "/public",
            templateUrl: "partials/public.html",
            data: {
                access: ACCESS_LEVELS.PUBLIC
            }
        });
    //
    // access level: USER (logged in users)
    $stateProvider.
        state('default-user', {
            url: "/private",
            templateUrl: "partials/private.html",
            data: {
                access: ACCESS_LEVELS.USER
            }
        }).
        state('user-profile', {
            url: "/user-profile",
            templateUrl: "modules/users/partials/user-profile.html",
            data: {
                access: ACCESS_LEVELS.USER
            }
        }).
        state('private', {
            url: "/private",
            templateUrl: "partials/private.html",
            data: {
                access: ACCESS_LEVELS.USER
            }
        }).
        state('dashboard', {
            url: "/dashboard",
            templateUrl: "modules/dashboard/partials/dashboard.html",
            controller: 'DashboardCtrl',
            data: {
                access: ACCESS_LEVELS.USER
            }
        }).
        state('calendar', {
            url: "/calendar",
            templateUrl: "modules/chronos/partials/calendar.html",
            controller: 'DashboardCtrl',
            data: {
                access: ACCESS_LEVELS.USER
            }
        }).
        state('calendar-events', {
            url: "/calendar-events",
            templateUrl: "modules/chronos/partials/calendar-events.html",
            controller: 'DashboardCtrl',
            data: {
                access: ACCESS_LEVELS.USER
            }
        });
    //
    // access level: ADMIN
    $stateProvider.
        state('admin', {
            url: "/admin",
            templateUrl: "partials/admin.html",
            data: {
                access: ACCESS_LEVELS.ADMIN
            }
        });
});

