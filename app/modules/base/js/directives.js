'use strict';

var baseDirectives = angular.module('base.directives', []);

/**
 * Directive displays current version of application
 */
baseDirectives.directive('appVersion', ['version',
    function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
}]);