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
    'ui.elements',
    'ui.notifications'
]).
    constant('THEMES', ['turquoise', 'orange', 'blue']).
    constant('LANGS', ['pl']).
    constant('TIME_ZONES', ['CET']).
    constant('USER_EVENTS', {
        USER_INFO_CHANGED: 'user-info-changed'
    });