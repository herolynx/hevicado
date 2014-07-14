'use strict';

var controllers = angular.module('dashboard.controllers', []);

/**
 * Controller manages widgets on dashboard
 * @param $scope controller's current scope
 * @param $interval component for executing functions every n ms
 * @param $window browser's window
 * @param widgetDefinitions all widgets available that can be placed on dashboard
 * @param defaultWidgets default widgets to be displayed on dashboard
 */
controllers.controller('DashboardCtrl', function ($scope, $interval, $window, widgetDefinitions, defaultWidgets) {

    $scope.dashboardOptions = {
        widgetButtons: true,
        widgetDefinitions: widgetDefinitions,
        defaultWidgets: defaultWidgets,
        storage: $window.localStorage,
        storageId: 'demo'
    };

    $scope.randomValue = Math.random();

    $interval(function () {
        $scope.randomValue = Math.random();
    }, 500);

});