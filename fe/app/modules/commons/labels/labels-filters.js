'use strict';

angular.module('commons.labels.filters', []);

/**
 * Filter for creating labels
 */
angular.module('commons.labels.filters').
    filter('label', function () {

        return function (text, prefix) {
            if (text === undefined || text === null || text === '') {
                return '';
            }
            return text.indexOf("$$") == 0 ? (prefix + '.' + text) : text;
        };
    });
