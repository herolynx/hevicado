'use strict';

var events = angular.module('chronos.events', []);

/**
 * Manager checks whether chosen actions can be performed on event
 *
 * @param EventUtils generic event related functionality
 * @param EVENT_STATE possible states of event
 */
events.service('EventActionManager', function (EventUtils, EVENT_STATE) {

    return {

        /**
         * Check whether event can be cancelled
         *
         * @param event event to be checked
         * @return {boolean} true is event can be cancelled, false otherwise
         */
        canCancel: function (event) {
            var eventState = EventUtils.state(event);
            return eventState.key < EVENT_STATE.CLOSED.key;
        }

    };
});

/**
 * Generic functionality related with events
 *
 * @param EVENT_STATE possible states of events
 */
events.service('EventUtils', function (EVENT_STATE) {

    return {

        /**
         * Get state of event
         *
         * @param event event which state should be checked
         * @return non-nullable state from EVENT_STATE
         */
        state: function (event) {
            if (event.cancelled !== undefined && event.cancelled !== null) {
                return EVENT_STATE.CANCELLED;
            } else if (new Date().isAfter(event.start)) {
                return EVENT_STATE.CLOSED;
            }
            return EVENT_STATE.OPEN;
        },

        /**
         * Move date to Monday of current week
         * @param date date based on which current Monday should be found
         * @return new instance of Monday date
         */
        currentMonday: function (date) {
            if (!date.is().monday()) {
                return date.clone().moveToDayOfWeek(1, -1);
            }
            return date.clone();
        },

        /**
         * Normalize fields in event
         * @param event event to be normalized
         * @return the same instance of event
         */
        normalize: function (event) {
            var toDate = function (value) {
                return typeof value == 'string' ? Date.parse(value) : new Date(value);
            };
            if (event.start.clone === undefined) {
                event.start = toDate(event.start);
            }
            if (event.end.clone === undefined) {
                event.end = toDate(event.end);
            }
            if (event.duration === undefined) {
                var span = new TimeSpan(event.end - event.start);
                event.duration = span.getTotalMilliseconds() / (1000 * 60);
            }
            if (event.cancelled != undefined && event.cancelled.clone === undefined) {
                event.cancelled = toDate(event.cancelled);
            }
            return event;
        },

        /**
         * Convert event attributes into plain JSON
         * @param event event to be converted
         * @returns {*} the same instance of event
         */
        toJson: function (event) {
            var toString = function (value) {
                return typeof value != 'string' ? value.toString('yyyy-MM-dd HH:mm:ss') : value;
            };
            if (event.start != undefined) {
                event.start = toString(event.start);
            }
            if (event.end != undefined) {
                event.end = toString(event.end);
            }
            if (event.cancelled != undefined) {
                event.cancelled = toString(event.cancelled);
            }
            return event;
        },

        /**
         * Convert value
         * @param values all possible values
         * @param currentValue chosen value
         * @param defaultIndex index of default value if conversion is needed
         * @param isOwner optional flag indicates whether owner can set value outside of possible values
         * @return normalized value
         */
        value: function (values, currentValue, defaultIndex, isOwner) {
            if (!_.contains(values, currentValue)) {
                return isOwner ? currentValue : values[defaultIndex];
            }
            return currentValue;
        }

    };

});