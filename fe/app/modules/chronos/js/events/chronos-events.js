'use strict';

/**
 * Module related with handling single event - CRUD cases, search etc.
 */
angular.module('chronos.events', [
    'chronos.events.directives',
    'users.commons.utils',
    'users.commons.filters',
    'users.commons.directives',
    'commons.maps.directives',
    'commons.labels',
    'commons.labels.filters',
    'ui.notifications',
    'users.services',
    'bolt.services',
    'infinite-scroll'
]);
