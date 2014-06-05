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
                return !Session.currentUser.token;
            },
            isAuthorized: function (authorizedRoles) {
                if (!angular.isArray(authorizedRoles)) {
                    authorizedRoles = [authorizedRoles];
                }
                return (this.isAuthenticated() &&
                    authorizedRoles.indexOf(Session.currentUser.userRole) !== -1);
            }
        };
    }).
    service('Session', function ($cookieStore, $log, USER_ROLES) {
        this.currentUser = {
            'token': null,
            'userId': null,
            'userRole': USER_ROLES.guest
        };
        this.create = function (token, userId, userRole) {
            $log.debug('Creating session - user: ' + userId + ", userRole: " + userRole + ", token:" + token);
            this.currentUser = {
                'token': token,
                'userId': userId,
                'userRole': userRole
            };
            $cokieStore.put('currentUser', currentUser);
        };
        this.destroy = function () {
            $log.debug('Deleting session - user: ' + this.currentUser.userId);
            $cokieStore.remove('currentUser');
        };
        return this;
    }).
    factory('AuthInterceptor', function ($rootScope, $q, Session, AUTH_EVENTS) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                if (Session.token) {
                    config.headers.Authorization = 'Bearer ' + Session.currentUser.token;
                }
                return config;
            },
            response: function (response) {
                if (response.status === 401) {
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                    return $q.reject(response);
                } else if (response.status === 403) {
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                    return $q.reject(response);
                } else if (response.status === 419 || response.status === 440) {
                    $rootScope.$broadcast(AUTH_EVENTS.sessionTimeout);
                    return $q.reject(response);
                }
                return response || $q.when(response);
            }
        };
    });
;

