'use strict';

/**
 * Module managing user's account (registration, changing user's profile etc.)
 */
angular.module('users.account', [
    'users.commons.filters',
    'commons.labels',
    'reCAPTCHA'
]);


angular.module('users.account').
    config(
    ['reCAPTCHAProvider',
        function (reCAPTCHAProvider) {

            reCAPTCHAProvider.setPublicKey('6Ld95gETAAAAANMOdXOqJJJW7tEu2SDTclgWiEoY');

            reCAPTCHAProvider.setOptions({
                theme: 'clean'
            });
        }
    ]);