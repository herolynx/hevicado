'use strict';

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
angular.module('chronos.timeline').
    controller('TimelineEventCtrl',
    ['$scope', '$log', 'CalendarService', 'EventActionManager', 'EventUtils', 'EVENT_STATE', 'uiNotification',
        function ($scope, $log, CalendarService, EventActionManager, EventUtils, EVENT_STATE, uiNotification) {

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
                CalendarService.
                    cancel(event).
                    success(function (data) {
                        $log.debug('Event cancelled');
                        event.cancelled = Date.today();
                        $scope.readState(event);
                    }).
                    error(function (data, status) {
                        $log.error('Couldn\'t cancel event - data: ' + data + ', status: ' + status);
                        uiNotification.text('Error', 'Couldn\'t cancel event').error();
                    });
            };

        }
    ]);
