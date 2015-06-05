'use strict';

/**
 * Component adds user's token to header of each outgoing request. <br/>
 * Moreover it checks standard code of responses (codes 401, 403 etc.) related
 * with user's session/access rights and handles them by default.
 * @param $rootScope Angie's root scope
 * @param $q Angie's promise object
 * @param Session user's current session
 * @param AUTH_EVENTS list of authentication events
 */
angular.module('bolt.services').
    factory('AuthInterceptor',
    ['$rootScope', '$q', 'Session', 'AUTH_EVENTS',
        function ($rootScope, $q, Session, AUTH_EVENTS) {
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
        }
    ]);