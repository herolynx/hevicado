'use strict';

/**
 * Define main kunishu module
 */
var module = angular.module('kunishu',
    [
        /*
         * External modules
         */
        'ngRoute',
        'ngCookies',
        'kunishu-auth',
        /*
         * Internal modules
         */
        'kunishu.filters',
        'kunishu.services',
        'kunishu.directives',
        'kunishu.controllers',
        'kunishu.routes'
    ]
).
    value('version', '0.01');

//register authentication interceptor in order to perform
// default actions related with incoming and outgoing communication
module.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
});

