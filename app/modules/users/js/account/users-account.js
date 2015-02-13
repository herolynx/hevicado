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
            //dev: 6LcY5gETAAAAAAP8BSSwqTg_YAFDAdcHtCglLLYe
            //prod: 6Ld95gETAAAAANMOdXOqJJJW7tEu2SDTclgWiEoY

            reCAPTCHAProvider.setPublicKey('6LcY5gETAAAAAAP8BSSwqTg_YAFDAdcHtCglLLYe');

            reCAPTCHAProvider.setOptions({
                theme: 'clean'
            });
        }
    ]);