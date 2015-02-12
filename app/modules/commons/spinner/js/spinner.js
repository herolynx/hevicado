'use strict';

/**
 * Module for showing that HTTP communication is in-progress
 */
angular.module('commons.spinner', []);

angular.module('commons.spinner').
    constant('SPINNER_EVENTS', {
        COUNTER_CHANGED: 'spinner-counter-changed'
    });