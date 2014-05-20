'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('kunishu.services', []).
    value('version', '0.0').
    factory('AuthService', function ($http, Session) {
        return {
            login: function (credentials) {
                return $http
                    .post('/login', credentials)
                    .then(function (res) {
                        Session.create(res.id, res.userid, res.role);
                    });
            },
            isAuthenticated: function () {
                return !!Session.userId;
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
    service('Session', function () {
        this.create = function (sessionId, userId, userRole) {
            this.id = sessionId;
            this.userId = userId;
            this.userRole = userRole;
        };
        this.destroy = function () {
            this.id = null;
            this.userId = null;
            this.userRole = null;
        };
        return this;
    });
