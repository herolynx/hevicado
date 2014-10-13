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
        }

    };
});