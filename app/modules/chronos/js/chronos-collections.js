'use strict'

var collections = angular.module('chronos.collections', []);

/**
 * Multi-map of events with day->[event1, event2,...] map entries.
 */
collections.service('EventsMap', function ($log) {

    var dayEvents = [];

    /**
     * Function creates day key for given event
     * @param event for which key should be created
     * @returns {Date} time window key
     */
    var dayKey = function (event) {
        var key = new Date(event.start);
        key.clearTime();
        return key;
    };

    /**
     * Add event
     * @param day day key where event should be stored
     * @param event element to be added
     */
    var addEntry = function (day, event) {
        var events = dayEvents[day];
        if (events == null) {
            events = [];
            dayEvents[day] = events;
        }
        events.push(event);
    };

    return {

        /**
         * Get all events in given day
         * @param day day key
         * @returns {*} array of events
         */
        events: function (day) {
            return this.contains(day) ? dayEvents[day] : [];
        },

        /**
         * Check whether given key is present in this collection
         * @param day day key
         * @returns {boolean} true is key exists, false otherwise
         */
        contains: function (day) {
            return dayEvents[day] != null;
        },

        /**
         * Get number of keys
         * @returns {Number} of days
         */
        size: function () {
            return dayEvents.length;
        },

        /**
         * Go through all day keys
         * @param callback
         * @param thisObject
         * @see Array#forEach
         */
        forEachDay: function (callback, thisObject) {
            dayEvents.forEach(callback, thisObject);
        },

        /**
         * Add events
         * @param events elements to be added
         */
        addAll: function (events) {
            events.forEach(function (event) {
                this.add(event);
            });
        },

        /**
         * Add event
         * @param event element to be added
         * @returns {*} day keys where given event has been stored
         */
        add: function (event) {
            var days = [];
            var currentDay = dayKey(event.start);
            var endKey = dayKey(event.end);
            do {
                addEntry(currentDay, event);
                days.push(currentDay);
                currentDay = new Date(currentDay.add(1).days());
            } while (currentDay.isBefore(endKey));
            return days;
        }
    };

});

