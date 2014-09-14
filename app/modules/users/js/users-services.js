'use strict';

var services = angular.module('users.services', []);

/**
 * Service managing users and users' related data
 * @param $http http communication service
 * @param $log logger
 */
services.service('UsersService', function ($http, $log) {

    return {

        /**
         * Save user
         * @param user user be created/updated
         * @returns {*} http promise
         */
        save: function (user) {
            $log.debug('Saving user: ' + user.id)
            return $http[user.id === undefined ? 'post' : 'put']('/user', {
                user: user
            });
        }
    }

});