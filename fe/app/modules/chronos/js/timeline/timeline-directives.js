'use strict';

/**
 * Directive displays single event on time-line
 */
angular.module('chronos.timeline').
    directive('calendarTimelineEvent', function () {
        return {
            restrict: 'E',
            templateUrl: 'modules/chronos/partials/timeline/timeline-event.html',
            scope: {
                event: '=event'
            }
        };
    });
