'use strict';

/**
 * Configure module for time and calendar management
 */
var module = angular.module('chronos', [
    /*internal modules*/
    'chronos.collections',
    'chronos.services',
    'chronos.directives',
    'chronos.events',
    'chronos.calendar',
    'chronos.calendar.directives',
    'chronos.timeline',
    'chronos.search',
    /*external modules*/
    'ui-dnd',
    'ui-elements',
    'ui-notifications'
]);

/**
 * Possible states of event
 */
module.constant('EVENT_STATE', {
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