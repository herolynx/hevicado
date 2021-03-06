'use strict';

/**
 * Configure module for users
 */
angular.module('users', [

    /*internal modules*/
    'users.account',
    'users.services',
    'users.cabinet',
    /*external modules*/
    'bolt',
    'ui.elements',
    'ui.notifications'
]).
    constant('THEMES', ['turquoise']).
    constant('LANGS', ['pl']).
    constant('CABINET_COLORS', ['orange', 'blue']);