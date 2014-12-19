'use strict';

var cabinet = angular.module('doctors.cabinet', [
    'users.services',
    'bolt.services',
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

/**
 * Controller responsible for editing cabinet related data.
 *
 * @param $scope ctrl's scope
 * @param UsersService service providing doctor's data
 * @param Session current user's session
 * @param $controller controller for injecting display info cabinet ctrl
 * @param $log logger
 * @param uiNotification UI notification manager
 */
cabinet.controller('EditCabinetCtrl', function ($scope, UsersService, Session, $controller, $log, uiNotification) {

    $scope.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    $scope.specializations = ['Arelogia', 'Reumatologia', 'Dietetyka'];
    $scope.templates = ['Badanie dupy', 'Badanie oka', 'Badanie palca'];

    $controller('CabinetInfoCtrl', {$scope: $scope});

    /**
     * Change doctor's cabinet data.
     * @param doctor doctor to be updated
     */
    $scope.save = function (doctor) {
        $log.debug('Saving doctor\'s cabinet: ' + doctor.email);
        UsersService.
            save(doctor).
            then(function () {
                $log.debug('Changes saved successfully');
            }, function (errResp, errStatus) {
                $log.error('Cabinet hasn\'t been saved: status: ' + errStatus + ', resp: ' + errResp.data);
                uiNotification.text('Error', 'Changes hasn\'t been saved').error();
            }
        );
    };

    /**
     * Add new specialization to search criteria
     *
     *@param specialization new specialization to be added to criteria
     */
    $scope.addSpecialization = function (specialization) {
        $log.debug('Adding specialization: ' + specialization);
        if (specialization != undefined && !_.contains($scope.criteria.specializations, specialization)) {
            $scope.criteria.specializations.push(specialization);
        }
        $scope.newSpecialization = '';
    };

    /**
     * Add value
     * @param array array to be modified
     * @param value optional value to be added. If null empty object will be added.
     */
    $scope.addValue = function (array, value) {
        $log.debug('Adding value');
        var newValue = value || {};
        if (!_.contains(array, newValue)) {
            array.push(newValue);
        }
    };

    /**
     * Delete value
     * @param array array to be modified
     * @param value value to be deleted
     */
    $scope.deleteValue = function (array, value) {
        $log.debug('Deleteing value');
        var index = array.indexOf(value);
        if (index != -1) {
            array.splice(index, 1);
        }
    };

    /**
     * Add new empty location
     * @param array array to be modified
     */
    $scope.addLocation = function (array) {
        $log.debug('Adding location');
        array.push(
            {
                name: "",
                address: {
                    street: "",
                    city: "",
                    country: ""
                },
                color: "turqoise",
                working_hours: [],
                templates: [],
                specializations: []
            }
        );
    };

    /**
     * Add new empty template
     * @param array array to be modified
     */
    $scope.addTemplate = function (array) {
        $log.debug('Adding template');
        array.push(
            {
                name: "",
                durations: []
            }
        );
    };

    $scope.init(Session.getUserId());

});