'use strict';

var calendar = angular.module('chronos.calendar.directives', []);

/**
 * Directive displays top menu of the calendar.
 * Top menu contains i.e. navigation between months, years.
 * It also allows switching type of calendar view between day, week and month.
 * Directive uses the parent scope of the controller.
 */
calendar.directive('calendarMenu', function () {
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
calendar.directive('calendarTable', function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/chronos/partials/calendar-table.html',
        scope: false
    }
});

/** 
 * Directive displayes single event on table based on its timeline settings
 */
calendar.directive('calendarTableEvent', function ($log) {

    return {
        restrict: 'E',
        template: '',
        scope: {
            event: '='
        },
        link: function ($scope, elm, attrs) {
            // var startDate = $scope.event.start;
            // var topId = startDate.toString('yyyy-MM-dd') + ' ' + startDate.getHours() + ':' + startDate.getMinutes();
            // var topElement = $("#" + topId);
            // if (topElement != null) {
            //     $log.debug('attaching');
            //     elm.detach();
            //     topElement.parent().append(elm);
            // }

            var quarterHeight = 25;
            var height = $scope.event.quarter * quarterHeight;
            elm.height(height - 1);

            if ($scope.event.overlap > 1) {
                var columnWidth = 200;
                var eventWidth = columnWidth / $scope.event.overlap;
                elm.width(eventWidth - 10);
                var left = eventWidth * $scope.event.timeline;
                elm.css('left', left);
            }
        }
    }

});