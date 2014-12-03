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
 * @param EventUtils generic event related functions
 * @param uiNotification notification manager
 */
timeline.controller('TimelineCtrl', function ($scope, $log, CalendarService, EventUtils, uiNotification) {

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

});

/**
 * Controller manages single event on time-line
 * @param $scope current scope of controller
 * @param $log logger
 * @param CalendarService service managing events
 * @param EventActionManager event action manager
 * @param EventUtils generic event related functionality
 * @param EVENT_STATE all possible states of events
 * @param uiNotification user notification manager
 */
timeline.controller('TimelineEventCtrl', function ($scope, $log, CalendarService, EventActionManager, EventUtils, EVENT_STATE, uiNotification) {

    /**
     * Get controller's action manager
     * @return non-nullable instance
     */
    $scope.actions = function () {
        return EventActionManager;
    };

    $scope.isDisabled = false;
    $scope.isActive = false;
    $scope.state = {value: ""};

    /**
     * Read state of given event
     * @param event event for which state should be checked
     */
    $scope.readState = function (event) {
        var eventState = EventUtils.state(event);
        $scope.isDisabled = eventState == EVENT_STATE.CLOSED || eventState == EVENT_STATE.CANCELLED;
        $scope.isActive = eventState == EVENT_STATE.OPEN;
        $scope.state = eventState;
    };

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
        CalendarService.
            save(event.id).
            success(function (data) {
                $log.debug('Event cancelled');
            }).
            error(function (data, status) {
                $log.error('Couldn\'t cancel event - data: ' + data + ', status: ' + status);
                event.cancelled = null;
                event.cancelledBy = null;
            });
    };

});


/**
 * Directive displays single event on time-line
 */
timeline.directive('calendarTimelineEvent', function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/chronos/partials/calendar-timeline-event.html',
        scope: {
            event: '=event'
        }
    }
});