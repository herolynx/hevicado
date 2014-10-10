'use strict';

var collections = angular.module('chronos.collections', []);

/**
 * Multi-map of events with day->[event1, event2,...] map entries.
 */
function EventsMap() {

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
         * Create keys for given time period
         * @param start start date
         * @param end end date
         * @return {array} time window keys
         */
        dayKeys: function (start, end) {
            var dayKeys = [];
            var currentKey = this.dayKey(start);
            var endKey = this.dayKey(end).add(1).days();
            do {
                dayKeys.push(currentKey.clone());
                currentKey = currentKey.add(1).days();
            } while (currentKey.isBefore(endKey));
            return dayKeys;
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
            var dayKeys = this.dayKeys(event.start, event.end);
            for (var i = 0; i < dayKeys.length; i++) {
                addEntry(dayEvents, dayKeys[i].clone(), event);
            }
            return dayKeys;
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
            var dayKeys = this.dayKeys(event.start, event.end);
            var removed = false;
            for (var k = 0; k < dayKeys.length; k++) {
                var key = dayKeys[k];
                var dayEvents = this.events(key);
                for (var i = 0; i < dayEvents.length; i++) {
                    if (dayEvents[i].id === event.id) {
                        dayEvents.splice(i, 1);
                        removed = true;
                        break;
                    }
                }
            }
            return removed;
        },

        /**
         * Clear collection
         */
        clear: function () {
            dayEvents = {};
        }

    };

};

/**
 * Factory responsible for creation of calendar related collections
 */
collections.factory('CalendarCollectionFactory', function () {

    return {

        /**
         * Create map with grouped events by day
         *
         * @param events optional events to be added to map
         * @return new instance
         */
        eventsMap: function (events) {
            var map = new EventsMap();
            if (events !== undefined) {
                map.addAll(events);
            }
            return map;
        }

    };

});