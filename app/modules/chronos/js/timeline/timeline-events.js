'use strict';

/**
 * Controller manages time-line of events
 * @param $scope current scope of controller
 * @param $log logger
 * @param CalendarService service managing calendar events
 * @param EventUtils generic event related functions
 * @param uiNotification notification manager
 */
angular.module('chronos.timeline').
    controller('TimelineCtrl',
    ['$scope', '$log', 'CalendarService', 'EventUtils', 'uiNotification',
        function ($scope, $log, CalendarService, EventUtils, uiNotification) {

            $scope.monthsCount = 3;
            $scope.events = [];
            $scope.startDate = Date.today().add(-$scope.monthsCount).month();
            $scope.endDate = Date.today().add($scope.monthsCount).month();
            $scope.showTillDate = Date.today().add(-4 * $scope.monthsCount).month();
            $scope.loading = false;

            /**
             * Initialize controller
             */
            $scope.init = function () {
                $log.debug('Initializing time-line for current user');
                CalendarService.init();
            };

            /**
             * Get events for given time window
             * @param startDate beginning of time window
             * @param endDate end of time window
             */
            $scope.getEvents = function (startDate, endDate) {
                if ($scope.loading) {
                    //loading already
                    return;
                }
                $scope.loading = true;
                CalendarService.
                    events(startDate, endDate, false).
                    success(function (data) {
                        $log.debug('Events loaded - data size: ' + data.length);
                        $scope.loading = false;
                        _.map(data, EventUtils.normalize);
                        var sorted = _.sortBy(data, 'start').reverse();
                        $scope.events = $scope.events.concat(sorted);
                    }).
                    error(function (data, status) {
                        $log.error('Couldn\'t load events - data: ' + data + ', status: ' + status);
                        uiNotification.text('Error', 'Couldn\'t load events').error();
                        $scope.loading = false;
                    });
            };

            /**
             * Init time-line window
             * @param end end date of window
             * @param monthsCount length of time window in months
             */
            $scope.initTimeWindow = function (end, monthsCount) {
                $log.debug('Setting new time window - current window end date: ' + $scope.endDate + ', new window end date: ' + end + ', months count: ' + monthsCount);
                $scope.startDate = end.clone().add(-monthsCount).months();
                $scope.endDate = end.clone();
            };

            /**
             * Load next portion of data.
             * Function shifts current time-window properly and loads all events for new time period.
             */
            $scope.next = function () {
                if ($scope.startDate.compareTo($scope.showTillDate) > 0) {
                    $scope.initTimeWindow($scope.startDate, $scope.monthsCount);
                    $scope.getEvents($scope.startDate, $scope.endDate);
                }
            };

            $scope.init();
            $scope.getEvents($scope.startDate, $scope.endDate);

        }
    ]);
