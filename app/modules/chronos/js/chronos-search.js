'use strict';

var chronosSearch = angular.module('chronos.search', [
    'chronos.services',
    'commons.users.filters',
    'commons.users.directives',
    'commons.labels',
    'commons.labels.filters',
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
 * @param Labels labels manager
 */
chronosSearch.controller('SearchDoctorCtrl',
    ['$scope', '$log', 'CalendarService', 'EventUtils', 'uiNotification', 'Labels',
        function ($scope, $log, CalendarService, EventUtils, uiNotification, Labels) {

            $scope.daysCount = 7;
            $scope.loading = false;
            $scope.eof = false;
            $scope.start = Date.today();
            $scope.criteria = {
                name: '',
                location: '',
                start: null,
                end: null,
                specializations: [],
                roles: ['doctor'],
                startIndex: 0,
                count: 10
            };
            $scope.newSpecialization = '';
            $scope.specializations = [];
            Labels.getSpecializations()
                .then(function (values) {
                    $scope.specializations = values;
                });
            $scope.doctors = [];

            /**
             * Add new specialization to search criteria
             *
             *@param specialization new specialization to be added to criteria
             */
            $scope.addSpecialization = function (specialization) {
                $log.debug('Adding searched specialization: ' + specialization.value);
                if (specialization != undefined && !_.contains($scope.criteria.specializations, specialization)) {
                    $scope.criteria.specializations.push(specialization);
                }
                $scope.newSpecialization = '';
            };

            /**
             * Delete specialization from search criteria
             *
             *@param specialization specialization to be removed from criteria
             */
            $scope.deleteSpecialization = function (specialization) {
                $log.debug('Deleting searched specialization: ' + specialization);
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
                var normalizedCriteria = angular.copy($scope.criteria);
                normalizedCriteria.specializations = _.map(normalizedCriteria.specializations, function (specialization) {
                    return specialization.key;
                });
                CalendarService.search(normalizedCriteria).
                    success(function (data) {
                        $log.debug('Doctors found - data size: ' + data.length);
                        var result = $scope.normalizeDoctors(data, $scope.criteria.start, $scope.criteria.end);
                        $scope.doctors = $scope.doctors.concat(result);
                        $scope.eof = result.length == 0;
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
             * Normalize all date related information in doctors' data.
             * Some summary info gathered per day must be normalized due to time-zone settings of local user.
             * @param doctors doctors to be normalized
             * @param start start date to be displayed in calendar results
             * @param end end date to be displayed in calendar results
             * @returns {*} new instance of normalized doctors
             */
            $scope.normalizeDoctors = function (doctors, start, end) {
                return _.map(doctors, function (doctor) {
                    var normalizedDoctor = angular.copy(doctor);
                    _.map(normalizedDoctor.locations, function (location) {
                        var calendar = location.calendar;
                        //shift days that are shown before start day due to time-zone settings
                        calendar = $scope.shiftDays(calendar, start, 'isBefore');
                        //shift days that are shown after end day due to time-zone settings
                        calendar = $scope.shiftDays(calendar, end, 'isAfter');
                        location.calendar = calendar;
                        return location;
                    });
                    return normalizedDoctor;
                });
            };

            /**
             * Shift all days that meets criteria to proper day in calendar info
             * @param calendar calendar info with days and assigned summary info
             * @param date date boundary
             * @param type date relation type (isBefore, isAfter)
             * @returns {*} new instance of calendar info
             */
            $scope.shiftDays = function (calendar, date, type) {
                //check which days must be shifted
                var toShift = _.filter(Object.keys(calendar), function (day) {
                    return Date.parse(day)[type](date);
                });
                //create calendar with filtered days
                var normalizedCalendar = {};
                for (var day in calendar) {
                    if (!_.contains(toShift, day)) {
                        normalizedCalendar[day] = calendar[day];
                    }
                }
                //move info between days
                for (var i = 0; i < toShift.length; i++) {
                    var day = toShift[i];
                    var shiftInfo = calendar[day];
                    var info = normalizedCalendar[date.toString('yyyy-MM-dd HH:mm:ss')];
                    for (var value in info) {
                        info[value] += shiftInfo[value];
                    }
                }
                return normalizedCalendar;
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

        }
    ]
);