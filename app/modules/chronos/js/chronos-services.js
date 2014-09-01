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
         * Get working hours in chosen day
         * @param day day to be checked
         * @returns {number[]} non-nullable array
         */
        getWorkingHours: function (day) {
            return [ 8, 9, 10, 11, 12, 13, 14, 15, 16 ];
        },

        /**
         * Check whether events can be added in given date
         * @param date when event will be added
         * @return {boolean} true if event can be added, false otherwise
         */
        canAdd: function (date) {
            var hour = date.getHours();
            return this.getWorkingHours(date).indexOf(hour) != -1;
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
                url: '/calendar/events/add',
                params: {
                    event: event
                }
            });
        }


    };

});
