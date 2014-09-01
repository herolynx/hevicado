'use strict';

/**
 * Controller responsible for adding/editing events
 * @param $scope current scope
 * @param $modalInstance current instance of modal window
 * @param newEvent new event to be added
 * @param location location of the event
 * @param CalendarService service managing events
 * @param $log logger
 */
var editEventCtrl = function ($scope, $modalInstance, newEvent, location, CalendarService, $log) {

    $scope.durations = [];
    $scope.isButtonDeleteVisible = false;
    $scope.isButtonSaveVisible = true;

    /**
     * Initialize controller state
     */
    $scope.init = function () {
        if (newEvent != null) {
            $log.debug('Editing new event - start: ' + newEvent.start + ', location: ' + location.address);
            $scope.editedEvent = {
                title: newEvent.title,
                description: '',
                start: newEvent.start,
                duration: newEvent.durations[0],
                location: location,
                owner: 'wrona',
                users: ['patient'],
                color: location.color
            };
            $scope.durations = newEvent.durations;
        }
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
                //TODO show notification
            }
        );
    };

    /**
     * Delete currently edited event
     */
    $scope.delete = function () {
        //TODO implement this
    };

    //initialize controller
    $scope.init();
};