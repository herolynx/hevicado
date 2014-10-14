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
 *
 * @param $window browser window
 * @param $log logger
 */
calendar.directive('calendarTableEvent', function ($window, $log) {

    /**
     * Set size of the displayed event element
     * @param elm DOM representation of event
     * @param event event to be displayed
     */
    var setEventSize = function (elm, event) {
        //set height
        var quarterHeight = 25;
        var height = event.quarter * quarterHeight;
        elm.height(height - 1);
        //set width
        if (event.overlap !== undefined && event.overlap.value > 1) {
            //more then one events overlap at the same time
            var parent = elm.parent();
            var columnWidth = parent.width();
            var eventWidth = columnWidth / event.overlap.value;
            elm.width(eventWidth - 10);
            var left = eventWidth * event.timeline;
            elm.css('left', left);
        }
    };

    return {
        restrict: 'E',
        template: '',
        scope: {
            event: '='
        },
        link: function ($scope, elm, attrs) {
            setEventSize(elm, $scope.event);
            //change event size also when window size changes
            angular.element($window).bind('resize', function () {
                setEventSize(elm, $scope.event);
            })
        }
    }

});