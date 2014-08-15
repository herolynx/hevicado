'use strict';

var controllers = angular.module('chronos.controllers', ['ui-notifications']);


controllers.controller('CalendarCtrl', function ($scope, EventsMap, $modal, $log) {

    $scope.beginDate = Date.today().set({ hour: 8, minute: 0 });

    $scope.days = [ ];

    $scope.months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

    $scope.hours = [ 8, 9, 10, 11, 12, 13, 14, 15, 16 ];

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
     */
    $scope.init = function () {
        $scope.beginDate = Date.today().previous().monday();
        $scope.setTimePeriod($scope.beginDate, 7);
        EventsMap.add({
            title: "Meeting 8:00-8:15",
            start: Date.today().set({hour: 8, minute: 0}),
            end: Date.today().set({hour: 8, minute: 15}),
            color: 'red',
            duration: 15
        });
        var keys = EventsMap.add({
            title: "Meeting 9:00-10:00",
            start: Date.today().set({hour: 9, minute: 0}),
            end: Date.today().set({hour: 10, minute: 0}),
            color: 'yellow',
            duration: 60
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
        //TODO simplify this
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
     * @param date starting date of event
     */
    $scope.addEvent = function (date) {
        var modalInstance = $modal.open({
            templateUrl: 'modules/chronos/partials/add-event.html',
            controller: addEventCtrl,

            resolve: {
                newEventDate: function () {
                    return date;
                }
            },
            backdrop: 'static',
            windowClass: 'window'
        });
    };

    /**
     * Get events in given time period
     * @param day
     * @param dayHour
     * @param minutes
     * @returns {Array}
     */
    $scope.getEvents = function (day, dayHour, minutes) {
        var startFrom = day.clone();
        startFrom.set({hour: dayHour, minute: minutes});
        var filtered = EventsMap.filter(function (event) {
            return (startFrom.equals(event.start) || startFrom.isAfter(event.start))
                && (startFrom.isBefore(event.end));
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
        return event;
    };

});

var addEventCtrl = function ($scope, $modalInstance, newEventDate, $log) {

    $scope.newEventDate = newEventDate;
    $log.debug('New event: ' + newEventDate)
};

