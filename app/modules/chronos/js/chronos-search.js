'use strict';

var search = angular.module('chronos.search', [
    'chronos.services',
    'commons.users.filters',
    'commons.users.directives',
    'infinite-scroll'
]);

/**
 * Controller managing searching of doctors and free visits
 *
 * @param $scope current scope of controller
 * @param $log logger
 * @param CalendarService service managing visit related data
 * @param EventUtils generic functionality related with events
 * @param uiNotification notification service
 */
search.controller('SearchDoctorCtrl', function ($scope, $log, CalendarService, EventUtils, uiNotification) {

    $scope.daysCount = 7;
    $scope.loading = false;
    $scope.eof = false;
    $scope.start = Date.today();
    $scope.criteria = {
        name: '',
        localization: '',
        start: null,
        end: null,
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
        $scope.criteria.start = EventUtils.currentMonday(date);
        $scope.criteria.end = $scope.criteria.start.clone().add(daysCount - 1).days().set({
            hour: 23,
            minute: 59,
            second: 59
        });
        $log.debug('Timetable set - start: ' + $scope.criteria.start + ', end: ' + $scope.criteria.end);
    };

    /**
     * Clear current state of search
     */
    $scope.clear = function () {
        $scope.doctors = [];
        $scope.criteria.startIndex = -$scope.criteria.count;
        $scope.eof = false;
    };

    /**
     * Search doctors by given criteria
     */
    $scope.search = function () {
        $log.debug('Searching doctors - name:' + $scope.criteria.name + ', start: ' + $scope.criteria.start);
        $scope.clear();
        $scope.initTimetable($scope.start, $scope.daysCount);
        $scope.nextDoctors();
    };

    /**
     * Move current time window forward or backward chosen number of days
     * @param days number of days to shift current time window
     */
    $scope.moveDays = function (days) {
        $log.debug('Search doctors - moving days: ' + days);
        $scope.clear();
        $scope.criteria.start.add(days).days();
        $scope.criteria.end.add(days).days();
        $log.debug('Shifted time table - start: ' + $scope.criteria.start + ', end: ' + $scope.criteria.end);
        $scope.nextDoctors();
    };

    /**
     * Load next page of data for doctors
     */
    $scope.nextDoctors = function () {
        if ($scope.loading || $scope.eof) {
            return;
        }
        $log.debug('Searching next doctors');
        $scope.loading = true;
        $scope.criteria.startIndex += $scope.criteria.count;
        CalendarService.search($scope.criteria).
            success(function (data) {
                $log.debug('Doctors found - data size: ' + data.length);
                $scope.doctors = $scope.doctors.concat(data);
                $scope.eof = data.length == 0;
                $scope.loading = false;
            }).
            error(function (data, status) {
                $log.error('Couldn\'t find doctors - data: ' + data + ', status: ' + status);
                uiNotification.text('Error', 'Couldn\'t find doctors').error();
                $scope.eof = true;
                $scope.loading = false;
            });
    };

    /**
     * Convert string to date
     * @param string date in string representation
     * @returns {Date} non-nullable instance
     */
    $scope.toDate = function (string) {
        return new Date(string);
    };

    /**
     * Count percentage of free time
     * @param info calendar info
     * @returns {number} non-negative number
     */
    $scope.free = function (info) {
        if (info.total == 0) {
            return 0;
        }
        return Math.ceil(100 - ((info.occupied / info.total) * 100));
    };

    $scope.initTimetable($scope.start, $scope.daysCount);

});