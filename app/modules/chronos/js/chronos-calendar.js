'use strict';

var calendar = angular.module('chronos.calendar', []);

/**
 * Controller responsible for displayed calendar that belongs to chosen user.
 * @param $scope current scope of controller
 * @param $modal component managing pop-up windows
 * @param $log logger
 * @param CalendarService service managing calendar data
 * @param CalendarCollectionFactory factory for creating proper event related collections
 * @param CalendarRenderer renderer for attaching events to proper time lines
 * @param CALENDAR_EVENTS events used for calendar notifications
 * @param EventUtils generic functionality related with events
 * @param uiNotifications compononent managing notifications
 */
calendar.controller('CalendarCtrl', function ($scope, $modal, $log, CalendarService, CalendarCollectionFactory, CalendarRenderer, CALENDAR_EVENTS, EventUtils, uiNotification) {

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
        var endDate = days[days.length - 1];
        $log.debug('Loading calendar events - startDate: ' + startDate + ", end date: " + endDate);
        CalendarService.events(startDate, endDate).
        success(function (data) {
            $log.debug('Events loaded - data size: ' + data.length);
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
        $scope.viewType = daysAmount;
        //TODO get user ID
        CalendarService.init(1);
        if ($scope.viewType == 31) {
            $scope.month(0, day);
        } else if ($scope.viewType == 7) {
            $scope.week(0, day);
        } else {
            $scope.day(0, day);
        }
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
     * Register controller to event-bus
     */
    $scope.register = function () {
        $scope.$on(CALENDAR_EVENTS.EVENT_CHANGED, function (event, calendarEvent) {
            $log.debug('Event changed from event bus, updating new event in calendar - id: ' + calendarEvent.id);
            $scope.normalize(calendarEvent);
            $scope.eventsMap.remove(calendarEvent);
            $scope.eventsMap.add(calendarEvent);
            $scope.buildTimelineFor(calendarEvent.start, calendarEvent.end);
        });
        $scope.$on(CALENDAR_EVENTS.EVENT_DELETED, function (event, calendarEvent) {
            $log.debug('Event deleted from event bus, deleting event from calendar - id: ' + calendarEvent.id);
            $scope.normalize(calendarEvent);
            $scope.eventsMap.remove(calendarEvent);
            $scope.buildTimelineFor(calendarEvent.start, calendarEvent.end);
        });
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
     * @param optional starting hour of event
     * @param optional minutes of starting time
     */
    $scope.addEvent = function (day, hour, minute) {
        //prepare start date
        var date = day.clone();
        if (hour !== undefined) {
            date = date.set({
                hour: hour,
                minute: minute
            });
        }
        $scope.editEvent({
            start: date
        });
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
        $log.debug('Editing event - id: ' + event.id + ', start: ' + event.start);
        CalendarService.
        options(event.start).
        success(function (result) {
            var modalInstance = $modal.open({
                windowTemplateUrl: 'modules/ui/partials/pop-up.html',
                templateUrl: 'modules/chronos/partials/edit-event.html',
                backdrop: 'static',
                scope: $scope,
                controller: editEventCtrl,
                resolve: {
                    eventToEdit: function () {
                        return event;
                    },
                    options: function () {
                        return result;
                    }
                }
            });
        }).
        error(function (error) {
            $log.error('Couldn\'t edit event - id: ' + event.id + ', start: ' + event.start + ', error: ' + error);
            uiNotification.text('Error', 'Cannot edit event').error();
        });
    };

    /**
     * Get events in given time period
     * @param day day without time period
     * @param dayHour optional hour
     * @param minutes optional minutes
     * @returns {Array}
     */
    $scope.getEvents = function (day, dayHour, minutes) {
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
        return keys.length == 1 ? filtered[keys[0]] : [];
    };

    $scope.locationStats = function (day, maxCount) {
        //        var dayEvents = $scope.eventsMap.events(day);
        //        if (dayEvents.length == 0) {
        return [{
            name: '',
            value: '0'
        }];
        //        }
        //        var grouped = _.
        //            groupBy(dayEvents, function (event) {
        //                return event.location.name;
        //            });
        //        var stats = _.chain(Object.keys(grouped)).
        //            map(function(location) {
        //                return [location, grouped[location].length];
        //            }).
        //            sortBy(function (entry) {
        //                return entry[1];
        //            }).
        //            first(maxCount).
        //            value();
        //        console.info(stats);
        //        return stats;
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
        $scope.normalize(calendarEvent);
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
        $scope.normalize(event);
        CalendarService.save(event).
        success(function (response) {
            $scope.eventsMap.add(event);
            $scope.buildTimelineFor(event.start, event.end);
            $scope.$broadcast(CALENDAR_EVENTS.CALENDAR_RENDER);
        }).
        error(function (error) {
            $log.error('Couldn\'t save event - id: ' + event.id + ', start: ' + event.start + ', error: ' + error);
            uiNotification.text('Error', 'Couldn\'t save event').error();
            //fallback
            event.start = oldStartDate;
            event.end = oldEndDate;
            $scope.normalize(event);
            $scope.eventsMap.add(event);
            $scope.buildTimelineFor(event.start, event.end);
            $scope.$broadcast(CALENDAR_EVENTS.CALENDAR_RENDER);
        });
    };

    /**
     * Normalize event so it can be displayed on calendar
     * @param event event to be normalized
     * @return the same instance of event
     */
    $scope.normalize = function (event) {
        if (event.start.clone === undefined) {
            event.start = new Date(event.start);
        }
        if (event.end.clone === undefined) {
            event.end = new Date(event.end);
        }
        //TODO add duration
        return event;
    };

    /**
     * Change event time period based on given UI event
     * @param event resizable event
     * @param ui ui element details
     * @param calendarEvent event to be changed
     */
    $scope.dndChangeTime = function (event, ui, calendarEvent) {
        $log.debug('Changing event time changed - title: ' + calendarEvent.title + ', start: ' + calendarEvent.start + ', duration: ' + calendarEvent.duration);
        $scope.eventsMap.remove(calendarEvent);
        $scope.buildTimelineFor(calendarEvent.start, calendarEvent.end);
        var deltaHeight = ui.size.height - ui.originalSize.height;
        var addMinutes = 15 * Math.round(deltaHeight / 15);
        calendarEvent.end = calendarEvent.end.add(addMinutes).minute();
        calendarEvent.duration += addMinutes;
        $log.debug('Event time changed - title: ' + calendarEvent.title + ', start: ' + calendarEvent.start + ', end: ' + calendarEvent.end);
        $scope.eventsMap.add(calendarEvent);
        $scope.buildTimelineFor(calendarEvent.start, calendarEvent.end);
        $scope.$broadcast(CALENDAR_EVENTS.CALENDAR_RENDER);
    };

    $scope.register();
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