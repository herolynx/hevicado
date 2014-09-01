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

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.save = function () {
        $log.debug('Saving event - start: ' + $scope.editedEvent.start + ', title: ' + $scope.editedEvent.title);
        CalendarService.save($scope.editedEvent).then(
            function (resp) {
                $log.info('Event saved successfully: event id: ' + resp.data.id);
                $modalInstance.close(resp.data);
            },
            function (errResp, errStatus) {

            }
        );
    };

    $scope.delete = function () {

    };

    $scope.init();
};