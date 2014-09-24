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