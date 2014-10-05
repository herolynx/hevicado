'use strict';

var search = angular.module('chronos.search', [
    'chronos.services',
]);


search.controller('SearchDoctorCtrl', function ($scope, $log) {

	// $scope.specializations = ['Alergologia', 'Reumatalogia', 'Psychologia', 'Dietetyka'];

    $scope.criteria = {
        specializations: ['Reumatalogia', 'Psychologia']
    };

    $scope.newSpecialization = '';

    $scope.getSpecializations = function(expression) {
    	return ['Alergologia', 'Reumatalogia', 'Psychologia', 'Dietetyka'];
    };

    $scope.addSpecialization = function (specialization) {

    };

    $scope.deleteSpacialization = function (specialization) {

    };

    $scope.search = function (criteria) {

    };

});