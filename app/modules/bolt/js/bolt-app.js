'use strict';

/**
 * Configure authentication module
 */
angular.module('bolt',
    [
        'bolt.services',
        'bolt.login',
        'bolt.directives',
        'ui.router'
    ]
).
    constant('AUTH_EVENTS', {
        USER_LOGGED_IN: 'auth-login-success',
        LOGIN_FAILED: 'auth-login-failed',
        USER_LOGGED_OUT: 'auth-logout-success',
        SESSION_TIMEOUT: 'auth-session-timeout',
        USER_NOT_AUTHENTICATED: 'auth-not-authenticated',
        USER_NOT_AUTHORIZED: 'auth-not-authorized',
        SESSION_REFRESH: 'session-refresh'
    }).
    constant('USER_ROLES', {
        GUEST: 'guest',
        USER: 'user',
        DOCTOR: 'doctor'
    }).
    constant('ACCESS_LEVELS', {
        PUBLIC: ['guest', 'user', 'doctor'],
        USERS: ['user', 'doctor'],
        DOCTORS: ['doctor']
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
    });
};

// check user access rights when visiting stuff in application
angular.module('bolt').run(['$rootScope', '$state', 'AuthService', 'AUTH_EVENTS', '$log', checkUserAccessRights]);

/**
 * Check whether resource to be visited can be viewed only by the owner
 * @param $rootScope Angie's root scope
 * @param $state state manager that handles navigation between resources
 * @param $stateParams params of current state
 * @param Session current user's session
 * @param AUTH_EVENTS list of authentication events
 * @param $log Angie's logger
 */
var checkUserOwnerShipRights = function ($rootScope, $state, $stateParams, Session, AUTH_EVENTS, $log) {
    $rootScope.$on('$stateChangeSuccess', function (event, next) {
        if ($state.current !== undefined && $state.current.data !== undefined && $state.current.data.showToParam !== undefined) {
            var showTo = $stateParams[$state.current.data.showToParam];
            if (Session.getUserId() !== showTo) {
                $log.info('User is not owner of resource ' + next.url + ' - redirecting');
                event.preventDefault();
                $state.go('default');
                $rootScope.$broadcast(AUTH_EVENTS.USER_NOT_AUTHORIZED);
            }
        }
    });
};

// check user ownership rights when visiting stuff in application
angular.module('bolt').run(['$rootScope', '$state', '$stateParams', 'Session', 'AUTH_EVENTS', '$log', checkUserOwnerShipRights]);
