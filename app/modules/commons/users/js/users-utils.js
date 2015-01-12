'use strict';

var commonsUtils = angular.module('commons.users.utils', []);

/**
 * User related functionality
 */
commonsUtils.service('UserUtils', ['$filter',
        function ($filter) {

            return {

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
                        var label = $filter('label');
                        var translate = $filter('translate');
                        info += translate(label(user.degree, 'degrees')) + " ";
                    }
                    if (user.last_name != undefined && user.first_name != undefined) {
                        info += user.last_name + ", " + user.first_name;
                    }
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
                },

                /**
                 * Get contact info about user
                 * @param user
                 * @returns {*} object with basic contact info
                 */
                getContactInfo: function (user) {
                    return {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        degree: user.degree,
                        email: user.email,
                        phone: user.phone,
                        role: user.role
                    };
                }

            };
        }
    ]
);