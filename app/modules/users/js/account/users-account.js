'use strict';

/**
 * Module managing user's account (registration, changing user's profile etc.)
 */
angular.module('users.account', [
    'users.commons.filters',
    'commons.labels',
    'noCAPTCHA'
]);


angular.module('users.account').
    config(['noCAPTCHAProvider', function (noCaptchaProvider) {
        noCaptchaProvider.setSiteKey('6Ld95gETAAAAANMOdXOqJJJW7tEu2SDTclgWiEoY');
        noCaptchaProvider.setTheme('clean');
    }
    ]);
