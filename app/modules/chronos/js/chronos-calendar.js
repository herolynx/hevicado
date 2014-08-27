'use strict';

var controllers = angular.module('chronos.controllers', ['ui-notifications']);


controllers.controller('CalendarCtrl', function ($scope, CalendarService, EventsMap, $modal, $log) {

    /**
     * Include underscore
     */
    $scope._ = _;

    $scope.months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

    $scope.beginDate = Date.today().set({ hour: 8, minute: 0 });

    $scope.days = [ ];

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
    };

    /**
     * Initialize calendar with chosen time period to be displayed
     *
     * @param daysAmount number of days to be displayed on calendar
     *
     */
    $scope.init = function (daysAmount) {
        if (daysAmount == 7) {
            $scope.beginDate = Date.today().previous().monday();
        } else {
            $scope.beginDate.clearTime();
        }
        $scope.setTimePeriod($scope.beginDate, daysAmount);
        CalendarService.events($scope.days[0], $scope.days[$scope.days.length - 1]).
            success(function (data) {
                $log.debug('Events received from back-end - data:' + data);
                EventsMap.clear();
                EventsMap.addAll(data);
            }).
            error(function (data, status) {
                $log.error('Couldn\'t get data from back-end - data: ' + data + ', status: ' + status);
            });
    };


    /**
     * Refresh calendar's data
     */
    $scope.refresh = function () {
        $scope.setTimePeriod($scope.beginDate, $scope.days.length);
    };

    /**
     * Get current year of displayed dates on calendar
     * @returns {number|*}
     */
    $scope.getYear = function () {
        return $scope.beginDate.getFullYear();
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
     * Add new event to calendar
     * @param day day of new event
     * @param optional statring hour of event
     */
    $scope.addEvent = function (day, hour) {
        var date = day.clone();
        if (hour !== undefined) {
            date = date.set({hour: hour});
        }
        if (!CalendarService.canAdd(date)) {
            $log.debug('Events cannot be added on: ' + date);
            return;
        }
        //TODO find location
        var modalInstance = $modal.open({
            windowTemplateUrl: 'modules/ui/partials/pop-up.html',
            templateUrl: 'modules/chronos/partials/edit-event.html',
            backdrop: 'static',
            scope: $scope,
            controller: editEventCtrl,
            resolve: {
                newEvent: function () {
                    return {
                        title: 'Badanie odbytu',
                        start: day,
                        durations: [15, 30]
                    };
                },
                location: function () {
                    return  {
                        address: 'Grabiszynska 256',
                        city: 'Wroclaw',
                        country: 'Poland',
                        color: 'blue'
                    };
                }
            }
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
        startFrom.set({hour: dayHour, minute: minutes});
        var filtered = EventsMap.filter(function (event) {
            return (startFrom.equals(event.start) || startFrom.isAfter(event.start))
                && (startFrom.isBefore(event.end));
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
        calendarEvent.start = day.clone().set({hour: hour, minute: minute});
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

});


