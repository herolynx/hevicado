'use strict';

var controllers = angular.module('chronos.timeline', [
 'chronos.services',
 'infinite-scroll'
]);

controllers.controller('TimelineCtrl', function ($scope, $log, CalendarService) {

    $scope.visits = [];
    $scope.startDate = Date.today();
    $scope.endDate = Date.today();
    $scope.loading = false;

    $scope.getVisits = function () {
        $scope.loading = true;
        CalendarService.events($scope.startDate, $scope.endDate).
        success(function (data) {
            $log.debug('Visits loaded - data size: ' + data.length);
            $scope.loading = false;
            for (var i = 0; i < data.length; i++) {
                $scope.visits.push(data[i]);
            }
        }).
        error(function (data, status) {
            $log.error('Couldn\'t load visits - data: ' + data + ', status: ' + status);
            $scope.loading = false;
        });
    };

    $scope.initTimeWindow = function (start) {
        $scope.startDate = start;
        $scope.endDate = start.clone().add(7).days();
        $log.debug('User visits time window - start ' + $scope.startDate + ', end: ' + $scope.endDate);
    };

    $scope.next = function () {
        $scope.initTimeWindow($scope.endDate);
        $scope.getVisits();
    };

});