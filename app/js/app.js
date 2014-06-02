'use strict';

angular.module('kunishu',
    [
        'ngRoute',
        'ngCookies',
        'kunishu-auth',
        'kunishu.filters',
        'kunishu.services',
        'kunishu.directives',
        'kunishu.controllers',
        'kunishu-routes'
    ]
).
    value('version', '0.01').
    config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    });
;
