'use strict';

/**
 * Configure authentication module
 */
var module = angular.module('bolt',
    [
        'bolt.controllers',
        'bolt.services',
        'ui.router'
    ]
).
    constant('AUTH_EVENTS', {
        USER_LOGGED_IN: 'auth-login-success',
        LOGIN_FAILED: 'auth-login-failed',
        USER_LOGGED_OUT: 'auth-logout-success',
        SESSION_TIMEOUT: 'auth-session-timeout',
        USER_NOT_AUTHENTICATED: 'auth-not-authenticated',
        USER_NOT_AUTHORIZED: 'auth-not-authorized'
    }).
    constant('USER_ROLES', {
        ADMIN: 'admin',
        CLIENT: 'client',
        GUEST: 'guest'
    }).
    constant('ACCESS_LEVELS', {
        PUBLIC: ['guest', 'client', 'admin'],
        USER: ['client', 'admin'],
        ADMIN: ['admin']
    });

/**
 * Check whether current has privileges to see visited resources
 * @param $rootScope Angie's root scope
 * @param $state state manager that handles navigation between resources
 * @param AuthService service for checking user access rights
 * @param AUTH_EVENTS list of authentication events
 * @param $log Angie's logger
 */
var checkUserAccessRights = function ($rootScope, $state, AuthService, AUTH_EVENTS, $log) {
    $rootScope.$on('$stateChangeStart', function (event, next) {
        var requiredAccessRoles = next.data.access;
        if (!AuthService.isAuthorized(requiredAccessRoles)) {
            $log.info('User is not allowed to see resource ' + next.url + ' - required roles: ' + requiredAccessRoles);
            event.preventDefault();
            $state.go('login');
            if (!AuthService.isAuthenticated()) {
                $log.info('User is not allowed to see resource ' + next.url + ' - user is not logged in');
                $rootScope.$broadcast(AUTH_EVENTS.USER_NOT_AUTHENTICATED);
            } else {
                $log.info('User is not allowed to see resource ' + next.url + ' - no sufficient privileges of: ' +
                    AuthService.getCurrentSession().getUserRole());
                $rootScope.$broadcast(AUTH_EVENTS.USER_NOT_AUTHORIZED);
            }
        }
    })
}

// check user access rights when visiting stuff in application
module.run(checkUserAccessRights);
