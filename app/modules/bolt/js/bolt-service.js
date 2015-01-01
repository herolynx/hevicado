'use strict';

var boltServices = angular.module('bolt.services', [
    'commons.users.utils'
]);

/**
 * Service manager session of current user
 * @param $http Angie's HTTP communication component
 * @param Session component for session management
 * @param USER_ROLES list of available user roles
 */
boltServices.factory('AuthService', ['$http', 'Session', 'USER_ROLES', function ($http, Session, USER_ROLES) {
    return {
        /**
         * Login user with given credentials
         * @param credentials user's credentials (login, password etc.)
         * @returns {*} promise
         */
        login: function (credentials) {
            return $http.
                post('/login', $.param(credentials), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).
                then(function (res) {
                    Session.create(res.data);
                });
        },
        /**
         * Logout current user
         * @returns {*} promise
         */
        logout: function () {
            var destroySession = function () {
                Session.destroy();
            };
            return $http.
                post('/logout/' + Session.getToken()).
                then(
                destroySession, //destroy session for OK response
                destroySession //destroy session when error occurred too
            );
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
            return (this.isAuthenticated() && authorizedRoles.indexOf(Session.getUserRole()) !== -1);
        },
        getCurrentSession: function () {
            return Session;
        }
    };
}]);

/**
 * User's session definition. <br>
 * Note: don't use it externally. Use AuthService instead.
 * @param $cookieStore Angie's component for cookies management
 * @param USER_ROLES list of available user roles
 * @param UserUtils generic user related functions
 * @param $log Angie's logger
 */
boltServices.service('Session', ['$cookieStore', 'USER_ROLES', 'UserUtils', '$log', function ($cookieStore, USER_ROLES, UserUtils, $log) {

    var self = this;

    var _currentUser = {
        'token': null,
        'id': null,
        'role': USER_ROLES.GUEST
    };

    this.getToken = function () {
        return self.loadUser().token;
    };

    this.getUserId = function () {
        return self.loadUser().id;
    };

    this.getUserRole = function () {
        return self.loadUser().role;
    };

    /**
     * Get generic info about user
     * @returns {*} non-nullable object
     */
    this.getInfo = function () {
        return UserUtils.getContactInfo(angular.copy(self.loadUser()));
    };

    /**
     * Load data of current user from cookie
     */
    this.loadUser = function () {
        var sessionUser = $cookieStore.get('currentUser');
        if (sessionUser != null) {
            _currentUser = sessionUser;
        }
        return _currentUser;
    };

    /**
     * Create new user's session
     * @param user user data
     */
    this.create = function (user) {
        $log.debug('Creating session - user id: ' + user.id + ', role: ' + user.role + ', token: ' + user.token);
        _currentUser = user;
        $cookieStore.put('currentUser', _currentUser);
    };

    /**
     * Destroy user's current session
     */
    this.destroy = function () {
        $log.debug('Deleting session - user id: ' + _currentUser.id);
        $cookieStore.remove('currentUser');
        _currentUser = {
            'token': null,
            'id': null,
            'userRole': USER_ROLES.GUEST
        };
    };

    return this;
}]);

/**
 * Component adds user's token to header of each outgoing request. <br/>
 * Moreover it checks standard code of responses (codes 401, 403 etc.) related
 * with user's session/access rights and handles them by default.
 * @param $rootScope Angie's root scope
 * @param $q Angie's promise object
 * @param Session user's current session
 * @param AUTH_EVENTS list of authentication events
 */
boltServices.factory('AuthInterceptor', ['$rootScope', '$q', 'Session', 'AUTH_EVENTS', function ($rootScope, $q, Session, AUTH_EVENTS) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if (Session.getToken()) {
                config.headers.Authorization = Session.getToken();
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
}]);