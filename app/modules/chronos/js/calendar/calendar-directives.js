'use strict';

angular.module('chronos.calendar.directives', []);

/**
 * Directive displays top menu of the calendar.
 * Top menu contains i.e. navigation between months, years.
 * It also allows switching type of calendar view between day, week and month.
 * Directive uses the parent scope of the controller.
 */
angular.module('chronos.calendar.directives').
    directive('calendarMenu', function () {
        return {
            restrict: 'E',
            templateUrl: 'modules/chronos/partials/calendar/calendar-menu.html',
            scope: false
        };
    });

/**
 * Directive displays chosen days of calendar in table form.
 * Directive uses the parent scope of the controller.
 */
angular.module('chronos.calendar.directives').
    directive('calendarTable', function () {
        return {
            restrict: 'E',
            templateUrl: 'modules/chronos/partials/calendar/calendar-table.html',
            scope: false
        };
    });

/**
 * Directive displayes single event on table based on its timeline settings
 *
 * @param $window browser window
 * @param CALENDAR_EVENTS events used for calendar notifications
 * @param CALENDAR_SETTINGS settings for calendar rendering
 */
angular.module('chronos.calendar.directives').
    directive('calendarTableEvent',
    ['$window', 'CALENDAR_EVENTS', 'CALENDAR_SETTINGS',
        function ($window, CALENDAR_EVENTS, CALENDAR_SETTINGS) {

            /**
             * Set size of the displayed event element
             * @param elm DOM representation of event
             * @param event event to be displayed
             * @param quarterAmount number of quarters in an hour
             * @param quarterLength length of single quarter
             */
            var setEventSize = function (elm, event, quarterAmount, quarterLength) {
                clear(elm);
                //set height
                var quarterRoot = elm.parent();
                var quarterHeight = quarterRoot.height();
                var height = event.quarter * quarterHeight;
                elm.height(height - 1);
                if (event.start.getMinutes() % quarterLength) {
                    //shift in quarter according to time
                    var scale = quarterHeight / quarterLength;
                    elm.css('top', scale * event.start.getMinutes());
                }
                //set width
                if (event.overlap !== undefined && event.overlap.value > 1) {
                    //more then one events overlap at the same time
                    var columnWidth = quarterRoot.width() * CALENDAR_SETTINGS.EVENT_WIDTH_PERCENTAGE;
                    var eventWidth = columnWidth / event.overlap.value;
                    elm.width(eventWidth - CALENDAR_SETTINGS.EVENT_WIDTH_MARGIN);
                    var left = eventWidth * event.timeline;
                    elm.css('left', left);
                }
            };

            /**
             * Clear attributes of displayed elements
             * @param elm DOM representation of event
             */
            var clear = function (elm) {
                var parent = elm.parent();
                elm.width(parent.width() * CALENDAR_SETTINGS.EVENT_WIDTH_PERCENTAGE);
                elm.css('left', 0);
            };

            return {
                restrict: 'E',
                template: '',
                scope: {
                    event: '=',
                    quarterAmount: '=',
                    quarterLength: '='
                },
                link: function ($scope, elm, attrs) {
                    setEventSize(elm, $scope.event, $scope.quarterAmount, $scope.quarterLength);
                    //change event size also when window size changes
                    angular.element($window).bind('resize', function () {
                        setEventSize(elm, $scope.event, $scope.quarterAmount, $scope.quarterLength);
                    });
                    //change when events on calendar changes
                    $scope.$on(CALENDAR_EVENTS.CALENDAR_RENDER, function () {
                        setEventSize(elm, $scope.event, $scope.quarterAmount, $scope.quarterLength);
                    });
                }
            };

        }
    ]
);

/**
 * Directive for displaying time-line on the calendar that depicts current time of the current day.
 * Directive refreshes current time periodically.
 * @param $interval function for refreshing current time
 */
angular.module('chronos.calendar.directives').
    directive('calendarTimeLine',
    ['$interval', '$document',
        function ($interval, $document) {

            var offset = 50; //position of 0:00 hour
            var refreshTime = 10 * 1000; //refresh current time every N ms (sec * ms)
            var minuteSize = 2;

            /**
             * Init time line by setting offsets, sizes etc.
             * @param elm time line element to be shifted
             */
            var init = function (elm) {
                elm.addClass('time-line');
                var hourElm = $document.find('#hour-0');
                minuteSize = hourElm.height() / 60;
                offset = hourElm.position().top;
            };

            /**
             * Show time line
             * @param elm elm time line element to be shifted
             * @param date current date to be shown
             */
            var showTimeLine = function (elm, date) {
                var time = (date.getHours() * 60) + date.getMinutes();
                elm.css('top', offset + (time * minuteSize));
                elm.html('<span>' + date.toString('HH:mm') + '</span>');
            };

            return {
                restrict: 'E',
                template: '',
                scope: {
                    day: '='
                },
                link: function ($scope, elm, attrs) {
                    if (!$scope.day.equals(Date.today())) {
                        //show only for current day
                        return;
                    }
                    //init
                    $interval(function () {
                        //wait till table is rendered
                        init(elm);
                        showTimeLine(elm, new Date());
                    }, 1000, 1);
                    //refresh
                    $interval(function () {
                        showTimeLine(elm, new Date());
                    }, refreshTime);
                }
            };

        }
    ]
);