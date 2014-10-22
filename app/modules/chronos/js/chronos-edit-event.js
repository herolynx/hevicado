'use strict';

var calendar = angular.module('chronos.events.edit', []);

/**
 * Controller responsible for adding/editing events
 * @param $scope current scope
 * @param $modalInstance current instance of modal window
 * @param eventToEdit event to be added/edited
 * @param options options for editing events
 * @param CalendarService service managing events
 * @param uiNotification notification manager
 * @param $log logger
 */
calendar.controller('EditEventCtrl', function ($scope, $state, $stateParams, CalendarService, uiNotification, $log) {

    $scope.durations = [];
    //TODO load access rights
    $scope.isButtonDeleteVisible = false; //eventToEdit.id !== undefined;
    $scope.isButtonSaveVisible = true;
    $scope.editedEvent = {};

    console.info($stateParams.event);

    /**
     * Initialize controller state
     */
    $scope.init = function () {
        if ($stateParams.eventId !== null) {
            $log.debug('Editing existing event - id: ' + $stateParams.eventId);

            $scope.loadEvent($stateParams.eventId);
        } else {
            var startTime = $stateParams.start || Date.today();
            $log.debug('Editing new event - id: ' + startTime);
            $scope.editedEvent = {
                start: startTime,
            };
        }
        $scope.durations = options.durations;
    };

     $scope.loadOptions = function () {
        // $scope.editedEvent = {
        //         title: options.templates[0].name,
        //         description: options.templates[0].description,
        //         start: startTime,
        //         duration: options.durations[0],
        //         location: options.location.address,
        //         owner: options.owner,
        //         users: options.users,
        //         color: options.location.color
        //     };
    };

    $scope.loadEvent = function (eventId) {

    };

    /**
     * Cancel edition of an event
     */
    $scope.cancel = function () {
        //        $modalInstance.dismiss('cancel');
    };

    /**
     * Save currently edited event
     */
    $scope.save = function () {
        $log.debug('Saving event - id: ' + $scope.editedEvent.id + ', start: ' + $scope.editedEvent.start + ', title: ' + $scope.editedEvent.title);
        $scope.editedEvent.start = new Date($scope.editedEvent.start);
        $scope.editedEvent.end = $scope.editedEvent.start.clone().add($scope.editedEvent.duration).minute();
        CalendarService.save($scope.editedEvent).then(
            function (resp) {
                $log.info('Event saved successfully: event id: ' + resp.data.id);
                //TODO return data from resp when BE is there
                $scope.editedEvent.id = resp.data.id;
                $scope.$emit('EVENT_CHANGED', $scope.editedEvent);
                $modalInstance.close($scope.editedEvent);
            },
            function (errResp, errStatus) {
                $log.info('Event hasn\'t been saved: status: ' + errStatus + ', resp: ' + errResp.data);
                uiNotification.text('Error', 'Event hasn\'t been saved').error();
            }
        );
    };

    /**
     * Delete currently edited event
     */
    $scope.delete = function () {
        $log.debug('Deleting event - id: ' + $scope.editedEvent.id);
        CalendarService.delete($scope.editedEvent.id).then(
            function (resp) {
                $log.info('Event deleted successfully: event id: ' + $scope.editedEvent.id);
                //TODO return data from resp when BE is there
                $scope.$emit('EVENT_DELETED', $scope.editedEvent);
                //                $modalInstance.close('EVENT_DELETED');
            },
            function (errResp, errStatus) {
                $log.info('Event hasn\'t been deleted: status: ' + errStatus + ', resp: ' + errResp.data);
                uiNotification.text('Error', 'Event hasn\'t been deleted').error();
            }
        );
    };

    //initialize controller
    $scope.init();
});