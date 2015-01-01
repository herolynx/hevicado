'use strict';

/**
 * Configure module for users
 */
var usersModule = angular.module('users', [

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
    constant('TIME_ZONES', ['CET']);