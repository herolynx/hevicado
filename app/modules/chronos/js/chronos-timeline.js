'use strict';

var controllers = angular.module('chronos.timeline', [
    'chronos.services',
    'infinite-scroll'
]);

/**
 * Controller manages time-line of events
 * @param $scope current scope of controller
 * @param $log logger
 * @param CalendarService service managing calendar events
 */
controllers.controller('TimelineCtrl', function ($scope, $log, CalendarService) {

    $scope.events = [];
    $scope.startDate = Date.today();
    $scope.endDate = Date.today();
    $scope.loading = false;

    /**
     * Initialize controller
     */
    $scope.init = function () {
        $log.debug('Initializing time-line for current user');
        //TODO load user ID from session
        CalendarService.init(1);
    };

    /**
     * Get visits of current time window
     */
    $scope.getVisits = function () {
        $scope.loading = true;
        CalendarService.events($scope.startDate, $scope.endDate).
            success(function (data) {
                $log.debug('Visits loaded - data size: ' + data.length);
                $scope.loading = false;
                for (var i = 0; i < data.length; i++) {
                    $scope.events.push(data[i]);
                }
            }).
            error(function (data, status) {
                $log.error('Couldn\'t load visits - data: ' + data + ', status: ' + status);
                $scope.loading = false;
            });
    };

    /**
     * Init time-line window
     * @param start start date of window
     */
    $scope.initTimeWindow = function (start) {
        $scope.startDate = start;
        $scope.endDate = start.clone().add(7).days();
        $log.debug('User visits time window - start ' + $scope.startDate + ', end: ' + $scope.endDate);
    };

    /**
     * Load next page
     */
    $scope.next = function () {
        $scope.initTimeWindow($scope.endDate);
        $scope.getVisits();
    };

});

/**
 * Controller manages single event on time-line
 * @param $scope current scope of controller
 * @param $log logger
 * @param CalendarService service managing events
 */
controllers.controller('TimelineEventCtrl', function ($scope, $log, CalendarService) {

    /**
     * Cancel given event
     * @param event event to be cancelled
     */
    $scope.cancel = function (event) {
        $log.debug('Cancelling event - id: ' + event.id);
        event.cancelled = Date.today();
        //TODO get current user
        event.cancelledBy = {
            id: 1
        };
        CalendarService.save(event.id).
            success(function (data) {
                $log.debug('Event cancelled');

            }).
            error(function (data, status) {
                $log.error('Couldn\'t cancel event - data: ' + data + ', status: ' + status);
            });
    };

});