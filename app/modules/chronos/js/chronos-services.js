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
            return $http.get('/calendar/options', {
                userId: ownerId,
                date: date
            });
        },

        /**
         * Get events in given time period
         * @param start start time date
         * @param end end time date
         * @returns http promise
         */
        events: function (start, end) {
            $log.debug('Getting events - userId: ' + ownerId + ' start: ' + start + ', end: ' + end);
            return $http.get('/calendar/events/search', {
                start: start,
                end: end,
                userId: ownerId
            });
        },

        /**
         * Get details about events
         * @param id event ID
         * @returns http promise
         */
        event: function (id) {
            $log.debug('Getting event - id: ' + id);
            return $http.get('/calendar/visit/' + id);
        },

        /**
         * Save event
         * @param event event to be created/updated
         * @returns {*} http promise
         */
        save: function (event) {
            return $http[event.id === undefined ? 'post' : 'put']('/calendar/events/save', {
                event: event
            });
        },

        /**
         * Delete event
         * @param eventId
         * @returns {*} http promise
         */
        delete: function (eventId) {
            return $http.delete('/calendar/events/delete', {
                id: eventId
            });
        }

    };

});