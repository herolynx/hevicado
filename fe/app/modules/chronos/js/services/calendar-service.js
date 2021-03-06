'use strict';

/**
 * Module for main chronos services
 */
angular.module('chronos.services', [
    'chronos.commons'
]);

/**
 * Service manages user's calendar and related data.
 * @param Session session of current user
 * @param $http http communication service
 * @param EventUtils generic event related functions
 * @param $log logger
 */
angular.module('chronos.services').
    service('CalendarService', ['Session', '$http', 'EventUtils', '$log', function (Session, $http, EventUtils, $log) {

        var ownerId;

        return {

            /**
             * Initialize calendar service
             * @param userId optional owner of calendar. If not given user will be taken from session.
             */
            init: function (userId) {
                $log.debug('Initializing calendar service - userId: ' + userId);
                ownerId = userId != undefined ? userId : Session.getUserId();
            },

            /**
             * Get events in given time period
             * @param start start time date
             * @param end end time date
             * @param asDoctor optional flag specifies whether events should be found for doctor or patient. By default true.
             * @returns http promise
             */
            events: function (start, end, asDoctor) {
                $log.debug('Getting events - userId: ' + ownerId + ' start: ' + start + ', end: ' + end + ', as doctor: ' + asDoctor);
                return $http.get('/calendar/' + ownerId + '/visit', {
                    params: EventUtils.toJson({
                        start: start,
                        end: end,
                        asDoctor: asDoctor == undefined ? true : asDoctor
                    })
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
                return $http[event.id === undefined ? 'post' : 'put']('/calendar/visit', EventUtils.toJson(angular.copy(event)));
            },

            /**
             * Cancel event
             * @param event event to be cancelled
             * @returns {*} http promise
             */
            cancel: function (event) {
                return $http.put('/calendar/visit', EventUtils.toJson({
                    id: event.id,
                    cancelled: new Date(),
                    start: event.start,
                    end: event.end,
                    patient: event.patient,
                    doctor: event.doctor
                }));
            },

            /**
             * Search free visits and doctors
             * @param criteria search conditions
             * @returns {*} http promise
             */
            search: function (criteria) {
                $log.debug('Searching free visits: ' + criteria);
                return $http.post('/calendar', EventUtils.toJson(angular.copy(criteria)));
            }

        };

    }]);