'use strict';

angular.module('kunishu-auth.controllers', [])
    .controller('LoginCtrl', function ($scope, $rootScope, $log, AUTH_EVENTS, AuthService) {
        $scope.credentials = {
            username: '',
            password: ''

        };
        $scope.loginMessage = '';
        $scope.login = function (credentials) {
            $log.debug('Logging in user:' + credentials.username);
            AuthService.login(credentials).then(function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            }, function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                $scope.loginMessage = 'Wrong login and/or password';
            });
        };
        $scope.logout = function () {
            AuthService.logout();
        }
    }).
    constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    }).
    constant('USER_ROLES', {
        all: '*',
        admin: 'admin',
        editor: 'editor',
        guest: 'guest'
    });