'use strict';

var directives = angular.module('kunishu.directives', []);

/**
 * Directive displays current version of application
 */
directives.directive('appVersion', ['version', function (version) {
    return function (scope, elm, attrs) {
        elm.text(version);
    };
}]);
