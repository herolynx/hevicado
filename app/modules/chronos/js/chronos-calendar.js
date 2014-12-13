'use strict';

var calendar = angular.module('chronos.calendar', [
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
 * @param $cacheFactory cache provider
 * @param $log logger
 * @param CalendarService service managing calendar data
 * @param CalendarCollectionFactory factory for creating proper event related collections
 * @param CalendarRenderer renderer for attaching events to proper time lines
 * @param CALENDAR_EVENTS events used for calendar notifications
 * @param EventUtils generic functionality related with events
 * @param uiNotifications component managing notifications
 * @param UsersService service for getting info about calendar owner
 */
calendar.controller('CalendarCtrl', function ($rootScope, $scope, $state, $stateParams, $cacheFactory, $log, CalendarService, CalendarCollectionFactory, CalendarRenderer, CALENDAR_EVENTS, EventUtils, uiNotification, UsersService) {

    /**
     * Include underscore
     */
    $scope._ = _;

    $scope.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    $scope.beginDate = Date.today();
    $scope.endDate = Date.today();
    $scope.currentDate = Date.today();

    $scope.viewType = 7;
    $scope.days = [];

    $scope.cache = $cacheFactory('cacheCalendar-' + new Date());
    $scope.eventsMap = CalendarCollectionFactory.eventsMap();

    /**
     * Set days displayed in chosen time period on calendar
     * @param startDate first day displayed on calendar
     * @param endDate last date displayed on calendar
     */
    $scope.setDays = function (startDate, endDate) {
        $log.debug('Setting time period - startDate: ' + startDate + ", endDate: " + endDate);
        var currentDate = startDate.clone();
        $scope.days = [];
        do {
            $scope.days.push($scope.eventsMap.dayKey(currentDate));
            currentDate = currentDate.add(1).days();
        } while (currentDate.isBefore(endDate));
    };

    /**
     * Load calendar data for given days
     * @param days dates for which data should be loaded
     */
    $scope.loadCalendarData = function (days) {
        var startDate = days[0];
        var endDate = days[days.length - 1].clone().set({hour: 23, minute: 59, second: 59});
        $log.debug('Loading calendar events - startDate: ' + startDate + ", end date: " + endDate);
        CalendarService.events(startDate, endDate).
            success(function (data) {
                $log.debug('Events loaded - data size: ' + data.length);
                $scope.cache.removeAll();
                _.map(data, EventUtils.normalize);
                $scope.eventsMap.clear();
                $scope.eventsMap.addAll(data);
                $scope.buildTimelines(days);
            }).
            error(function (data, status) {
                $log.error('Couldn\'t load events - data: ' + data + ', status: ' + status);
                uiNotification.text('Error', 'Couldn\'t load events').error();
            });
    };

    /**
     * Build time lines so events can be displayed on calendar properly
     * @param days for which time lines should be built
     */
    $scope.buildTimelines = function (days) {
        for (var i = 0; i < days.length; i++) {
            days[i].clearTime();
            var dayEvents = $scope.eventsMap.events(days[i]);
            CalendarRenderer.attachAll(dayEvents);
        }
    };

    /**
     * Build time lines for given time period  so events can be displayed on calendar properly
     * @param startDate beginning of time window
     * @param endDate end of time window
     */
    $scope.buildTimelineFor = function (startDate, endDate) {
        var dayKeys = $scope.eventsMap.dayKeys(startDate, endDate);
        for (var i = 0; i < dayKeys.length; i++) {
            var dayEvents = $scope.eventsMap.events(dayKeys[i]);
            CalendarRenderer.attachAll(dayEvents);
        }
    };

    /**
     * Initialize calendar with chosen time period to be displayed
     *
     * @param daysAmount number of days to be displayed on calendar
     * @param day optional day that should be used in initialized of calendar
     */
    $scope.init = function (daysAmount, day) {
        $log.debug('Initializing calendar for doctor: ' + $stateParams.doctorId);
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
        $scope.setDays($scope.beginDate, $scope.endDate);
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
        $scope.setDays($scope.beginDate, $scope.endDate);
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
        $scope.setDays($scope.beginDate, $scope.endDate);
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
        $scope.setDays($scope.beginDate, $scope.endDate);
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
        $scope.setDays($scope.beginDate, $scope.endDate);
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
                startTime: date.toString('yyyy-MM-dd HH:mm')
            });
        } else {
            $log.debug('Event date clicked - start: ' + date);
            $rootScope.$broadcast(CALENDAR_EVENTS.CALENDAR_TIME_PICKED, date);
        }
    };

    /**
     * Delete event
     * @param event event to be deleted
     */
    $scope.deleteEvent = function (event) {
        $log.debug('Deleting event - id: ' + event.id + ', start: ' + event.start);
        CalendarService.delete(event.id).
            success(function (result) {
                $scope.eventsMap.remove(event);
                $scope.buildTimelineFor(event.start, event.end);
            }).
            error(function (error) {
                $log.error('Couldn\'t delete event - id: ' + event.id + ', start: ' + event.start + ', error: ' + error);
                uiNotification.text('Error', 'Couldn\'t delete event').error();
            });
    };

    /**
     * Edit event
     * @param event event to be edited
     */
    $scope.editEvent = function (event) {
        $log.debug('Editing event - id: ' + event.id);
        $state.go($state.current.data.editVisitState, {doctorId: $scope.doctorId, eventId: event.id});
    };

    /**
     * Get events in given time period that begins in chosen quarter of an hour.
     * @param day day without time period
     * @param dayHour hour when events can begin
     * @param minutes minutes minutes that set quarter when events can begin
     * @returns {Array} events
     */
    $scope.getEvents = function (day, dayHour, minutes) {
        //check cache
        var cacheKey = day.toString('yyyy-MM-dd') + ' ' + dayHour + ':' + minutes;
        var cached = $scope.cache.get(cacheKey);
        if (cached !== undefined) {
            return cached;
        }
        //get events
        if (!$scope.eventsMap.contains(day)) {
            // nothing to do
            return [];
        }
        var startFrom = day.clone().set({
            hour: dayHour,
            minute: minutes,
            second: 0
        });
        var endTo = startFrom.clone().add(15).minutes();
        var filtered = $scope.eventsMap.filter(function (event) {
            return event.start.compareTo(startFrom) >= 0 &&
                event.start.compareTo(endTo) < 0;
        });
        var keys = Object.keys(filtered);
        var dayEvents = keys.length == 1 ? filtered[keys[0]] : [];
        $scope.cache.put(cacheKey, dayEvents);
        return dayEvents;
    };

    //TODO move to filter
    /**
     * Get summary info about events for chosen day
     * @param day day which summay info should be taken for
     * @param maxCount max count if elements to be returned
     * @return {Array} objects with number of events per location
     */
    $scope.dayInfo = function (day, maxCount) {
        //check cache
        var cacheKey = day.toString('yyyy-MM-dd') + ' ' + maxCount;
        var cached = $scope.cache.get(cacheKey);
        if (cached !== undefined) {
            return cached;
        }
        //get info
        var dayEvents = $scope.eventsMap.events(day);
        var info = {};
        if (dayEvents.length == 0) {
            info = [
                {
                    name: '',
                    value: 0
                }
            ];
        } else {
            info = _.chain(dayEvents).
                groupBy(function (event) {
                    return event.location.name;
                }).
                map(function (events, location) {
                    return {
                        name: location,
                        value: events.length
                    };
                }).
                sortBy(function (info) {
                    return info.value;
                }).
                reverse().
                first(maxCount).
                value();
        }
        info.id = cacheKey;
        $scope.cache.put(cacheKey, info);
        return info;
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
        $scope.eventsMap.remove(event);
        $scope.buildTimelineFor(oldStartDate, oldEndDate);
        event.start = newStartDate;
        event.end = newEndDate;
        EventUtils.normalize(event);
        CalendarService.save(event).
            success(function (response) {
                $scope.eventsMap.add(event);
                $scope.cache.removeAll();
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
                $scope.eventsMap.add(event);
                $scope.buildTimelineFor(event.start, event.end);
                $scope.$broadcast(CALENDAR_EVENTS.CALENDAR_RENDER);
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
        var deltaHeight = ui.size.height - ui.originalSize.height;
        var addMinutes = 15 * Math.round(deltaHeight / 15);
        var newEndDate = calendarEvent.end.clone().add(addMinutes).minute();
        calendarEvent.duration += addMinutes;
        $scope.saveEvent(calendarEvent, calendarEvent.start.clone(), newEndDate, calendarEvent.start.clone(), calendarEvent.end.clone());
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
        $scope.init($scope.viewType, $scope.currentDate);
    };

});

/**
 * Renderer manages displaying of events in the chosen day.
 * Renderer marks timeline where event should be displayed and number of overlaping events
 * that will be displayed at the same time.
 */
calendar.service('CalendarRenderer', function () {

    var t = [];
    var overlap = {
        value: 0
    };

    /**
     * Check whether all timelines will be done at given point of time
     * @param date point of time to be checked
     */
    var areAfter = function (date) {
        for (var i = 0; i < t.length; i++) {
            if (date.isBefore(t[i].end)) {
                return false;
            }
        }
        return true;
    };

    /**
     * Clear state of renderer
     */
    var clear = function () {
        t = [];
        overlap = {
            value: 0
        };
    };

    /**
     * Get timeline that is free at given point of time
     * @param date point of time
     * @return index of existing or newly created timeline
     */
    var timeline = function (date) {
        for (var i = 0; i < t.length; i++) {
            if (t[i].end.compareTo(date) <= 0) {
                //ends before or at the same time
                return i;
            }
        }
        //create new timeline
        overlap.value++;
        t.push(new Object());
        return t.length - 1;
    };

    return {

        /**
         * Attach event to next free timeline
         */
        attach: function (event) {
            if (areAfter(event.start)) {
                clear();
            }
            var index = timeline(event.start);
            t[index] = event;
            event.timeline = index;
            event.overlap = overlap;
            event.quarter = event.duration / 15;
        },

        /**
         * Attach events to timelines
         * @param events events that should be displayed in the same day
         */
        attachAll: function (events) {
            clear();
            //sort events
            var order = _.chain(events).
                sortBy('end').
                reverse().
                sortBy('start').
                value();
            //attach events
            for (var i = 0; i < order.length; i++) {
                this.attach(order[i]);
            }
        }

    };
});