'use strict';

var baseFilters = angular.module('angular-base.filters', []);

/**
 * Initialize app's current version filter
 */
baseFilters.filter('interpolate', ['version', function (version) {
    return function (text) {
        return String(text).replace(/\%VERSION\%/mg, version);
    };
}]);
