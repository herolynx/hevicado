'use strict';

var commonsFilters = angular.module('commons.users.filters', [
    'commons.users.utils'
]);

/**
 * Filter for displaying info about user
 */
commonsFilters.filter('userInfo', ['UserUtils', function (UserUtils) {

    return function (text, withDegree, withEmail) {
        return UserUtils.info(text, withDegree, withEmail);
    };

}]);

/**
 * Filter for displaying full address
 */
commonsFilters.filter('addressInfo', ['UserUtils', function (UserUtils) {

    return function (text) {
        return UserUtils.address(text);
    };

}]);

/**
 * Format date
 * @param text date to be formatted
 * @param format date format
 */
commonsFilters.filter('dateFormat', function () {

    return function (text, format) {
        if (format === undefined) {
            format = 'DD-MM-YYYY';
        }
        return moment(text).format(format);
    };

});

/**
 * Normalize text (first letter capital, rest lower case)
 */
commonsFilters.filter('normalizeText', function () {

    return function (text) {
        return text.substr(0, 1).toUpperCase() + text.substr(1).toLowerCase();
    };

});




