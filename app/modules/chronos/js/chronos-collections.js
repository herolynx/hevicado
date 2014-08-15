'use strict';

var collections = angular.module('chronos.collections', []);

/**
 * Multi-map of events with day->[event1, event2,...] map entries.
 */
collections.service('EventsMap', function ($log) {

    var dayEvents = {};

    /**
     * Add event
     * @param eventsMap map where events will be stored per day
     * @param key day key where event should be stored
     * @param event element to be added
     */
    var addEntry = function (eventsMap, key, event) {
        var events = eventsMap[key];
        if (events == null) {
            events = [];
            eventsMap[key] = events;
        }
        events.push(normalize(event));
    };

    /**
     * Normalize event
     * @param event to be normalized
     * @return the same instance of event
     */
    var normalize = function (event) {
        if (event.id === undefined) {
            event.id = generateUUID();
        }
        return event
    };

    /**
     * Generate unique ID
     * @returns {string} non-nullable string
     */
    var generateUUID = function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    };

    return {

        /**
         * Function creates day key for given date
         * @param date for which key should be created
         * @returns {Date} time window key
         */
        dayKey: function (date) {
            return date.clone().clearTime();
        },

        /**
         * Get all events in given day
         * @param day day key
         * @returns {*} array of events
         */
        events: function (day) {
            return this.contains(day) ? dayEvents[day] : [];
        },

        /**
         * Get filtered events
         * @param filter event filtering criteria.
         * @returns {*} array of events
         */
        filter: function (filter) {
            var filtered = {};
            for (var day in dayEvents) {
                for (var i = 0; i < dayEvents[day].length; i++) {
                    var event = dayEvents[day][i];
                    if (filter(event)) {
                        addEntry(filtered, day, event);
                    }
                }
            }
            return filtered;
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
            return Object.keys(dayEvents).length;
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
            for (var i = 0; i < events.length; i++) {
                this.add(events[i]);
            }
        },

        /**
         * Add event
         * @param event element to be added
         * @returns {*} day keys where given event has been stored
         */
        add: function (event) {
            var days = [];
            var currentDay = this.dayKey(event.start);
            var endKey = this.dayKey(event.end).add(1).days();
            do {
                addEntry(dayEvents, currentDay.clone(), event);
                days.push(currentDay.clone());
                currentDay = currentDay.add(1).days();
            } while (currentDay.isBefore(endKey));
            return days;
        },

        /**
         * Remove event
         * @param event event to be removed
         * @param {boolean} true if element was removed, false otherwise
         */
        remove: function (event) {
            if (event.id === undefined) {
                return false;
            }
            var key = this.dayKey(event.start);
            var dayEvents = this.events(key);
            var eventIndex = dayEvents.indexOf(event);
            for (var i = 0; i < dayEvents.length; i++) {
                if (dayEvents[i].id === event.id) {
                    dayEvents.splice(i, 1);
                    return true;
                }
            }
            return false;
        }
    };

})
;

