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
        public: '*',
        user: ['client', 'admin'],
        admin: ['admin']
    });
