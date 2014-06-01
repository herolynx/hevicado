'use strict';


angular.module('kunishu-auth.services', []).
    factory('AuthService', function ($http, Session) {
        return {
            login: function (credentials) {
                return $http
                    .post('/login', credentials)
                    .then(function (res) {
                        Session.create(res.token, res.userid, res.role);
                    });
            },
            logout: function () {
                Session.destroy();
            },
            isAuthenticated: function () {
                return !Session.token;
            },
            isAuthorized: function (authorizedRoles) {
                if (!angular.isArray(authorizedRoles)) {
                    authorizedRoles = [authorizedRoles];
                }
                return (this.isAuthenticated() &&
                    authorizedRoles.indexOf(Session.userRole) !== -1);
            }
        };
    }).
    service('Session', function ($window, $log) {
        this.create = function (token, userId, userRole) {
            $log.debug('Creating session - user: ' + userId + ", userRole: " + userRole + ", token:" + token);
            $window.sessionStorage.user = this;
            this.token = token;
            this.userId = userId;
            this.userRole = userRole;

        };
        this.destroy = function () {
            $log.debug('Deleting session - user: ' + this.userId);
            delete $window.sessionStorage.user;
            this.token = null;
            this.userId = null;
            this.userRole = null;
        };
        return this;
    }).
    factory('AuthInterceptor', function ($rootScope, $q, Session) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                if (Session.token) {
                    config.headers.Authorization = 'Bearer ' + Session.token;
                }
                return config;
            },
            response: function (response) {
                if (response.status === 401) {
                    // handle the case where the user is not authenticated
                }
                return response || $q.when(response);
            }
        };
    });
;

