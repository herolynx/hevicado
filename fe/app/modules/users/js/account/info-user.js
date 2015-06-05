'use strict';


/**
 * Controller responsible for displaying generic info about currently logged in user
 * @param $scope ctrl's scope
 * @param Session current user's session
 * @param AUTH_EVENTS events related with user's current session
 * @param USER_EVENTS user related events
 * @param $log logger
 */
angular.module('users.account').
    controller('UserInfoCtrl',
    ['$scope', 'Session', 'AUTH_EVENTS', '$log',
        function ($scope, Session, AUTH_EVENTS, $log) {

            $scope.info = {};

            /**
             * Initialize controller
             */
            $scope.init = function () {
                $log.debug("Getting info about current user from session");
                $scope.info = Session.getInfo();
            };

            /**
             * Register in event bus in order to
             */
            $scope.register = function () {
                $scope.$on(AUTH_EVENTS.USER_LOGGED_IN, function () {
                    $log.debug("User info changed after logging in - refreshing");
                    $scope.init();
                });
                $scope.$on(AUTH_EVENTS.SESSION_REFRESH, function (event, user) {
                    $log.debug("User info changed - refreshing");
                    $scope.init();
                });
            };

            $scope.init();
            $scope.register();

        }
    ]
);