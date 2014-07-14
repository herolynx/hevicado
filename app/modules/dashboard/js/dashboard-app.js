'use strict';

/**
 * Configure dashboard module
 */
var dashboard = angular.module('dashboard',
    [
        'dashboard.controllers',
        'dashboard-widgets',
        'ui.dashboard'
    ]
);

/**
 * Define default widgets
 */
dashboard
    .value('defaultWidgets', [
        { name: 'random' },
        { name: 'time' },
        { name: 'datamodel' },
        {
            name: 'random',
            style: {
                width: '50%'
            }
        },
        {
            name: 'time',
            style: {
                width: '50%'
            }
        }
    ]);