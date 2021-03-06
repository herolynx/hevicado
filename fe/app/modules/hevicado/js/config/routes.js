'use strict';

/**
 * Listener for saving previous state
 * @param $rootScope root scope for watching state changes
 * @param $log logger
 * @param $state state manager
 */
angular.module('hevicado.config').
    run(
    ['$rootScope', '$log', '$state',
        function ($rootScope, $log, $state) {

            $log.debug('Initializing go-back listener');

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $state.previous = {
                    state: fromState,
                    params: fromParams
                };
            });
        }
    ]);

/**
 * Configure routing rules between application states
 * @param $stateProvider application state manager
 * @param $urlRouterProvider application URL manager
 * @param ACCESS_LEVELS available access levels in application
 */
angular.module('hevicado.config').
    config(
    ['$stateProvider', '$urlRouterProvider', 'ACCESS_LEVELS',
        function ($stateProvider, $urlRouterProvider, ACCESS_LEVELS) {
            //
            // for any unmatched url, redirect to main page
            $urlRouterProvider.otherwise("/main");

            /************************* DEFAULT PAGES ***************************************/
            $stateProvider.
                state('default', {
                    url: "/main",
                    templateUrl: "modules/hevicado/partials/main.html",
                    data: {
                        access: ACCESS_LEVELS.PUBLIC
                    }
                }).
                state('default-user', {
                    url: "/patient/visit",
                    templateUrl: "modules/chronos/partials/timeline/timeline-events.html",
                    data: {
                        access: ACCESS_LEVELS.USERS
                    }
                });
            /************************* LOGIN & REGISTRATION ***************************************/
            $stateProvider.
                state('login', {
                    url: "/login",
                    templateUrl: "modules/bolt/partials/generic/login.html",
                    data: {
                        access: ACCESS_LEVELS.PUBLIC
                    }
                }).
                state('registration', {
                    url: "/registration",
                    templateUrl: "modules/users/partials/account/registration.html",
                    data: {
                        access: ACCESS_LEVELS.PUBLIC
                    }
                }).
                state('lost-password', {
                    url: "/lost-password",
                    templateUrl: "modules/bolt/partials/generic/lost-password.html",
                    data: {
                        access: ACCESS_LEVELS.PUBLIC
                    }
                });
            /************************* PUBLIC PAGES ***************************************/
            $stateProvider.
                state('main', {
                    url: "/main",
                    templateUrl: "modules/hevicado/partials/main.html",
                    data: {
                        access: ACCESS_LEVELS.PUBLIC
                    }
                }).
                state('regulations', {
                    url: "/regulations",
                    templateUrl: "modules/hevicado/partials/regulations.html",
                    data: {
                        access: ACCESS_LEVELS.PUBLIC
                    }
                });
            /************************* USER MAIN ***************************************/
            $stateProvider.
                state('user-profile', {
                    url: "/user/profile",
                    templateUrl: "modules/users/partials/account/user-profile.html",
                    data: {
                        access: ACCESS_LEVELS.USERS
                    }
                }).
                state('user-payments', {
                    url: "/main#payment",
                    templateUrl: "modules/hevicado/partials/main.html",
                    data: {
                        access: ACCESS_LEVELS.PUBLIC
                    }
                }).
                state('user-visits', {
                    url: "/patient/visit",
                    templateUrl: "modules/chronos/partials/timeline/timeline-events.html",
                    data: {
                        access: ACCESS_LEVELS.USERS
                    }
                }).
                state('user-visit', {
                    url: "/patient/visit/{eventId:[0-9a-z]+}",
                    templateUrl: "modules/chronos/partials/events/info-visit.html",
                    data: {
                        access: ACCESS_LEVELS.USERS
                    }
                }).
                state('search-doctor', {
                    url: "/doctor",
                    templateUrl: "modules/chronos/partials/events/search-visit.html",
                    data: {
                        access: ACCESS_LEVELS.USERS
                    }
                });
            /************************* CALENDAR ***************************************/
            $stateProvider.
                state('calendar-day', {
                    url: "/doctor/{doctorId:[0-9a-z]+}/calendar",
                    templateUrl: "modules/chronos/partials/calendar/calendar-day-frame.html",
                    controller: 'WeeklyCalendarCtrl',
                    daysAmount: 1,
                    data: {
                        access: ACCESS_LEVELS.DOCTORS
                    }
                }).
                state('calendar-day.daily', {
                    url: "/daily?{currentDate:\\d{4}-\\d{2}-\\d{2}}",
                    templateUrl: "modules/chronos/partials/calendar/calendar-day.html",
                    data: {
                        access: ACCESS_LEVELS.DOCTORS,
                        showToParam: 'doctorId',
                        addVisitState: 'calendar-day.new-visit',
                        editVisitState: 'calendar-day.edit-visit'
                    }
                }).
                state('calendar-week', {
                    url: "/doctor/{doctorId:[0-9a-z]+}/calendar/weekly",
                    templateUrl: "modules/chronos/partials/calendar/calendar-week.html",
                    controller: 'WeeklyCalendarCtrl',
                    daysAmount: 7,
                    quarterAmount: _.range(0, 2),
                    data: {
                        access: ACCESS_LEVELS.DOCTORS,
                        showToParam: 'doctorId',
                        addVisitState: 'calendar-day.new-visit',
                        editVisitState: 'calendar-day.edit-visit'
                    }
                }).
                state('calendar-month', {
                    url: "/doctor/{doctorId:[0-9a-z]+}/calendar/monthly",
                    templateUrl: "modules/chronos/partials/calendar/calendar-month.html",
                    controller: 'MonthlyCalendarCtrl',
                    daysAmount: 31,
                    data: {
                        access: ACCESS_LEVELS.DOCTORS,
                        showToParam: 'doctorId',
                        addVisitState: 'calendar-day.new-visit',
                        editVisitState: 'calendar-day.edit-visit'
                    }
                }).
                state('calendar-day.edit-visit', {
                    url: "/visit/{eventId:[0-9a-z]+}?{currentDate:\\d{4}-\\d{2}-\\d{2}}",
                    templateUrl: "modules/chronos/partials/events/edit-visit.html",
                    data: {
                        access: ACCESS_LEVELS.DOCTORS,
                        showToParam: 'doctorId',
                        addVisitState: 'calendar-day.new-visit',
                        editVisitState: 'calendar-day.edit-visit'
                    }
                }).
                state('calendar-day.new-visit', {
                    url: "/visit/{startTime:\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}}?{currentDate:\\d{4}-\\d{2}-\\d{2}}",
                    templateUrl: "modules/chronos/partials/events/edit-visit.html",
                    data: {
                        access: ACCESS_LEVELS.USERS,
                        addVisitState: 'calendar-day.new-visit',
                        editVisitState: 'calendar-day.edit-visit'
                    }
                });
            /************************* DOCTOR ***************************************/
            $stateProvider.
                state('cabinet', {
                    url: "/doctor/{doctorId:[0-9a-z]+}/office",
                    templateUrl: "modules/users/partials/cabinet/cabinet.html",
                    data: {
                        access: ACCESS_LEVELS.USERS
                    }
                }).
                state('edit-cabinet', {
                    url: "/doctor/edit-office",
                    templateUrl: "modules/users/partials/cabinet/edit-cabinet.html",
                    data: {
                        access: ACCESS_LEVELS.DOCTORS
                    }
                });
        }
    ]);