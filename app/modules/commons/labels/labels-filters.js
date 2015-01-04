'use strict';

var commonsLabelsFilters = angular.module('commons.labels.filters', []);

/**
 * Filter for creating labels
 */
commonsLabelsFilters.filter('label', function () {

    return function (text, prefix) {
        if (text === undefined || text === null || text === '') {
            return '';
        }
        return text.indexOf("$$") == 0 ? (prefix + '.' + text) : text;
    };
});