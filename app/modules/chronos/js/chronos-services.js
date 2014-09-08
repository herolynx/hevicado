'use strict';

var services = angular.module('chronos.services', []);

/**
 * Service manages user's calendar and related data.
 * @param $http http communication service
 * @param $log logger
 */
services.service('CalendarService', function ($http, $log) {

    var ownerId;

    return {

        /**
         * Initialize calendar service
         * @param userId owner of calendar
         */
        init: function (userId) {
            $log.debug('Initializing calendar service - userId: ' + userId);
            ownerId = userId;
        },

        /**
         * Get options for event that will start at given date
         * @param date where event should start
         * @returns {*} http promise that will return options (location and templates)
         */
        options: function (date) {
            return  $http.get('/calendar/options', {  userId: ownerId, date: date });
        },

        /**
         * Get events in given time period
         * @param start start time date
         * @param end end time date
         * @returns http promise
         */
        events: function (start, end) {
            $log.debug('Getting events - userId: ' + ownerId + ' start: ' + start + ', end: ' + end);
            return $http({
                method: 'GET',
                url: '/calendar/events/search',
                params: {
                    start: start,
                    end: end,
                    userId: ownerId
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
