'use strict';

describe('kunishu-auth.controllers', function () {

    //mock module
    beforeEach(angular.mock.module('kunishu-auth'));

    //mock component's dependencies
    //$rootScope, $scope, AuthService, AUTH_EVENTS, $log
    beforeEach(angular.mock.inject(function ($rootScope, $controller) {
        //create an empty scope
        var rootScope = $rootScope.$new();
        //declare the controller and inject our empty scope
        $controller('LoginCtrl', {$scope: rootScope});
    }));

    it('should log-out current user', inject(function ($controllers, $rootScope, AuthService) {
        //given
        var loginCtrl = $controllers('LoginCtrl', { $scope: {} });
        expect(loginCtrl).toBeDefined();
        //when

        //then
    }));

    it('should ....', inject(function ($controller) {
        //spec body
        var myCtrl2 = $controller('MyCtrl2', { $scope: {} });
        expect(myCtrl2).toBeDefined();
    }));

});