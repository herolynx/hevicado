'use strict';

/**
 * Configure module for time and calendar management
 */
angular.module('chronos', [
    'chronos.commons',
    'chronos.services',
    'chronos.events',
    'chronos.calendar',
    'chronos.timeline'
]);

/**
 * Possible states of event
 */
angular.module('chronos').
    constant('EVENT_STATE', {
        //event is open
        OPEN: {
            key: 0,
            value: 'event-state-open'
        },
        //event has took place (in the past)
        CLOSED: {
            key: 1,
            value: 'event-state-closed'
        },
        //cancelled by owner or participant
        CANCELLED: {
            key: 2,
            value: 'event-state-cancelled'
        }
    });

/**
 * Calendar notification events
 */
angular.module('chronos').
    constant('CALENDAR_EVENTS', {
        CALENDAR_RENDER: 'calendar-render',
        EVENT_CHANGED: 'event-changed',
        EVENT_DELETED: 'event-deleted',
        CALENDAR_TIME_PICKED: 'calendar-time-picked'
    });

/**
 * Calendar settings
 */
angular.module('chronos').
    constant('CALENDAR_SETTINGS', {
        EVENT_WIDTH_PERCENTAGE: 0.87,
        EVENT_WIDTH_MARGIN: 10
    });