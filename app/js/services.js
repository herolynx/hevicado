'use strict';

var services = angular.module('angular-base.services', []);

//TODO move to config
services.constant('HTTP_CONFIG', {
    server: 'http://localhost:8080'
});

services.factory('HttpInterceptor', function (HTTP_CONFIG) {

    var shouldRedirect = function (type, url) {
        if (type != 'GET') {
            return true;
        }
        return false;
    };

    return {
        request: function (config) {
            if (shouldRedirect(config.method, config.url)) {
                config.url = HTTP_CONFIG.server + config.url;
            }
            return config;
        }
    };
});


