'use strict';

var search = angular.module('chronos.search', [
    'chronos.services',
    'users.services',
    'infinite-scroll'
]);

/**
 * Contoller managing searching of doctors and free visits
 *
 * @param $scope current scope of controller
 * @param $log logger
 * @param UsersService service managing user related data
 * @param uiNotification notification service
 */
search.controller('SearchDoctorCtrl', function ($scope, $log, UsersService, uiNotification) {

    $scope.daysCount = 7;
    $scope.loading = false;
    $scope.startDate = Date.today();
    $scope.criteria = {
        name: '',
        localization: '',
        startDate: null,
        endDate: null,
        specializations: [],
        startIndex: 0,
        count: 10
    };
    $scope.newSpecialization = '';
    $scope.doctors = [];

    /**
     * Load available specialization
     */
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

    /**
     * Add new specialization to search criteria
     *
     *@param specialization new specialization to be added to criteria
     */
    $scope.addSpecialization = function (specialization) {
        $scope.criteria.specializations.push(specialization);
    };

    /**
     * Dleet specialization from search criteria
     *
     *@param specialization specialization to be removed from criteria
     */
    $scope.deleteSpacialization = function (specialization) {
        var index = $scope.criteria.specializations.indexOf(specialization);
        if (index != -1) {
            $scope.criteria.specializations.splice(index, 1);
        }
    };

    /**
     * Open date-picker
     */
    $scope.openDatePicker = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
    };

    /**
     * Set time-table for search
     *
     *@date date chosen date that should be embraced in time window
     *@date daysCount length in days of time window
     */
    $scope.initTimetable = function (date, daysCount) {
        $scope.criteria.startDate = date.clone().moveToDayOfWeek(1, -1);
        $scope.criteria.endDate = $scope.criteria.startDate.clone().add(daysCount).days();
        $log.debug('Timetable set - start: ' + $scope.criteria.startDate + ', end: ' + $scope.criteria.endDate);
    };

    /**
     * Clear current state of search
     */
    $scope.clear = function () {
        $scope.doctors = [];
        $scope.criteria.startIndex = -$scope.criteria.count;
    };

    /**
     * Search doctors by given criteria
     */
    $scope.search = function () {
        $log.debug('Searching doctors - name:' + $scope.criteria.name + ', start: ' + $scope.criteria.startDate);
        $scope.clear();
        $scope.initTimetable($scope.date, $scope.daysCount);
        $scope.nextDoctors();
    };

    /**
     * Move current time window forward or backward chosen number of days
     * @param days number of days to shift current time window
     */
    $scope.moveDays = function (days) {
        $log.debug('Search doctors - moving days: ' + days);
        $scope.clear();
        $scope.criteria.startDate.add(days).days();
        $scope.criteria.endDate.add(days).days();
        $scope.nextDoctors();
    };

    /**
     * Load next page of data for doctors
     */
    $scope.nextDoctors = function () {
        $log.debug('Searching next doctors');
        $scope.loading = true;
        $scope.criteria.startIndex += $scope.criteria.count;
        UsersService.search($scope.criteria).
        success(function (data) {
            $log.debug('Doctors found - data size: ' + data.length);
            $scope.loading = false;
            for (var i = 0; i < data.length; i++) {
                $scope.doctors.push(data[i]);
            }
        }).
        error(function (data, status) {
            $log.error('Couldn\'t find doctors - data: ' + data + ', status: ' + status);
            uiNotification.text('Error', 'Couldn\'t find doctors').error();
            $scope.loading = false;
        });
    };

    $scope.initTimetable($scope.startDate, $scope.daysCount);

});