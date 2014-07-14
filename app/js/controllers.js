'use strict';

var controllers = angular.module('angular-base.controllers', []);

/**
 * Controller for language management
 * @param $scope current scope of controller
 * @param $translate component for language management
 */
controllers.controller('LangCtrl', function ($scope, $translate) {
    /**
     * Check current language
     * @param key code of language to be used
     */
    $scope.changeLanguage = function (key) {
        $translate.use(key);
    };
});
