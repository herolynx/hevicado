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


