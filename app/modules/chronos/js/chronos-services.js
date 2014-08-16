'use strict';

var services = angular.module('chronos.services', []);

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
         * @returns non-nullable array
         */
        events: function (start, end) {
            return [
                {
                    title: "Meeting 8:00-8:15",
                    description: "Details go here about meeting....",
                    start: Date.today().set({hour: 8, minute: 0}),
                    end: Date.today().set({hour: 8, minute: 15}),
                    color: 'red',
                    duration: 15
                },
                {
                    title: "Meeting 9:00-10:00",
                    description: "Details go here about meeting....",
                    start: Date.today().set({hour: 9, minute: 0}),
                    end: Date.today().set({hour: 10, minute: 0}),
                    color: 'yellow',
                    duration: 60
                }
            ];
        }


    };

});
