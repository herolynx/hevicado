'use strict';

var controllers = angular.module('kunishu-auth.controllers', []);

/**
 * Controller manages user's login/logout process
 * @param $rootScope Angie's root scope
 * @param $scope Angie's current scope
 * @param AuthService service for managing user's session
 * @param AUTH_EVENTS list of authentication events
 * @param $log Angie's logger component
 */
controllers.controller('LoginCtrl', function ($rootScope, $scope, AuthService, AUTH_EVENTS, $log) {
    $scope.credentials = {
        username: '',
        password: ''

    };
    /**
     * Message displayed during login process, for instance when login or password is incorrect
     * @type {string}
     */
    $scope.loginMessage = '';
    /**
     * Login user with given credentials
     * @param credentials user's login and password
     */
    $scope.login = function (credentials) {
        $log.debug('Logging in USER:' + credentials.username);
        AuthService.login(credentials).then(function () {
            $rootScope.$broadcast(AUTH_EVENTS.USER_LOGGED_IN);
        }, function () {
            $rootScope.$broadcast(AUTH_EVENTS.LOGIN_FAILED);
            $scope.loginMessage = 'Wrong login and/or password';
        });
    };
    /**
     * Logout current user
     */
    $scope.logout = function () {
//        AuthService.logout();
//        $rootScope.$broadcast(AUTH_EVENTS.USER_LOGGED_OUT);
    }
});