'use strict';

var calendar = angular.module('chronos.calendar', []);

/**
 * Controller responsible for displayed calendar that belongs to chosen user.
 * @param $scope current scope of controller
 * @param CalendarService service managing calendar data
 * @param EventsMap collection for holding calendar events
 * @param $modal component managing pop-up windows
 * @param uiNotifications compononent managing notifications
 * @param $log logger
 */
calendar.controller('CalendarCtrl', function ($scope, CalendarService, EventsMap, $modal, uiNotification, $log) {

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
            $scope.days.push(EventsMap.dayKey(currentDate));
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
                EventsMap.clear();
                EventsMap.addAll(data);
            }).
            error(function (data, status) {
                $log.error('Couldn\'t load events - data: ' + data + ', status: ' + status);
            });
    };

    /**
     * Initialize calendar with chosen time period to be displayed
     *
     * @param daysAmount number of days to be displayed on calendar
     *
     */
    $scope.init = function (daysAmount) {
        if (daysAmount == 31) {
            $scope.beginDate = Date.today().set({
                day: 1
            });
        } else if (daysAmount == 7) {
            $scope.beginDate = Date.today().moveToDayOfWeek(1, -1);
        } else {
            $scope.beginDate.clearTime();
        }
        //TODO get user ID
        CalendarService.init(1);
        $scope.setTimePeriod($scope.beginDate, daysAmount);
    };

    /**
     * Register controller to event-bus
     */
    $scope.register = function () {
        $scope.$on('EVENT_CHANGED', function (event, calendarEvent) {
            $log.debug('Event changed from event bus, updating new event in calendar - id: ' + calendarEvent.id);
            $scope.normalize(calendarEvent);
            EventsMap.remove(calendarEvent);
            EventsMap.add(calendarEvent);
        });
        $scope.$on('EVENT_DELETED', function (event, calendarEvent) {
            $log.debug('Event deleted from event bus, deleting event from calendar - id: ' + calendarEvent.id);
            $scope.normalize(calendarEvent);
            EventsMap.remove(calendarEvent);
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
     */
    $scope.addEvent = function (day, hour) {
        //prepare start date
        var date = day.clone();
        if (hour !== undefined) {
            date = date.set({
                hour: hour
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
                EventsMap.remove(event);
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
        //TODO filter on view
        var startFrom = day.clone();
        startFrom.set({
            hour: dayHour,
            minute: minutes
        });
        var filtered = EventsMap.filter(function (event) {
            return (startFrom.equals(event.start) || startFrom.isAfter(event.start)) && (startFrom.isBefore(event.end));
        });
        var keys = Object.keys(filtered);
        return keys.length == 1 ? filtered[keys[0]] : [];
    };

    $scope.getDayEvents = function (day) {
        //TODO filter on view
        var start = day.clone().clearTime();
        var end = start.clone().add(1).days();
        var filtered = EventsMap.filter(function (event) {
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
        EventsMap.remove(calendarEvent);
        calendarEvent.start = day.clone().set({
            hour: hour,
            minute: minute
        });
        calendarEvent.end = calendarEvent.start.clone().add(calendarEvent.duration).minute();
        $log.debug('DnD adding updated event - title: ' + calendarEvent.title + ', start: ' + calendarEvent.start + ', end: ' + calendarEvent.end);
        EventsMap.add(calendarEvent);
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
        EventsMap.remove(calendarEvent);
        var deltaHeight = ui.size.height - ui.originalSize.height;
        var addMinutes = 15 * Math.round(deltaHeight / 15);
        calendarEvent.end = calendarEvent.end.add(addMinutes).minute();
        calendarEvent.duration += addMinutes;
        $log.debug('Event time changed - title: ' + calendarEvent.title + ', start: ' + calendarEvent.start + ', end: ' + calendarEvent.end);
        EventsMap.add(calendarEvent);
    };

    $scope.register();
});

/**
 * Renderer manages displaying of events in the chosen day.
 * Renderer marks timeline where event should be displayed and number of overlaping events
 * that will be displayed at the same time.
 */
calendar.service('CalendarRenderer', function () {

    var self = this;
    var t = [];
    var overlap = { value: 0 };

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
        overlap = { value: 0 };
    };

    /**
     * Get timeline that is free at given point of time
     * @param date point of time
     * @return index of existing or newly created timeline
     */
    var timeline = function (date) {
        overlap.value++;
        for (var i = 0; i < t.length; i++) {
            if (t[i].end.compareTo(date) <= 0) {
                //ends before or at the same time
                return i;
            }
        }
        //create new timeline
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
        },

        /**
         * Attach events to timelines
         * @param events events that should be displayed in the same day
         */
        attachAll: function (events) {
            clear();
            var order = _sortBy(events, function (event) {
                return event.start;
            });
            for (var i = 0; i < order.length; i++) {
                attach(order[i]);
            }
        }

    };
});