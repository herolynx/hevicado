'use strict';

var commonsUsersFilters = angular.module('commons.users.filters', [
    'commons.users.utils'
]);

/**
 * Filter for displaying info about user
 */
commonsUsersFilters.filter('userInfo', ['UserUtils', function (UserUtils) {

    return function (text, withDegree, withEmail) {
        return UserUtils.info(text, withDegree, withEmail);
    };

}]);

/**
 * Filter for displaying full address
 */
commonsUsersFilters.filter('addressInfo', ['UserUtils', function (UserUtils) {

    return function (text) {
        return UserUtils.address(text);
    };

}]);

/**
 * Format date
 * @param text date to be formatted
 * @param format date format
 */
commonsUsersFilters.filter('dateFormat', function () {

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
commonsUsersFilters.filter('normalizeText', function () {

    return function (text) {
        if (text === undefined || text === null || text === '') {
            return '';
        }
        return text.substr(0, 1).toUpperCase() + text.substr(1).toLowerCase();
    };

});

/**
 * Filter converts working hours (HH:mm) into local one (based on user browser settings)
 * @param text hours to be converted
 */
commonsUsersFilters.filter('toLocalHours', function () {

    return function (text, offset) {
        return hourToDate(text, offset).toString('HH:mm');
    };

});




