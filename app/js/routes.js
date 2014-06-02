'use strict';

angular.module('kunishu-routes', []).
    config(function ($stateProvider, $urlRouterProvider, ACCESS_LEVELS) {
        //
        // for any unmatched url, redirect to /login
        $urlRouterProvider.otherwise("/login");
        //
        // access level: public
        $stateProvider.
            state('login', {
                url: "/login",
                templateUrl: "/app/modules/auth/partials/login.html"
                ,
                data: {
                    access: ACCESS_LEVELS.public
                }
            })
        //
        //
        // access level: user
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

