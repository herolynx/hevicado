'use strict';

var chronosEvents = angular.module('chronos.events', []);

/**
 * Manager checks whether chosen actions can be performed on event
 *
 * @param EventUtils generic event related functionality
 * @param Session session of current user
 * @param EVENT_STATE possible states of event
 */
chronosEvents.service('EventActionManager', ['EventUtils', 'Session', 'EVENT_STATE', function (EventUtils, Session, EVENT_STATE) {

    return {

        /**
         * Check whether event can be cancelled
         *
         * @param event event to be checked
         * @return {boolean} true is event can be cancelled, false otherwise
         */
        canCancel: function (event) {
            try {
                if (event == undefined || event.id == undefined) {
                    return false;
                }
                var participantsIds = [event.doctor.id, event.patient.id];
                if (!_.contains(participantsIds, Session.getUserId())) {
                    return false;
                }
                var eventState = EventUtils.state(event);
                return eventState.key < EVENT_STATE.CLOSED.key;
            } catch (e) {
                return false;
            }
        },

        /**
         * Check whether event can be edited
         *
         * @param event event to be checked
         * @return {boolean} true is event can be editer, false otherwise
         */
        canEdit: function (event) {
            try {
                if (event == undefined || event.id == undefined) {
                    return true;
                }
                if (event.doctor.id != Session.getUserId()) {
                    return false;
                }
                var eventState = EventUtils.state(event);
                return eventState.key < EVENT_STATE.CLOSED.key;
            } catch (e) {
                return false;
            }
        }

    };
}]);

/**
 * Generic functionality related with events
 *
 * @param EVENT_STATE possible states of events
 */
chronosEvents.service('EventUtils', ['EVENT_STATE', function (EVENT_STATE) {

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
            if (event.start.clone === undefined) {
                event.start = toLocalDate(event.start);
            }
            if (event.end.clone === undefined) {
                event.end = toLocalDate(event.end);
            }
            if (event.duration === undefined) {
                var span = new TimeSpan(event.end - event.start);
                event.duration = span.getTotalMilliseconds() / (1000 * 60);
            }
            if (event.cancelled != undefined && event.cancelled.clone === undefined) {
                event.cancelled = toLocalDate(event.cancelled);
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
                return typeof value != 'string' ? toUTCDate(value).toString('yyyy-MM-dd HH:mm:ss') : value;
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
        },

        /**
         * Find location according to event start date and locations working hours
         * @param locations locations with proper working hours
         * @param startTime time when event will start
         * @returns {*} found location, null otherwise
         */
        findLocation: function (locations, startTime) {
            if (locations == undefined) {
                return null;
            }
            var utcDate = toUTCDate(startTime);
            var day = startTime.toString('dddd');
            var hour = startTime.toString('HH:mm');
            for (var i = 0; i < locations.length; i++) {
                var working_hours = locations[i].working_hours;
                for (var h = 0; h < working_hours.length; h++) {
                    if (working_hours[h].day == day
                        && hour >= working_hours[h].start
                        && hour <= working_hours[h].end) {
                        return locations[i];
                    }
                }
            }
            return null;
        }

    };

}]);