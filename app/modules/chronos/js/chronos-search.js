'use strict';

var search = angular.module('chronos.search', [
    'chronos.services',
    'users.services',
    'infinite-scroll'
]);


search.controller('SearchDoctorCtrl', function ($scope, $log, UsersService, uiNotification) {

    $scope.daysCount = 7;
    $scope.loading = 1;

    $scope.criteria = {
        name: '',
        startDate: Date.today(),
        endDate: Date.today().add($scope.daysCount).days(),
        specializations: [{
            id: 1,
            name: 'Alergologia'
        }]
    };

    $scope.newSpecialization = '';

    $scope.getSpecializations = function (expression) {
        return [{
            id: 1,
            name: 'Alergologia'
        }, {
            id: 2,
            name: 'Reumatalogia'
        }, {
            id: 3,
            name: 'Dietetyka'
        }];
    };

    $scope.addSpecialization = function (specialization) {

    };

    $scope.deleteSpacialization = function (specialization) {

    };

    $scope.doctors = [];

    $scope.search = function (criteria) {
        $log.debug('Searching doctors');
        $scope.doctors = [];
        $scope.nextDoctors();
    };

    $scope.nextDoctors = function () {
        $log.debug('Searching next doctors');
        var userCriteria = {

        };
        $scope.loading = true;
        UsersService.search(userCriteria).
        success(function (data) {
            $log.debug('Doctors found - data size: ' + data.length);
            $scope.loading = false;
            for (var i = 0; i < data.length; i++) {
                $scope.doctors.push(data[i]);
            }
        }).
        error(function (data, status) {
            $log.error('Couldn\'t search doctors - data: ' + data + ', status: ' + status);
            uiNotification.text('Error', 'Couldn\'t search doctors').error();
            $scope.loading = false;
        });
    };

});