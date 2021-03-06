'use strict';

/**
 * View model for keeping data for daily and weekly calendar
 *
 * @param $scope ctrl scope
 * @param CalendarRenderer renderer for showing events in proper time lines
 * @param $controller component for injecting other sub-controllers
 */
angular.module('chronos.calendar').
    controller('WeeklyCalendarCtrl',
    ['$scope', 'CalendarRenderer', '$controller',
        function ($scope, CalendarRenderer, $controller) {

            $controller('CalendarCtrl', {$scope: $scope});
            $controller('CalendarEditorCtrl', {$scope: $scope});

            $scope.location = [];

            /**
             * Action performed after events are loaded
             * @param events new loaded events
             */
            $scope.onEventsLoad = function (events) {
                _.map(events, $scope.attachEvent);
                _.map($scope.days, $scope.buildTimeline);
            };

            /**
             * Attach event to calendar grid
             * @param event event to be attached
             */
            $scope.attachEvent = function (event) {
                //get keys
                var day = event.start.getDate();
                var hour = event.start.getHours();
                var quarter = Math.floor(event.start.getMinutes() / $scope.quarterLength);
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
                var quarter = Math.floor(event.start.getMinutes() / $scope.quarterLength);
                //prepare place
                var days = $scope.events[day] || [];
                if (days !== undefined) {
                    var hours = days[hour] || [];
                    if (hours !== undefined) {
                        var quarters = hours[quarter] || [];
                        if (quarters !== undefined) {
                            var index = _.chain(quarters).pluck("id").indexOf(event.id).value();
                            if (index != -1) {
                                quarters.splice(index, 1);
                            }
                        }
                    }
                }
            };

            /**
             * Get all events
             * @param dayEvents day from which all events should be gathered
             * @returns {*} flat array of events
             */
            $scope.flatten = function (dayEvents) {
                if (dayEvents === undefined) {
                    return [];
                }
                return _.filter(_.flatten(dayEvents), function (event) {
                    return event !== undefined;
                });
            };

            /**
             * Build time lines so events can be displayed on calendar properly
             * @param day for which time line should be built
             */
            $scope.buildTimeline = function (day) {
                var dayEvents = $scope.events[day.getDate()];
                CalendarRenderer.attachAll($scope.flatten(dayEvents), $scope.quarterLength);
            };

            /**
             * Build time lines for given time period  so events can be displayed on calendar properly
             * @param startDate beginning of time window
             * @param endDate end of time window
             */
            $scope.buildTimelineFor = function (startDate, endDate) {
                _.map($scope.createDays(startDate, endDate), $scope.buildTimeline);
            };

            /**
             * Prepare frame when doctor is working
             * @param doctor current doctor
             */
            $scope.onDoctorLoad = function (doctor) {
                $scope.location.length = 0;
                _.map(doctor.locations, function (location) {
                    _.map(location.working_hours, function (wh) {
                        var day = $scope.dayNameToIndex(wh.day);
                        var currHour = hourToDate(wh.start, wh.tzOffset);
                        var endHour = hourToDate(wh.end, wh.tzOffset);
                        do {
                            var quarter = currHour.getMinutes() / $scope.quarterLength;
                            var hours = $scope.location[day] || [];
                            $scope.location[day] = hours;
                            var quarters = hours[currHour.getHours()] || [];
                            hours[currHour.getHours()] = quarters;
                            quarters[quarter] = location.color;
                        } while (currHour.add($scope.quarterLength).minutes().compareTo(endHour) < 0);
                    });
                });
            };

            $scope.dayNameToIndex = function (dayName) {
                return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(dayName);
            };

            $scope.init();

        }
    ]
);

