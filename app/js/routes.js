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

    /************************* DEFAULT PAGES ***************************************/
    $stateProvider.
    state('default', {
        url: "/main",
        templateUrl: "partials/main.html",
        data: {
            access: ACCESS_LEVELS.PUBLIC
        }
    }).
    state('default-user', {
        url: "/user-profile",
        templateUrl: "modules/users/partials/user-profile.html",
        data: {
            access: ACCESS_LEVELS.USER
        }
    });
    /************************* LOGIN & REGISTRATION ***************************************/
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
    });
    /************************* PUBLIC PAGES ***************************************/
    $stateProvider.
    state('main', {
        url: "/main",
        templateUrl: "partials/main.html",
        data: {
            access: ACCESS_LEVELS.PUBLIC
        }
    });
    /************************* USER MAIN ***************************************/
    $stateProvider.
    state('user-profile', {
        url: "/user-profile",
        templateUrl: "modules/users/partials/user-profile.html",
        data: {
            access: ACCESS_LEVELS.USER
        }
    }).
    state('user-visits', {
        url: "/user-visits",
        templateUrl: "modules/visits/partials/user-visits.html",
        data: {
            access: ACCESS_LEVELS.USER
        }
    }).
    state('search-doctor', {
        url: "/search-doctor",
        templateUrl: "modules/visits/partials/search-doctor.html",
        data: {
            access: ACCESS_LEVELS.USER
        }
    });
    /************************* CALENDAR ***************************************/
    $stateProvider.
    state('calendar-day', {
        url: "/calendar-day",
        templateUrl: "modules/chronos/partials/calendar-day.html",
        controller: 'DashboardCtrl',
        data: {
            access: ACCESS_LEVELS.USER
        }
    }).
    state('calendar-week', {
        url: "/calendar-week",
        templateUrl: "modules/chronos/partials/calendar-week.html",
        controller: 'DashboardCtrl',
        data: {
            access: ACCESS_LEVELS.USER
        }
    }).
    state('calendar-month', {
        url: "/calendar-month",
        templateUrl: "modules/chronos/partials/calendar-month.html",
        controller: 'DashboardCtrl',
        data: {
            access: ACCESS_LEVELS.USER
        }
    });
});