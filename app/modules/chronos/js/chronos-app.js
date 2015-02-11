'use strict';

/**
 * Configure module for time and calendar management
 */
var chronosModule = angular.module('chronos', [
    /*internal modules*/
    'chronos.services',
    'chronos.commons',
    'chronos.events',
    'chronos.calendar',
    'chronos.timeline',
    /*external modules*/
    'ui.dnd',
    'ui.elements',
    'ui.notifications'
]);

/**
 * Possible states of event
 */
chronosModule.constant('EVENT_STATE', {
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
chronosModule.constant('CALENDAR_EVENTS', {
    CALENDAR_RENDER: 'calendar-render',
    EVENT_CHANGED: 'event-changed',
    EVENT_DELETED: 'event-deleted',
    CALENDAR_TIME_PICKED: 'calendar-time-picked'
});

/**
 * Calendar settings
 */
chronosModule.constant('CALENDAR_SETTINGS', {
    EVENT_WIDTH_PERCENTAGE: 0.87,
    EVENT_WIDTH_MARGIN: 10
});