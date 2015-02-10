'use strict';

angular.module('chronos.calendar', [
    'chronos.calendar.directives',
    'chronos.events.edit',
    'ui.elements',
    'commons.users.filters'
]);

/**
 * Controller responsible for displayed calendar that belongs to chosen user.
 * @param $scope current scope of controller
 * @param $state current state
 * @param $stateParams current state parameters manager
 * @param $log logger
 * @param CalendarService service managing calendar data
 * @param UsersService service for getting info about calendar owner
 * @param EventUtils generic functionality related with events
 * @param uiNotifications component managing notifications

 */
angular.module('chronos.calendar').
    controller('CalendarCtrl',
    ['$scope', '$state', '$stateParams', '$log', 'CalendarService', 'UsersService', 'EventUtils', 'uiNotification',
        function ($scope, $state, $stateParams, $log, CalendarService, UsersService, EventUtils, uiNotification) {

            /**
             * Include underscore
             */
            $scope._ = _;
            $scope.hours = _.range(0, 24);
            $scope.quarters = _.range(0, 2);
            $scope.quarterLength = 60 / $scope.quarters.length;

            $scope.beginDate = Date.today();
            $scope.endDate = Date.today();
            $scope.currentDate = Date.today();

            $scope.viewType = 7;
            $scope.days = [];

            $scope.events = [];

            $scope.filter = {
                showCancelled: false,
                accept: function (event) {
                    if (!this.showCancelled && event.cancelled != undefined) {
                        return false;
                    }
                    return true;
                }
            };

            /**
             * Create days based on given time period
             * @param startDate begin date
             * @param endDate end date
             * @return arrays with days
             */
            $scope.createDays = function (startDate, endDate) {
                $log.debug('Setting time period - startDate: ' + startDate + ", endDate: " + endDate);
                var currentDate = startDate.clone();
                var days = [];
                do {
                    days.push(currentDate.clone().clearTime());
                    currentDate = currentDate.add(1).days();
                } while (currentDate.isBefore(endDate));
                return days;
            };

            /**
             * Load calendar data for given days
             * @param days dates for which data should be loaded
             */
            $scope.loadCalendarData = function (days) {
                var startDate = days[0];
                var endDate = days[days.length - 1].clone().set({hour: 23, minute: 59, second: 59});
                $log.debug('Loading calendar events - startDate: ' + startDate + ", end date: " + endDate);
                CalendarService.
                    events(startDate, endDate).
                    success(function (data) {
                        $log.debug('Events loaded - data size: ' + data.length);
                        _.map(data, EventUtils.normalize);
                        var events = _.filter(data, function (event) {
                            return $scope.filter.accept(event);
                        });
                        $scope.events.length = 0;
                        $scope.onEventsLoad(events);
                    }).
                    error(function (data, status) {
                        $log.error('Couldn\'t load events - data: ' + data + ', status: ' + status);
                        uiNotification.text('Error', 'Couldn\'t load events').error();
                    });
            };

            /**
             * Initialize calendar with chosen time period to be displayed
             */
            $scope.init = function () {
                $log.debug('Initializing calendar for doctor: ' + $stateParams.doctorId + ', param current date: ' + $stateParams.currentDate);
                $scope.doctorId = $stateParams.doctorId;
                CalendarService.init($stateParams.doctorId);
                $log.debug('Initializing calendar - view type: ' + $state.current.daysAmount);
                $scope.viewType = $state.current.daysAmount;
                var day = $stateParams.currentDate != undefined ? new Date($stateParams.currentDate) : new Date();
                $scope.loadDoctorInfo();
                $scope.initView(day);
            };

            /**
             * Initialize view
             * @param day current day
             */
            $scope.initView = function (day) {
                if ($scope.viewType == 31) {
                    $scope.month(0, day);
                } else if ($scope.viewType == 7) {
                    $scope.week(0, day);
                } else {
                    $scope.day(0, day);
                }
            };

            /**
             * Load info about doctor who is owner of a calendar
             */
            $scope.loadDoctorInfo = function () {
                $log.debug('Loading info about doctor: ' + $scope.doctorId);
                UsersService.
                    get($scope.doctorId).
                    success(function (doctor) {
                        $log.debug('Doctor info loaded successfully');
                        $scope.doctor = doctor;
                        $scope.onDoctorLoad(doctor);
                    }).
                    error(function (errResp, errStatus) {
                        $log.error('Couldn\'t load doctor\'s info: ' + errStatus + ', resp: ' + errResp.data);
                        uiNotification.text('Error', 'Doctor\'s info not loaded - part of functionality may not workking properly').error();
                    }
                );
            };

            /**
             * Execution action after doctor load
             * @param doctor current doctor
             */
            $scope.onDoctorLoad = function (doctor) {
                //empty
            };

            /**
             * Init time period based on type of calendar view and current date
             * @param currentDate current date displayed
             */
            $scope.initTimePeriod = function (currentDate) {
                if ($scope.viewType == 31) {
                    $scope.beginDate = EventUtils.currentMonday(currentDate.clone().moveToFirstDayOfMonth());
                    $scope.endDate = currentDate.clone().moveToLastDayOfMonth().next().monday();
                } else if ($scope.viewType == 7) {
                    $scope.beginDate = EventUtils.currentMonday(currentDate);
                    $scope.endDate = $scope.beginDate.clone().add(7).days();
                } else {
                    $scope.beginDate = currentDate.clone();
                    $scope.endDate = currentDate.clone();
                }
            };

            /**
             * Refresh calendar's data
             */
            $scope.refresh = function () {
                $scope.loadCalendarData($scope.days);
            };

            /**
             * Shift week
             * @param direction shift direction (1 next, -1 prev, 0 current)
             * @param newDate optional date that setts current week
             */
            $scope.week = function (direction, newDate) {
                $log.debug('Shift week - director: ' + direction + ', new date: ' + newDate);
                var date = newDate || $scope.currentDate;
                $scope.currentDate = date.add(7 * direction).days();
                $scope.initTimePeriod($scope.currentDate);
                $scope.days = $scope.createDays($scope.beginDate, $scope.endDate);
                $scope.refresh();
            };

            /**
             * Shift year
             * @param direction shift direction (1 next, -1 prev, 0 current)
             * @param newDate optional date that setts current week
             */
            $scope.year = function (direction, newDate) {
                $log.debug('Shift year - director: ' + direction + ', new date: ' + newDate);
                var date = newDate || $scope.currentDate;
                $scope.currentDate = date.add(direction).years();
                $scope.initTimePeriod($scope.currentDate);
                $scope.days = $scope.createDays($scope.beginDate, $scope.endDate);
                $scope.refresh();
            };

            /**
             * Shift month
             * @param direction shift direction (1 next, -1 prev, 0 current)
             * @param newDate optional date that setts current week
             */
            $scope.month = function (direction, newDate) {
                $log.debug('Shift month - director: ' + direction + ', new date: ' + newDate);
                var date = newDate || $scope.currentDate;
                $scope.currentDate = date.add(direction).month();
                $scope.initTimePeriod($scope.currentDate);
                $scope.days = $scope.createDays($scope.beginDate, $scope.endDate);
                $scope.refresh();
            };

            /**
             * Set chosen month of current year
             * @param month number of month to be set
             */
            $scope.setMonth = function (month) {
                $log.debug('Set month - month: ' + month);
                var date = newDate || $scope.currentDate;
                date.set({
                    month: month
                });
                $scope.currentDate = date;
                $scope.initTimePeriod($scope.currentDate);
                $scope.days = $scope.createDays($scope.beginDate, $scope.endDate);
                $scope.refresh();
            };

            /**
             * Shift day
             * @param direction shift direction (1 next, -1 prev, 0 current)
             * @param newDate optional date that setts current week
             */
            $scope.day = function (direction, newDate) {
                $log.debug('Shift day - director: ' + direction + ', new date: ' + newDate);
                var date = newDate || $scope.currentDate;
                $scope.currentDate = date.add(direction).days();
                $scope.initTimePeriod($scope.currentDate);
                $scope.days = $scope.createDays($scope.beginDate, $scope.endDate);
                $scope.refresh();
            };

            /**
             * Open/close date-picker
             */
            $scope.showDatePicker = function ($event) {
                $log.debug("Show date-picker: " + !$scope.datePickerOpened);
                $event.preventDefault();
                $event.stopPropagation();
                $scope.datePickerOpened = !$scope.datePickerOpened;
            };

            /**
             * Handler for changing date using date-picker
             */
            $scope.onDatePickerDateChange = function () {
                $log.debug('Date picked date changed to: ' + $scope.currentDate);
                $scope.datePickerOpened = false;
                $scope.initView($scope.currentDate);
            };

        }
    ]
);

