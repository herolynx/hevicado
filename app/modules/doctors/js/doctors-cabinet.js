'use strict';

var cabinet = angular.module('doctors.cabinet', [
    'users.services',
    'commons.users.utils',
    'commons.users.filters'
]);

/**
 * Controller responsible for displaying info about doctor's cabinet
 * @param $scope ctrl's scope
 * @param UsersService service providing doctor's data
 * @param $stateParams parameter manager
 * @param $log logger
 * @param uiNotification UI notification manager
 */
cabinet.controller('CabinetInfoCtrl', function ($scope, UsersService, $stateParams, $log, uiNotification) {

    $scope.doctor = {};

    /**
     * Initialize controller
     * @param doctorId doctor to be displayed
     */
    $scope.init = function (doctorId) {
        $scope.doctorId = doctorId;
        $log.debug('Loading info about doctor: ' + $scope.doctorId);
        UsersService.
            get($scope.doctorId).
            success(function (doctor) {
                $log.debug('Doctor info loaded successfully');
                $scope.doctor = doctor;
            }).
            error(function (errResp, errStatus) {
                $log.error('Couldn\'t load doctor\'s info: ' + errStatus + ', resp: ' + errResp.data);
                uiNotification.text('Error', 'Doctor\'s info not loaded - part of functionality may not workking properly').error();
            }
        );
    };

    if ($stateParams.doctorId != undefined) {
        $scope.init($stateParams.doctorId);
    }

});

cabinet.controller('EditCabinetCtrl', function ($scope, UsersService, Session, $controller, $log, uiNotification) {

    $controller('CabinetInfoCtrl', {$scope: $scope});

    $scope.init(Session.getUserId());

});