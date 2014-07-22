'use strict';

var controllers = angular.module('chronos.controllers', ['ui-notifications']);


controllers.controller('CalendarCtrl', function ($scope, $log) {

    $scope.months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

    $scope.days = [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ];

    $scope.dates = [ '22.05.2014', '23.05.2014', '24.05.2014', '25.05.2014', '26.05.2014', '27.05.2014', '28.05.2014' ];

    $scope.hours = [ '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00' ];

});