'use strict';

var mockUsers = angular.module('mock-users', []);

mockUsers.run(function ($httpBackend, Session, $log) {

    var currentUser = {
        token: 'token-123',
        id: 1,
        userRole: 'admin',
        firstName: 'Michal',
        lastName: 'Wronski',
        mail: 'wrona@kunishu.com'
    };

    $httpBackend.whenGET(/user\/1/).respond(200, currentUser);
    $httpBackend.whenPOST(/users\/login/).respond(200, currentUser);

    $httpBackend.whenPOST('/user').respond(200, currentUser);
    $httpBackend.whenPUT(/user/).respond(200, currentUser);

});