var directives = angular.module('users.directives', []);

/**
 * User related formatters
 */
directives.value('UserFormatter', {

    /**
     * Get info about user
     * @param user for whom info should be taken
     * @param withDegree optional flag for including user's science degree
     * @param withEmail optional flag for including user's e-mail
     * @returns {string} non-nullable info
     */
    info: function (user, withDegree, withEmail) {
        if (user == undefined) {
            return '';
        }
        var info = '';
        if (withDegree != undefined && user.degree != undefined) {
            info += user.degree + " ";
        }
        info += user.last_name + ", " + user.first_name;
        if (withEmail != undefined) {
            info += " (" + user.email + ")";
        }
        return info;
    },

    /**
     * Get full address
     * @param address address object with info about localization
     * @returns {string} non-nullable address
     */
    address: function (address) {
        if (address == undefined) {
            return '';
        }
        return address.street + ", " + address.city + ", " + address.country;
    }

});

/**
 * Filter for displaying info about user
 */
directives.filter('userInfo', function (UserFormatter) {

    return function (text, withDegree, withEmail) {
        return UserFormatter.info(text, withDegree, withEmail);
    }

});

/**
 * Filter for displaying full address
 */
directives.filter('addressInfo', function (UserFormatter) {

    return function (text) {
        return UserFormatter.address(text);
    }

});
