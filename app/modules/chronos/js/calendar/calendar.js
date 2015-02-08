'use strict';

angular.module('chronos.calendar', [
    'chronos.events.edit',
    'ui.elements',
    'commons.users.filters'
]);

/**
 * Controller responsible for displayed calendar that belongs to chosen user.
 * @param $rootScope root scope for broadcasting calendar related events
 * @param $scope current scope of controller
 * @param @state state manager
 * @param $stateParams current state parameters manager
 * @param $log logger
 * @param CalendarService service managing calendar data
 * @param CalendarRenderer renderer for attaching events to proper time lines
 * @param CALENDAR_EVENTS events used for calendar notifications
 * @param EventActionManager event action validator
 * @param EventUtils generic functionality related with events
 * @param uiNotifications component managing notifications
 * @param UsersService service for getting info about calendar owner
 */
angular.module('chronos.calendar').
    controller('CalendarCtrl',
    ['$rootScope', '$scope', '$state', '$stateParams', '$log', '$controller',
        'CalendarService', 'CalendarRenderer', 'CALENDAR_EVENTS', 'EventActionManager', 'EventUtils', 'uiNotification', 'UsersService',
        function ($rootScope, $scope, $state, $stateParams, $log, $controller,
                  CalendarService, CalendarRenderer, CALENDAR_EVENTS, EventActionManager, EventUtils, uiNotification, UsersService) {

            /**
             * Include underscore
             */
            $scope._ = _;
            $scope.hours = _.range(0, 24);
            $scope.quarters = _.range(0, 4);
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
                        $scope.events = [];
                        $scope.afterEventsLoad(events);
                        _.map(events, $scope.attachEvent);
                        _.map($scope.days, $scope.buildTimeline);
                    }).
                    error(function (data, status) {
                        $log.error('Couldn\'t load events - data: ' + data + ', status: ' + status);
                        uiNotification.text('Error', 'Couldn\'t load events').error();
                    });
            };

            /**
             * Build time lines so events can be displayed on calendar properly
             * @param day for which time line should be built
             */
            $scope.buildTimeline = function (day) {
                var dayEvents = $scope.events[day.getDate()];
                CalendarRenderer.attachAll($scope.allEvents());
            };

            /**
             * Build time lines for given time period  so events can be displayed on calendar properly
             * @param startDate beginning of time window
             * @param endDate end of time window
             */
            $scope.buildTimelineFor = function (startDate, endDate) {
                _.map($scope.createDays(startDate, endDate), $scope.buildTimeline);
            };

            /**
             * Initialize calendar with chosen time period to be displayed
             *
             * @param daysAmount number of days to be displayed on calendar
             * @param day optional day that should be used in initialized of calendar
             */
            $scope.init = function (daysAmount, day) {
                $log.debug('Initializing calendar for doctor: ' + $stateParams.doctorId + ', param current date: ' + $stateParams.currentDate);
                day = $stateParams.currentDate != undefined ? new Date($stateParams.currentDate) : day;
                $scope.doctorId = $stateParams.doctorId;
                $scope.loadDoctorInfo();
                $scope.viewType = daysAmount;
                CalendarService.init($stateParams.doctorId);
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
                    }).
                    error(function (errResp, errStatus) {
                        $log.error('Couldn\'t load doctor\'s info: ' + errStatus + ', resp: ' + errResp.data);
                        uiNotification.text('Error', 'Doctor\'s info not loaded - part of functionality may not workking properly').error();
                    }
                );
            };

            /**
             * Init time period based on type of calendar view and current date
             * @param currentDate current date displayed
             */
            $scope.initTimePeriod = function (currentDate) {
                if ($scope.viewType == 31) {
                    $controller('CalendarModel31', {$scope: $scope});
                    $scope.beginDate = EventUtils.currentMonday(currentDate.clone().moveToFirstDayOfMonth());
                    $scope.endDate = currentDate.clone().moveToLastDayOfMonth().next().monday();
                } else if ($scope.viewType == 7) {
                    $controller('CalendarModel7', {$scope: $scope});
                    $scope.beginDate = EventUtils.currentMonday(currentDate);
                    $scope.endDate = $scope.beginDate.clone().add(7).days();
                } else {
                    $controller('CalendarModel7', {$scope: $scope});
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
             * Add new event to calendar
             * @param day day of new event
             * @param hour optional starting hour of event
             * @param minute optional minutes of starting time
             */
            $scope.addEvent = function (day, hour, minute) {
                //prepare start date
                var date = day.clone();
                date = date.set({
                    hour: hour || 0,
                    minute: minute || 0,
                    second: 0
                });
                var visitEditionStates = [$state.current.data.addVisitState, $state.current.data.editVisitState];
                if (!_.contains(visitEditionStates, $state.current.name)) {
                    $log.debug('Add new event - start: ' + date);
                    $state.go($state.current.data.addVisitState, {
                        doctorId: $scope.doctorId,
                        startTime: date.toString('yyyy-MM-dd HH:mm'),
                        currentDate: date.toString('yyyy-MM-dd')
                    });
                } else {
                    $log.debug('Event date clicked - start: ' + date);
                    $rootScope.$broadcast(CALENDAR_EVENTS.CALENDAR_TIME_PICKED, date);
                }
            };

            /**
             * Edit event
             * @param event event to be edited
             */
            $scope.editEvent = function (event) {
                $log.debug('Editing event - id: ' + event.id);
                $state.go($state.current.data.editVisitState, {
                    doctorId: $scope.doctorId,
                    eventId: event.id,
                    currentDate: event.start.toString('yyyy-MM-dd')
                });
            };

            /**
             * Handle on drop event
             * @param dndEvent DnD event
             * @param calendarEvent moved event
             * @param day new day of event
             * @param hour new hour of event
             * @param minute new minute of event
             */
            $scope.dndDrop = function (dndEvent, calendarEvent, day, hour, minute) {
                $log.debug('DnD stop on - day: ' + day + ', hour: ' + hour + ', minutes: ' + minute);
                $log.debug('DnD event moved - title: ' + calendarEvent.title + ', start: ' + calendarEvent.start + ', duration: ' + calendarEvent.duration);
                EventUtils.normalize(calendarEvent);
                if (!EventActionManager.canEdit(calendarEvent)) {
                    $log.error('Event cannot be changed as not editable');
                    return;
                }
                var newStartDate = day.clone().set({
                    hour: hour,
                    minute: minute
                });
                var newEndDate = newStartDate.clone().add(calendarEvent.duration).minute();
                $scope.saveEvent(calendarEvent, newStartDate, newEndDate, calendarEvent.start.clone(), calendarEvent.end.clone());
            };

            /**
             * Save new time period of an event
             * @param event event to be saved/modified
             * @param newStartDate new begin date to be saved
             * @param newEndDate new end date to be saved
             * @param oldStartDate old begin date for fallback
             * @param oldEndDate old end date for fallback
             */
            $scope.saveEvent = function (event, newStartDate, newEndDate, oldStartDate, oldEndDate) {
                $scope.detachEvent(event);
                $scope.buildTimelineFor(oldStartDate, oldEndDate);
                event.start = newStartDate;
                event.end = newEndDate;
                EventUtils.normalize(event);
                CalendarService.save(event).
                    success(function (response) {
                        $scope.attachEvent(event);
                        $scope.buildTimelineFor(event.start, event.end);
                        $scope.$broadcast(CALENDAR_EVENTS.CALENDAR_RENDER);
                    }).
                    error(function (error) {
                        $log.error('Couldn\'t save event - id: ' + event.id + ', start: ' + event.start + ', error: ' + error);
                        uiNotification.text('Error', 'Couldn\'t save event').error();
                        //fallback
                        event.start = oldStartDate;
                        event.end = oldEndDate;
                        EventUtils.normalize(event);
                        $scope.attachEvent(event);
                        $scope.buildTimelineFor(event.start, event.end);
                        $scope.$broadcast(CALENDAR_EVENTS.CALENDAR_RENDER);
                    });
            };

            /**
             * Cancel event
             * @param event event to be cancelled
             */
            $scope.cancelEvent = function (event) {
                $log.debug('Cancelling event - id: ' + event.id + ', start: ' + event.start);
                if (!EventActionManager.canCancel(event)) {
                    $log.error('Event cannot be cancelled');
                    uiNotification.text('Error', 'Event cannot be cancelled').error();
                    return;
                }
                CalendarService.
                    cancel(event).
                    success(function () {
                        $log.debug('Event cancelled successfully');
                        $scope.detachEvent(event);
                        event.cancelled = new Date();
                        $scope.buildTimelineFor(event.start, event.end);
                        $scope.$broadcast(CALENDAR_EVENTS.CALENDAR_RENDER);
                    }).
                    error(function (error) {
                        $log.error('Couldn\'t cancel event - id: ' + event.id + ', start: ' + event.start + ', error: ' + error);
                        uiNotification.text('Error', 'Couldn\'t cancel event').error();
                    });
            };

            /**
             * Change event time period based on given UI event
             * @param event resizable event
             * @param ui ui element details
             * @param calendarEvent event to be changed
             */
            $scope.dndChangeTime = function (event, ui, calendarEvent) {
                $log.debug('Changing event time changed - title: ' + calendarEvent.title + ', start: ' + calendarEvent.start + ', duration: ' + calendarEvent.duration);
                EventUtils.normalize(calendarEvent);
                if (!EventActionManager.canEdit(calendarEvent)) {
                    $log.error('Event cannot be changed as not editable');
                    return;
                }
                var deltaHeight = ui.size.height - ui.originalSize.height;
                var addMinutes = 15 * Math.round(deltaHeight / 15);
                if (calendarEvent.duration + addMinutes < 15) {
                    //don't re-size too much
                    return;
                }
                var newEndDate = calendarEvent.end.clone().add(addMinutes).minute();
                calendarEvent.duration += addMinutes;
                $scope.saveEvent(calendarEvent, calendarEvent.start.clone(), newEndDate, calendarEvent.start.clone(), calendarEvent.end.clone());
            };

            /**
             * Get controller's action manager
             * @return non-nullable instance
             */
            $scope.actions = function () {
                return EventActionManager;
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
                $stateParams.currentDate = null;
                $scope.init($scope.viewType, $scope.currentDate);
            };

            /**
             * Find location available for given time
             * @param day day without time period
             * @param dayHour hour when visits can begin
             * @param minutes minutes minutes that set quarter when visits can begin
             * @returns {*} non-nullable location
             */
            $scope.findLocation = function (day, dayHour, minutes) {
                //check cache
                var defaultLocation = {color: 'black'};
                if ($scope.doctor == undefined) {
                    return defaultLocation;
                }
                var cacheKey = 'location' + day.toString('yyyy-MM-dd') + ' ' + dayHour + ':' + minutes;
                var cached = undefined; // $scope.cache.get(cacheKey);
                if (cached !== undefined) {
                    return cached;
                }
                var dateTime = day.clone().set({
                    hour: dayHour,
                    minute: minutes,
                    second: 0
                });
                var location = EventUtils.findLocation($scope.doctor.locations, dateTime) || defaultLocation;
                //$scope.cache.put(cacheKey, location);
                return location;
            };

        }
    ]
);

