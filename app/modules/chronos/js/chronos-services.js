'use strict';

var services = angular.module('chronos.services', []);

/**
 * Service manages events
 * @param $http http communication service
 * @param $log logger
 */
services.service('CalendarService', function ($http, $log) {

    return {

        /**
         * Get locations defined by given user
         * @param userId
         * @return http promise
         */
        locations: function (userId) {
            $log.debug('Getting locations - userId: ' + userId);
            return $http({
                method: 'GET',
                url: '/calendar/locations',
                params: {
                    user: userId
                }
            });
        },

        /**
         * Get events in given time period
         * @param start start time date
         * @param end end time date
         * @returns http promise
         */
        events: function (start, end) {
            $log.debug('Getting events - start: ' + start + ', end: ' + end);
            return $http({
                method: 'GET',
                url: '/calendar/events/search',
                params: {
                    start: start,
                    end: end
                }
            });
        },

        /**
         * Save event
         * @param event event to be created/updated
         * @returns {*} http promise
         */
        save: function (event) {
            var method = 'POST';
            if (event.id !== '') {
                method = 'PUT';
            }
            return $http({
                method: method,
                url: '/calendar/events/save',
                params: {
                    event: event
                }
            });
        },

        /**
         * Delete event
         * @param eventId
         * @returns {*} http promise
         */
        delete: function (eventId) {
            return $http({
                method: 'DELETE',
                url: '/calendar/events/delete',
                params: {
                    id: eventId
                }
            });
        }

    };

});
