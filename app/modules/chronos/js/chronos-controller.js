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
        EventsMap.add({title: "Meeting 8:00", start: Date.today().set({hour: 8, minute: 0}), end: Date.today().set({hour: 8, minute: 15})});
        var keys = EventsMap.add({title: "Meeting 9:00", start: Date.today().set({hour: 9, minute: 0}), end: Date.today().set({hour: 10, minute: 0})});
        var events = EventsMap.events(keys[0]);
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
            return startFrom.isAfter(event.start) && startFrom.isBefore(event.end);
        });
        return filtered.length == 1 ? filtered[0] : [];
    };

});

var addEventCtrl = function ($scope, $modalInstance, newEventDate, $log) {

    $scope.newEventDate = newEventDate;
    $log.debug('New event: ' + newEventDate)
};

