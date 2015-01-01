'use strict';

var boltControllers = angular.module('bolt.controllers', [
    'ui.notifications'
]);

/**
 * Controller manages user's login/logout process
 * @param $rootScope Angie's root scope
 * @param $scope Angie's current scope
 * @param $state app state manager
 * @param AuthService service for managing user's session
 * @param AUTH_EVENTS list of authentication events
 * @param $log Angie's logger component
 */
boltControllers.controller('LoginCtrl', ['$rootScope', '$scope', '$state', 'AuthService', 'AUTH_EVENTS', '$log', function ($rootScope, $scope, $state, AuthService, AUTH_EVENTS, $log) {
    $scope.credentials = {
        login: '',
        password: ''

    };

    /**
     * Login user with given credentials
     * @param credentials user's login and password
     */
    $scope.login = function (credentials) {
        $log.debug('Logging in user: ' + credentials.login);
        AuthService.
            login(credentials).
            then(function () {
                $rootScope.$broadcast(AUTH_EVENTS.USER_LOGGED_IN);
                $state.go('default-user');
            }, function () {
                $rootScope.$broadcast(AUTH_EVENTS.LOGIN_FAILED);
            });
    };
    /**
     * Logout current user
     */
    $scope.logout = function () {
        $log.debug('Logging out current user');
        if (AuthService.isAuthenticated()) {
            AuthService.
                logout().
                then(function () {
                    $rootScope.$broadcast(AUTH_EVENTS.USER_LOGGED_OUT);
                    $state.go('default');
                });
        }
    };
}]);