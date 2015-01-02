'use strict';

/**
 * Define main base module
 */
var baseModule = angular.module('base',
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
        'doctors',
        /*
         * Internal modules
         */
        'base.filters',
        'base.services',
        'base.directives',
        'base.controllers',
        'base.routes',
        'base.menu'
    ]
).
    /* configure language settings */
    config(['$translateProvider', function ($translateProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: 'lang/',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('pl');
        $translateProvider.useCookieStorage(); //store lang in cookies
        moment.locale('pl');
    }]).
    value('version', '0.0.1');

//register authentication interceptor in order to perform
// default actions related with incoming and outgoing communication
baseModule.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('HttpInterceptor');
    $httpProvider.interceptors.push('AuthInterceptor');
}]);

