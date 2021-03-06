'use strict';

/**
 * Controller responsible for editing cabinet related data.
 *
 * @param $scope ctrl's scope
 * @param UsersService service providing doctor's data
 * @param Session current user's session
 * @param $controller controller for injecting display info cabinet ctrl
 * @param $log logger
 * @param uiNotification UI notification manager
 * @param Labels labels manager
 * @param CABINET_COLORS set of available colors for cabinets
 */
angular.module('users.cabinet').
    controller('EditCabinetCtrl',
    ['$scope', 'UsersService', 'Session', '$controller', '$log', 'uiNotification', 'Labels', 'CABINET_COLORS',
        function ($scope, UsersService, Session, $controller, $log, uiNotification, Labels, CABINET_COLORS) {

            $scope._ = _;
            $scope.colors = CABINET_COLORS;
            $scope.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            $scope.specializations = [];
            Labels.getSpecializations()
                .then(function (values) {
                    $scope.specializations = values;
                });
            $scope.templates = [];
            Labels.getTemplates()
                .then(function (values) {
                    $scope.templates = values;
                });
            $controller('CabinetInfoCtrl', {$scope: $scope});

            /**
             * Change doctor's cabinet data.
             * @param doctor doctor to be updated
             */
            $scope.save = function (doctor) {
                $log.debug('Saving doctor\'s cabinet: ' + doctor.email);
                var normalizedDoctor = angular.copy(doctor);
                var workingHours = _.flatten(_.pluck(normalizedDoctor.locations, 'working_hours'));
                _.map(workingHours, function (elm) {
                    elm.start = elm.startDate.toString('HH:mm');
                    elm.end = elm.endDate.toString('HH:mm');
                    elm.tzOffset = -elm.startDate.getTimezoneOffset();
                    delete elm.startDate;
                    delete elm.endDate;
                });
                UsersService.
                    save(normalizedDoctor).
                    success(function () {
                        $log.debug('Changes saved successfully');
                    }).
                    error(function (errResp, errStatus) {
                        $log.error('Cabinet hasn\'t been saved: status: ' + errStatus + ', resp: ' + errResp.data);
                        uiNotification.text('Error', 'Changes hasn\'t been saved').error();
                    }
                );
            };

            /**
             * Add value
             * @param array array to be modified
             * @param value optional value to be added. If null empty object will be added.
             * @param allowedValues array of allowed values
             */
            $scope.addValue = function (array, value, allowedValues) {
                $log.debug('Adding value: ' + value);
                if (value === undefined || value == '') {
                    return;
                }
                var newValue = value;
                if (allowedValues != undefined && !_.contains(allowedValues, newValue)) {
                    return;
                }
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
                $log.debug('Deleting value');
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
                        color: "blue",
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

            /**
             * On template change listener
             * @param field view form field
             * @param templates all templates in given location
             * @param template changed template
             */
            $scope.onTemplateChange = function (field, templates, template) {
                var duplicates = _.filter(templates, function (elm) {
                    return elm.name == template.name;
                });
                field.$setValidity('duplicate', duplicates.length <= 1);
            };

            /**
             * Check whether durations of template are valid
             * @param field view form field
             * @param template template to be checked
             * @returns {boolean} true is field is valid, false otherwise
             */
            $scope.isTemplateDurationValid = function (field, template) {
                var valid = template.durations.length > 0;
                field.$setValidity('durations', valid);
                return valid;
            };

            /**
             * Check whether  src working hours is overlapping tgt working hours
             * @param src source working hours
             * @param tgt targt working hours
             * @returns {boolean} true if working hours overlaps, false otherwise
             */
            $scope.overLaps = function (src, tgt) {
                return src.day == tgt.day && (
                    (src.startDate.compareTo(tgt.startDate) >= 0 && src.endDate.compareTo(tgt.endDate) < 0)
                    ||
                    (src.endDate.compareTo(tgt.startDate) > 0 && src.endDate.compareTo(tgt.endDate) <= 0)
                    );
            };

            /**
             * On working hour change listener
             * @param field view form field
             * @param workingHour change working hours
             */
            $scope.onWorkingHoursChange = function (field, workingHour) {
                if (workingHour.startDate == null || workingHour.endDate == null) {
                    return;
                }
                var workingHours = _.flatten(_.pluck($scope.doctor.locations, 'working_hours'));
                var duplicates = _.filter(workingHours, function (elm) {
                    return $scope.overLaps(workingHour, elm) || $scope.overLaps(elm, workingHour);
                });
                field.$setValidity('order', workingHour.startDate.isBefore(workingHour.endDate));
                field.$setValidity('duplicate', duplicates.length <= 1);
            };

            $scope.init(Session.getUserId(), function () {
                $log.debug('Denormalizing working hours');
                var workingHours = _.flatten(_.pluck($scope.doctor.locations, 'working_hours'));
                _.map(workingHours, function (elm) {
                    elm.startDate = hourToDate(elm.start, elm.tzOffset);
                    elm.endDate = hourToDate(elm.end, elm.tzOffset);
                });
            });

        }
    ]);