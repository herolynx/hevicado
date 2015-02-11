'use strict';


/**
 * Controller responsible for displaying details about events.
 * It also provides basic options on events (i.e. cancellation).
 * @param $scope controller's scope
 * @param $stateParams state manager
 * @param $controller controller factory for injection event's options
 * @param $log logger
 * @param CalendarService service responsible for providing events
 * @param EventUtils generic functions related with events
 * @param uiNotification notification manager
 */
angular.module('chronos.events').
    controller('DisplayEventCtrl',
    ['$scope', '$stateParams', '$controller', '$log', 'CalendarService', 'EventUtils', 'uiNotification',
        function ($scope, $stateParams, $controller, $log, CalendarService, EventUtils, uiNotification) {

            $scope.options = $scope.$new();
            $controller('TimelineEventCtrl', {$scope: $scope.options});

            /**
             * Load data about event
             * @param id event ID
             */
            $scope.load = function (id) {
                $log.debug('Loading details about event - id: ' + id);
                CalendarService.
                    event(id).
                    success(function (data) {
                        $log.debug('Event details loaded - id: ' + id);
                        EventUtils.normalize(data);
                        $scope.event = data;
                    }).
                    error(function (errResp, errStatus) {
                        $log.info('Couldn\'t load event details: status: ' + errStatus + ', resp: ' + errResp.data);
                        uiNotification.text('Error', 'Couldn\'t load event details').error();
                    });
            };

            $scope.load($stateParams.eventId);

        }
    ]
);