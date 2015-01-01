'use strict';

var usersServices = angular.module('users.services', []);

/**
 * Service managing users and users' related data
 * @param $http http communication service
 * @param $log logger
 */
usersServices.service('UsersService', ['$http', '$log', function ($http, $log) {

    return {

        /**
         * Get details about user
         * @param userId
         * @returns {*} http promise
         */
        get: function (userId) {
            $log.debug('Getting user: ' + userId);
            return $http.get('/user/' + userId);
        },

        /**
         * Search users
         * @param criteria search conditions
         * @returns {*} http promise
         */
        search: function (criteria) {
            $log.debug('Searching users: ' + criteria);
            return $http.get('/user', {
                params: {text: criteria}
            });
        },


        /**
         * Save user
         * @param user user be created/updated
         * @returns {*} http promise
         */
        save: function (user) {
            $log.debug('Saving user: ' + user.id);
            return $http[user.id === undefined ? 'post' : 'put']('/user', user);
        }
    };

}]);