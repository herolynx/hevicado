'use strict';

/**
 * View model for keeping data for daily and weekly calendar
 */
angular.module('chronos.calendar').
    controller('CalendarModel7',
    ['$scope',
        function ($scope) {

            /**
             * Action performed after events are loaded
             * @param events new loaded events
             */
            $scope.afterEventsLoad = function (events) {
                //empty
            };

            /**
             * Attach event to calendar grid
             * @param event event to be attached
             */
            $scope.attachEvent = function (event) {
                //get keys
                var day = event.start.getDate();
                var hour = event.start.getHours();
                var quarter = event.start.getMinutes() / $scope.quarterLength;
                //prepare place
                var days = $scope.events[day] || [];
                $scope.events[day] = days;
                var hours = days[hour] || [];
                days[hour] = hours;
                var quarters = hours[quarter] || [];
                hours[quarter] = quarters;
                //store event
                quarters.push(event);
            };

            /**
             * Detach event from calendar grid
             * @param event event to be detached
             */
            $scope.detachEvent = function (event) {
                //get keys
                var day = event.start.getDate();
                var hour = event.start.getHours();
                var quarter = event.start.getMinutes() / $scope.quarterLength;
                //prepare place
                var days = $scope.events[day] || [];
                if (days !== undefined) {
                    var hours = days[hour] || [];
                    if (hours != undefined) {
                        var quarters = hours[quarter] || [];
                        if (quarters != undefined) {
                            var index = quarters.indexOf(event);
                            quarters.splice(index, 1);
                        }
                    }
                }
            };

            /**
             * Get all events
             * @returns {*} flat array of events
             */
            $scope.allEvents = function () {
                if ($scope.events === undefined) {
                    return [];
                }
                return _.filter(_.flatten($scope.events), function (event) {
                    return event !== undefined;
                });
            };

        }
    ]
);


/**
 * View model for keeping summary data about monthly calendar
 */
angular.module('chronos.calendar').
    controller('CalendarModel31',
    ['$scope',
        function ($scope) {

            /**
             * Action performed after events are loaded
             * @param events new loaded events
             */
            $scope.afterEventsLoad = function (events) {
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

        }
    ]
);




