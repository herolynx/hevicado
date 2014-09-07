'use strict';

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
var editEventCtrl = function ($scope, $modalInstance, eventToEdit, options, CalendarService, uiNotification, $log) {

    $scope.durations = [];
    //TODO load access rights
    $scope.isButtonDeleteVisible = eventToEdit.id !== undefined;
    $scope.isButtonSaveVisible = true;
    $scope.editedEvent = {};

    /**
     * Initialize controller state
     */
    $scope.init = function () {
        if (eventToEdit.id === undefined) {
            $log.debug('Editing new event - start: ' + eventToEdit.start + ', location: ' + options.location);
            $scope.editedEvent = {
                title: eventToEdit.title,
                description: '',
                start: eventToEdit.start,
                duration: options.durations[0],
                location: options.location.address,
                owner: 'wrona',
                users: ['patient'],
                color: options.location.color
            };
        } else {
            $log.debug('Editing event - id: ' + eventToEdit.id);
            $scope.editedEvent = eventToEdit;
        }
        $scope.durations = options.durations;
    };

    /**
     * Cancel edition of an event
     */
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
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
                $modalInstance.close('EVENT_DELETED');
            },
            function (errResp, errStatus) {
                $log.info('Event hasn\'t been deleted: status: ' + errStatus + ', resp: ' + errResp.data);
                uiNotification.text('Error', 'Event hasn\'t been deleted').error();
            }
        );
    };

    //initialize controller
    $scope.init();
};