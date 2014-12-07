'use strict';

var routes = angular.module('angular-base.routes', [
    'ui.router'
]);

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
            url: "/patient/visit",
            templateUrl: "modules/chronos/partials/calendar-timeline.html",
            data: {
                access: ACCESS_LEVELS.USERS
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
            url: "/user/profile",
            templateUrl: "modules/users/partials/user-profile.html",
            data: {
                access: ACCESS_LEVELS.USERS
            }
        }).
        state('user-visits', {
            url: "/patient/visit",
            templateUrl: "modules/chronos/partials/calendar-timeline.html",
            data: {
                access: ACCESS_LEVELS.USERS
            }
        }).
        state('user-visit', {
            url: "/patient/visit/{eventId:[0-9a-z]+}",
            templateUrl: "modules/chronos/partials/info-event.html",
            data: {
                access: ACCESS_LEVELS.USERS
            }
        }).
        state('search-doctor', {
            url: "/doctor",
            templateUrl: "modules/chronos/partials/chronos-search.html",
            data: {
                access: ACCESS_LEVELS.USERS
            }
        });
    /************************* CALENDAR ***************************************/
    $stateProvider.
        state('calendar-day', {
            url: "/doctor/{doctorId:[0-9a-z]+}/calendar",
            templateUrl: "modules/chronos/partials/calendar-day-frame.html",
            data: {
                access: ACCESS_LEVELS.USERS
            }
        }).
        state('calendar-day.visits', {
            url: "/daily",
            templateUrl: "modules/chronos/partials/calendar-day.html",
            data: {
                access: ACCESS_LEVELS.USERS
            }
        }).
        state('calendar-day.edit-visit', {
            url: "/visit",
            templateUrl: "modules/chronos/partials/edit-event.html",
            data: {
                access: ACCESS_LEVELS.USERS
            }
        }).
        state('calendar-week', {
            url: "/doctor/{doctorId:[0-9a-z]+}/calendar/weekly",
            templateUrl: "modules/chronos/partials/calendar-week.html",
            data: {
                access: ACCESS_LEVELS.USERS
            }
        }).
        state('calendar-month', {
            url: "/doctor/{doctorId:[0-9a-z]+}/calendar/monthly",
            templateUrl: "modules/chronos/partials/calendar-month.html",
            data: {
                access: ACCESS_LEVELS.USERS
            }
        });
    /************************* DOCTOR ***************************************/
    $stateProvider.
        state('cabinet', {
            url: "/doctor/cabinet",
            templateUrl: "modules/doctor/partials/cabinet.html",
            data: {
                access: ACCESS_LEVELS.USERS
            }
        });
});