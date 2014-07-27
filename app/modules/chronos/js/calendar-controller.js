'use strict';

var controllers = angular.module('chronos.controllers', ['ui-notifications']);


controllers.controller('CalendarCtrl', function ($scope, $log) {

    $scope.beginDate = Date.today().set({ hour: 8, minute: 0 });

    $scope.dates = [ ];

    $scope.months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

    $scope.days = [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ];

    $scope.hours = [ '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00' ];

    /**
     * Set time period displayed on calendar
     * @param startDate first day displayed on calendar
     * @param daysCount number of days displayed
     */
    $scope.setTimePeriod = function (startDate, daysCount) {
        $log.debug('Setting time period - startDate: ' + startDate + ", daysCount: " + daysCount);
        var currentDate = new Date(startDate);
        $scope.dates = [];
        for (var i = 0; i < daysCount; i++) {
            $scope.dates[i] = new Date(currentDate);
            currentDate = currentDate.add(1).days();
        }
    };

    /**
     * Initialize calendar with chosen time period to be displayed
     */
    $scope.init = function () {
        $scope.beginDate = Date.today().previous().monday();
        $scope.setTimePeriod($scope.beginDate, 7);
    };

    /**
     * Refresh calendar's data
     */
    $scope.refresh = function () {
        $scope.setTimePeriod($scope.beginDate, $scope.dates.length);
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

});

