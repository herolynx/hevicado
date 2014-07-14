'use strict';


var services = angular.module('bolt.services', []);

/**
 * Service manager session of current user
 * @param $http Angie's HTTP communication component
 * @param Session component for session management
 * @param USER_ROLES list of available user roles
 */
services.factory('AuthService', function ($http, Session, USER_ROLES) {
    return {
        /**
         * Login user with given credentials
         * @param credentials user's credentials (login, password etc.)
         * @returns {*} future object
         */
        login: function (credentials) {
            return $http
                .post('/login', credentials)
                .then(function (res) {
                    Session.create(res.token, res.userid, res.role);
                });
        },
        /**
         * Logout current user
         */
        logout: function () {
            Session.destroy();
        },
        /**
         * Check whether current user is logged in
         * @returns {boolean} true is current user is logged in, false otherwise
         */
        isAuthenticated: function () {
            return Session.getToken() !== null;
        },
        /**
         * Check whether current user has sufficient privileges
         * @param authorizedRoles arrays with required roles from the current user
         * @returns {boolean} true if user has required role, false otherwise
         */
        isAuthorized: function (authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            if (authorizedRoles.indexOf(USER_ROLES.GUEST) !== -1) {
                return true;
            }
            return (this.isAuthenticated() &&
                authorizedRoles.indexOf(Session.getUserRole()) !== -1);
        },
        getCurrentSession: function () {
            return Session;
        }
    };
});

/**
 * User's session definition. <br>
 * Note: don't use it externally. Use AuthService instead.
 * @param $cookieStore Angie's component for cookies management
 * @param USER_ROLES list of available user roles
 * @param $log Angie's logger
 */
services.service('Session', function ($cookieStore, USER_ROLES, $log) {

    var _currentUser = {
        'token': null,
        'userId': null,
        'userRole': USER_ROLES.GUEST
    };

    this.getToken = function () {
        return _currentUser.token;
    }

    this.getUserId = function () {
        return _currentUser.userId;
    }

    this.getUserRole = function () {
        return _currentUser.userRole;
    }

    /**
     * Create new user's session
     * @param token session's token
     * @param userId
     * @param userRole user's privileges
     */
    this.create = function (token, userId, userRole) {
        $log.debug('Creating session - USER: ' + userId + ', userRole: ' + userRole + ', token: ' + token);
        _currentUser = {
            'token': token,
            'userId': userId,
            'userRole': userRole
        };
        $cookieStore.put('currentUser', _currentUser);
    };

    /**
     * Destroy user's current session
     */
    this.destroy = function () {
        $log.debug('Deleting session - USER: ' + _currentUser.userId);
        $cookieStore.remove('currentUser');
        _currentUser = {
            'token': null,
            'userId': null,
            'userRole': USER_ROLES.GUEST
        };
    };

    return this;
});

/**
 * Component adds user's token to header of each outgoing request. <br/>
 * Moreover it checks standard code of responses (codes 401, 403 etc.) related
 * with user's session/access rights and handles them by default.
 * @param $rootScope Angie's root scope
 * @param $q Angie's promise object
 * @param Session user's current session
 * @param AUTH_EVENTS list of authentication events
 */
services.factory('AuthInterceptor', function ($rootScope, $q, Session, AUTH_EVENTS) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if (Session.getToken()) {
                config.headers.Authorization = 'Bearer ' + Session.getToken();
            }
            return config;
        },
        response: function (response) {
            if (response.status === 401) {
                $rootScope.$broadcast(AUTH_EVENTS.USER_NOT_AUTHENTICATED);
                return $q.reject(response);
            } else if (response.status === 403) {
                $rootScope.$broadcast(AUTH_EVENTS.USER_NOT_AUTHORIZED);
                return $q.reject(response);
            } else if (response.status === 419 || response.status === 440) {
                $rootScope.$broadcast(AUTH_EVENTS.SESSION_TIMEOUT);
                return $q.reject(response);
            }
            return response || $q.when(response);
        }
    };
});

