'use strict';

/**
 * View model for keeping summary data about monthly calendar
 *
 * @param $scope ctrl scope
 * @param $controller component for injecting other sub-controllers
 */
angular.module('chronos.calendar').
    controller('MonthlyCalendarCtrl',
    ['$scope', '$controller',
        function ($scope, $controller) {

            $controller('CalendarCtrl', {$scope: $scope});

            /**
             * Action performed after events are loaded
             * @param events new loaded events
             */
            $scope.onEventsLoad = function (events) {
                var daysEvents = _.groupBy(events, function (event) {
                    return event.start.getDate();
                });
                _.map(daysEvents, function (dayEvents, day) {
                    var dayInfo = _.chain(dayEvents).
                        groupBy(function (event) {
                            return event.location.name;
                        }).
                        map(function (events, location) {
                            return {
                                name: location,
                                color: events.length > 0 ? events[0].location.color : 'turquoise',
                                value: events.length
                            };
                        }).
                        sortBy(function (info) {
                            return info.value;
                        }).
                        reverse().
                        first(4).
                        value();
                    $scope.events[day] = dayInfo;
                });
            };

            /**
             * Attach event to calendar grid
             * @param event event to be attached
             */
            $scope.attachEvent = function (event) {
                //empty
            };

            /**
             * Detach event from calendar grid
             * @param event event to be detached
             */
            $scope.detachEvent = function (event) {
                //empty
            };

            /**
             * Get all events
             * @returns {*} flat array of events
             */
            $scope.allEvents = function () {
                //empty
            };

            /**
             * Build time lines so events can be displayed on calendar properly
             * @param day for which time line should be built
             */
            $scope.buildTimeline = function (day) {
                //empty
            };

            /**
             * Build time lines for given time period  so events can be displayed on calendar properly
             * @param startDate beginning of time window
             * @param endDate end of time window
             */
            $scope.buildTimelineFor = function (startDate, endDate) {
                //empty
            };

            $scope.init();

        }
    ]
);




