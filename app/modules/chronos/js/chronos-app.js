'use strict';

/**
 * Configure module for time and calendar management
 */
var module = angular.module('chronos', [
    /*internal modules*/
    'chronos.controllers',
    'chronos.services',
    'chronos.collections',
    /*external modules*/
    'ui-dnd',
    'ui-elements',
    'ui-notifications'
]);

