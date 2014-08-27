'use strict';

var editEventCtrl = function ($scope, $modalInstance, newEvent, location, $log) {

    $scope.durations = [];
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

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.save = function () {

    };

    $scope.delete = function () {

    };
};