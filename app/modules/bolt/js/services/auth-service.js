'use strict';

/**
 * Service manager session of current user
 * @param $http Angie's HTTP communication component
 * @param Session component for session management
 * @param USER_ROLES list of available user roles
 */
angular.module('bolt.services').
    factory('AuthService',
    ['$http', 'Session', 'USER_ROLES',
        function ($http, Session, USER_ROLES) {
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
        }
    ]);
