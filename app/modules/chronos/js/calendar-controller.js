'use strict';

var controllers = angular.module('chronos.controllers', ['ui-notifications']);


controllers.controller('CalendarCtrl', function ($scope, $modal, $log) {

    $scope.beginDate = Date.today().set({ hour: 8, minute: 0 });

    $scope.days = [ ];

    $scope.months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

    $scope.hours = [ '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00' ];

    /**
     * Set time period displayed on calendar
     * @param startDate first day displayed on calendar
     * @param daysCount number of days displayed
     */
    $scope.setTimePeriod = function (startDate, daysCount) {
        $log.debug('Setting time period - startDate: ' + startDate + ", daysCount: " + daysCount);
        var currentDate = new Date(startDate);
        $scope.days = [];
        for (var i = 0; i < daysCount; i++) {
            $scope.days[i] = new Date(currentDate);
            currentDate = currentDate.add(1).days();
        }
    };

    /**
     * Initialize calendar with chosen time period to be displayed
     */
    $scope.init = function () {
        $scope.beginDate = Date.today().previous().monday();
        $scope.setTimePeriod($scope.beginDate, 7);
        //TODO remove sample data
        $scope.days[$scope.beginDate] = [
            $scope.sampleEvent('badanie 1', Date.today(), 8, 9),
            $scope.sampleEvent('badanie 2', Date.today(), 10, 11),
            $scope.sampleEvent('badanie 3', Date.today(), 12, 14)
        ];
    };

    $scope.sampleEvent = function (eventTitle, date, startHour, endHour) {
       return {
           title: eventTitle,
           start: new Date(date.set({ hour: startHour, minute: 0 })),
           end: new Date(date.set({ hour: endHour, minute: 0 }))
       };
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

});

var addEventCtrl = function ($scope, $modalInstance, newEventDate, $log) {

    $scope.newEventDate = newEventDate;
    $log.debug('New event: ' + newEventDate)
};

