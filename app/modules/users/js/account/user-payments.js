'use strict';

/**
 * Controller manages payment plans of the user
 *
 * @param $scope controller scope
 */
angular.module('users.account').
    controller('UserPaymentPlanCtrl',
    ['$scope', '$controller', 'Session', 'AUTH_EVENTS', 'USER_ROLES', '$log',
        function ($scope, $controller, Session, AUTH_EVENTS, USER_ROLES, $log) {

            $controller('UserProfileCtrl', {$scope: $scope});

            $scope.roles = USER_ROLES;

            /**
             * Refresh state
             */
            $scope.refresh = function () {
                if (Session.getUserId() != null) {
                    $log.debug("Payments - refreshing info about user: " + Session.getUserId() + ', role: ' + Session.getUserRole());
                    $scope.loadProfile();
                } else {
                    $scope.user = {};
                }
            };

            /**
             * Change user plan to free one
             */
            $scope.freePlan = function () {
                $log.debug('Free plan chosen - changing role to: ' + USER_ROLES.DOCTOR);
                $scope.user.role = USER_ROLES.USER;
                $scope.save($scope.user);
            };

            /**
             * Check whether user has free plan
             * @returns {boolean}
             */
            $scope.isFreePlan = function () {
                return $scope.user.role == USER_ROLES.USER;
            };

            /**
             * Change user plan to doctor one
             */
            $scope.doctorPlan = function () {
                $log.debug('Doctor plan chosen - changing role to: ' + USER_ROLES.DOCTOR);
                $scope.user.role = USER_ROLES.DOCTOR;
                if ($scope.user.degree === undefined) {
                    $scope.user.degree = '$$degree-1';
                }
                if ($scope.user.locations === undefined) {
                    $scope.user.locations = [];
                }
                $scope.save($scope.user);
            };

            /**
             * Check whether user has doctor plan
             * @returns {boolean}
             */
            $scope.isDoctorPlan = function () {
                return $scope.user.role == USER_ROLES.DOCTOR;
            };

            /**
             * Register ctrl in event-bus
             */
            $scope.register = function () {
                $scope.$on(AUTH_EVENTS.USER_LOGGED_IN, function () {
                    $scope.refresh();
                });
                $scope.$on(AUTH_EVENTS.USER_LOGGED_OUT, function () {
                    $scope.refresh();
                });
                $scope.$on(AUTH_EVENTS.SESSION_REFRESH, function () {
                    $scope.refresh();
                });
                $scope.$on(AUTH_EVENTS.SESSION_TIMEOUT, function () {
                    $scope.refresh();
                });
            };

            $scope.register();
            $scope.refresh();
        }
    ]);