'use strict';

/**
 * Define main base module
 */
var module = angular.module('angular-base',
    [
        /*
         * External 3rd partiess modules
         */
        'ngCookies',
        'pascalprecht.translate',
        'ui.bootstrap',
        /*
         * External modules
         */
        'bolt',
        'chronos',
        'users',
        /*
         * Internal modules
         */
        'angular-base.filters',
        'angular-base.services',
        'angular-base.directives',
        'angular-base.controllers',
        'angular-base.routes'
    ]
).
    /* configure language settings */
    config(function ($translateProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: 'lang/',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en');
        $translateProvider.useCookieStorage(); //store lang in cookies
    }).
    value('version', '0.0.1');

//register authentication interceptor in order to perform
// default actions related with incoming and outgoing communication
module.config(function ($httpProvider) {
    $httpProvider.interceptors.push('HttpInterceptor');
    $httpProvider.interceptors.push('AuthInterceptor');
});

