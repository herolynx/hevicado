var filters = angular.module('commons.users', []);

/**
 * Filter for displaying info about user
 */
filters.filter('userInfo', function (UserUtils) {

    return function (text, withDegree, withEmail) {
        return UserUtils.info(text, withDegree, withEmail);
    }

});

/**
 * Filter for displaying full address
 */
filters.filter('addressInfo', function (UserUtils) {

    return function (text) {
        return UserUtils.address(text);
    };

});
