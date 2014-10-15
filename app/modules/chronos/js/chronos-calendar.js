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
calendar.controller('CalendarCtrl', function ($scope, $modal, $log,
    CalendarService, CalendarCollectionFactory, CalendarRenderer, CALENDAR_EVENTS,
    EventUtils, uiNotification) {

    /**
     * Include underscore
     */
    $scope._ = _;

    $scope.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    $scope.beginDate = Date.today().set({
        hour: 8,
        minute: 0
    });

    $scope.days = [];
    $scope.eventsMap = CalendarCollectionFactory.eventsMap();

    /**
     * Set time period displayed on calendar
     * @param startDate first day displayed on calendar
     * @param daysCount number of days displayed
     */
    $scope.setTimePeriod = function (startDate, daysCount) {
        $log.debug('Setting time period - startDate: ' + startDate + ", daysCount: " + daysCount);
        var currentDate = startDate.clone();
        $scope.days = [];
        for (var i = 0; i < daysCount; i++) {
            $scope.days.push($scope.eventsMap.dayKey(currentDate));
            currentDate = currentDate.add(1).days();
        }
        $scope.loadCalendarData($scope.days);
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
        var startDate = day || Date.today();
        $scope.beginDate = startDate;
        if (daysAmount == 31) {
            $scope.beginDate = startDate.set({
                day: 1
            });
        } else if (daysAmount == 7) {
            $scope.beginDate = EventUtils.currentMonday(startDate);
        }
        $scope.beginDate.clearTime();
        //TODO get user ID
        CalendarService.init(1);
        $scope.setTimePeriod($scope.beginDate, daysAmount);
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
        $scope.setTimePeriod($scope.beginDate, $scope.days.length);
    };

    /**
     * Go to next calendar week
     */
    $scope.nextWeek = function () {
        $scope.beginDate = $scope.beginDate.next().monday();
        $scope.refresh();
    };

    /**
     * Go to previous calendar week
     */
    $scope.previousWeek = function () {
        $scope.beginDate = $scope.beginDate.previous().monday();
        $scope.refresh();
    };

    /**
     * Go to next calendar year
     */
    $scope.nextYear = function () {
        $scope.beginDate.next().year().previous().monday();
        $scope.refresh();
    };

    /**
     * Go to previous calendar year
     */
    $scope.previousYear = function () {
        $scope.beginDate.previous().year().next().monday();
        $scope.refresh();
    };

    /**
     * Go to next calendar month
     */
    $scope.nextMonth = function () {
        $scope.beginDate.next().month().previous().monday();
        $scope.refresh();
    };

    /**
     * Go to previous calendar month
     */
    $scope.previousMonth = function () {
        $scope.beginDate.previous().month().next().monday();
        $scope.refresh();
    };

    /**
     * Set chosen month of current year
     * @param month number of month to be set
     */
    $scope.setMonth = function (month) {
        var currentMonth = $scope.beginDate.getMonth();
        if (month == currentMonth) {
            return;
        }
        var direction = currentMonth >= month ? -1 : 1;
        $scope.beginDate.moveToMonth(month, direction).next().monday();
        $scope.refresh();
    };

    /**
     * Go to next calendar day
     */
    $scope.nextDay = function () {
        $scope.beginDate.next().day();
        $scope.refresh();
    };

    /**
     * Go to previous calendar day
     */
    $scope.previousDay = function () {
        $scope.beginDate.previous().day();
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
            uiNotification.text('Error', 'Cannot delete event').error();
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
            return;
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

    $scope.getDayEvents = function (day) {
        //TODO filter on view
        var start = day.clone().clearTime();
        var end = start.clone().add(1).days();
        var filtered = $scope.eventsMap.filter(function (event) {
            return (event.start.between(start, end));
        });
        var keys = Object.keys(filtered);
        return keys.length == 1 ? filtered[keys[0]] : [];
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
        $scope.eventsMap.remove(calendarEvent);
        $scope.buildTimelineFor(calendarEvent.start, calendarEvent.end);
        calendarEvent.start = day.clone().set({
            hour: hour,
            minute: minute
        });
        calendarEvent.end = calendarEvent.start.clone().add(calendarEvent.duration).minute();
        $log.debug('DnD adding updated event - title: ' + calendarEvent.title + ', start: ' + calendarEvent.start + ', end: ' + calendarEvent.end);
        $scope.eventsMap.add(calendarEvent);
        $scope.buildTimelineFor(calendarEvent.start, calendarEvent.end);
        $scope.$broadcast(CALENDAR_EVENTS.CALENDAR_RENDER);
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