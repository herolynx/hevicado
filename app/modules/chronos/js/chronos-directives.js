'use strict';

var directives = angular.module('chronos.directives', []);

/**
 * Directive displays top menu of the calendar.
 * Top menu contains i.e. navigation between months, years.
 * It also allows switching type of calendar view between day, week and month.
 * Directive uses the parent scope of the controller.
 */
directives.directive('calendarMenu', function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/chronos/partials/calendar-menu.html',
        scope: false
    }
});

/**
 * Directive displays chosen days of calendar in table form.
 * Directive uses the parent scope of the controller.
 */
directives.directive('calendarTable', function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/chronos/partials/calendar-table.html',
        scope: false
    }
});

directives.directive('calendarTableEvent', function ($log) {

    return {
        restrict: 'E',
        template: '',
        scope: {
            event: '='
        },
        link: function ($scope, elm, attrs) {
            var quarterHeight = 25;
            var height = $scope.event.quarter * quarterHeight;
            elm.height(height-1);
            if ($scope.event.overlap > 1) {
                var columnWidth = 200;
                var eventWidth = columnWidth / $scope.event.overlap;
                $log.debug(eventWidth);
                elm.width(eventWidth-10);
                var left = eventWidth * $scope.event.timeline;
                elm.css('left', left);
            }
        }
    }

});

/**
 * Directive displays single event on time-line
 */
directives.directive('calendarTimelineEvent', function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/chronos/partials/calendar-timeline-event.html',
        scope: {
            event: '=event'
        }
    }
});