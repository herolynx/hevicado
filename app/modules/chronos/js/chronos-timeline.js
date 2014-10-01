'use strict';

var timeline = angular.module('chronos.timeline', [
    'chronos.services',
    'infinite-scroll'
]);

/**
 * Controller manages time-line of events
 * @param $scope current scope of controller
 * @param $log logger
 * @param CalendarService service managing calendar events
 * @param uiNotification notification manager
 */
timeline.controller('TimelineCtrl', function ($scope, $log, CalendarService, uiNotification) {

    $scope.daysCount = 7;
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
     * Get events for given time window
     * @param startDate beginning of time window
     * @param endDate end of time window
     */
    $scope.getEvents = function (startDate, endDate) {
        $scope.loading = true;
        CalendarService.events(startDate, endDate).
        success(function (data) {
            $log.debug('Events loaded - data size: ' + data.length);
            $scope.loading = false;
            for (var i = 0; i < data.length; i++) {
                $scope.events.push(data[i]);
            }
        }).
        error(function (data, status) {
            $log.error('Couldn\'t load events - data: ' + data + ', status: ' + status);
            uiNotification.text('Error', 'Couldn\'t load events').error();
            $scope.loading = false;
        });
    };

    /**
     * Init time-line window
     * @param start start date of window
     * @param daysCount length of time window in days
     */
    $scope.initTimeWindow = function (start, daysCount) {
        $log.debug('Setting new time window - current window start date: ' + $scope.startDate + ', new window start date: ' + start + ', days count: ' + daysCount);
        $scope.startDate = start.clone();
        $scope.endDate = start.clone().add(daysCount).days();
    };

    /**
     * Load next portion of data.
     * Function shifts current time-window properly and loads all events for new time period.
     */
    $scope.next = function () {
        $scope.initTimeWindow($scope.endDate, $scope.daysCount);
        $scope.getEvents($scope.startDate, $scope.endDate);
    };

});

/**
 * Controller manages single event on time-line
 * @param $scope current scope of controller
 * @param $log logger
 * @param CalendarService service managing events
 * @param EventActionManager event action manager
 * @param EventUtils generic event related functionality
 * @param uiNotification user notification manager
 */
timeline.controller('TimelineEventCtrl', function ($scope, $log, CalendarService, EventActionManager, EventUtils, uiNotification) {

    /**
     * Get controller's action manager
     * @return non-nullable instance
     */
    $scope.actions = function () {
        return EventActionManager;
    }

    /**
     * Get state of given event
     * @param event event for which state should be checked
     * @return non-nullable event state
     */
    $scope.state = function (event) {
        return EventUtils.state(event);
    }

    /**
     * Cancel given event
     * @param event event to be cancelled
     */
    $scope.cancel = function (event) {
        $log.debug('Cancelling event - id: ' + event.id);
        if (!EventActionManager.canCancel(event)) {
            $log.error('Event cannot be cancelled');
            uiNotification.text('Error', 'Event cannot be cancelled').error();
            return;
        }
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