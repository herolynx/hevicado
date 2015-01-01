'use strict';

var filters = angular.module('angular-base.filters', []);

/**
 * Initialize app's current version filter
 */
filters.filter('interpolate', ['version', function (version) {
    return function (text) {
        return String(text).replace(/\%VERSION\%/mg, version);
    };
}]);
