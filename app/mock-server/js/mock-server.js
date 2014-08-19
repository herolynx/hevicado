'use strict';

/**
 * Mock back-end communication for testing purposes
 */
var mockServer = angular.module('mock-server', [
    'mock-calendar',
    'mock-users'
]).
    config(function ($provide) {
        $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
    });

/**
 * Pass through generic back-end requests related with static files etc.
 */
mockServer.run(function ($httpBackend, $log) {

    $httpBackend.whenGET(/lang\//).passThrough();
    $httpBackend.whenGET(/partials\//).passThrough();

});
