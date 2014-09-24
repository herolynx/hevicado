'use strict';

/**
 * Configure module for users
 */
var module = angular.module('users', [

    /*internal modules*/
    'users.controllers',
    'users.services',
    /*external modules*/
    'bolt',
    'ui-elements',
    'ui-notifications'
]);