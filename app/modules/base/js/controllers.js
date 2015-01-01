'use strict';

var baseControllers = angular.module('base.controllers', [
    'ui.menu',
    'ui.generic'
]);

/**
 * Controller for language management
 * @param $scope current scope of controller
 * @param $translate component for language management
 */
baseControllers.controller('LangCtrl', ['$scope', '$translate', function ($scope, $translate) {
    /**
     * Check current language
     * @param key code of language to be used
     */
    $scope.changeLanguage = function (key) {
        $translate.use(key);
    };
}]);
