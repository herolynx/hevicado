'use strict';

angular.module('kunishu-auth',
    [
        'kunishu-auth.controllers',
        'kunishu-auth.services',
        'ui.router'
    ]
).
    constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    }).
    constant('USER_ROLES', {
        admin: 'admin',
        client: 'client',
        guest: 'guest'
    }).
    constant('ACCESS_LEVELS', {
        public: ['guest', 'client', 'admin'],
        user: ['client', 'admin'],
        admin: ['admin']
    }).
    run(function ($rootScope, $log, AUTH_EVENTS, AuthService) {
        $rootScope.$on('$stateChangeStart', function (event, next) {
            var authorizedRoles = next.data.access;
            if (!AuthService.isAuthorized(authorizedRoles)) {
                $log.info('User is not allowed to see resource ' + next.url + ' - required roles: ' + authorizedRoles);
                event.preventDefault();
                if (AuthService.isAuthenticated()) {
                    // user is not logged in
                    $log.info('User is not allowed to see resource ' + next.url + ' - user is not logged in');
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                } else {
                    // user has no permissions
                    $log.info('User is not allowed to see resource ' + next.url + ' - user has no rights');
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                }
            }
        });
    });
