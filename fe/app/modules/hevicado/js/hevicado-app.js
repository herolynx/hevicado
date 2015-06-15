'use strict';

/**
 * Define main base module
 */
angular.module('hevicado',
    [
        /*
         * External modules
         */
        'bolt',
        'chronos',
        'users',
        'commons.spinner',
        /*
         * Internal modules
         */
        'hevicado.config',
        'hevicado.services',
        'hevicado.ui',
        'hevicado.generic'
    ]
);

//register authentication interceptor in order to perform
// default actions related with incoming and outgoing communication
angular.module('hevicado').
    config(
    ['$httpProvider',
        function ($httpProvider) {
            $httpProvider.interceptors.push('HttpProgressWatcher');
            $httpProvider.interceptors.push('HttpInterceptor');
            $httpProvider.interceptors.push('AuthInterceptor');
        }
    ]);

