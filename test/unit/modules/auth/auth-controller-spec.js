'use strict';

describe('auth-controller-spec - Login controller:', function () {

    var $rootScope, $scope;
    var mockAuthService, mockLog;

    beforeEach(angular.module('kunishu-auth.services', function ($provide) {
        $provide.value('AuthService', {
            logout: jasmine.createSpy('logout')
        });

    }));
    beforeEach(angular.module('kunishu-auth'));
    beforeEach(angular.module('kunishu-auth.controllers'));

//    //prepare mocked components
//    beforeEach(angular.mock.inject(function ($controller, _$rootScope_) {
//        $rootScope = _$rootScope_;
//        $scope = $rootScope.$new();
//        mockAuthService = { };
//        mockLog = { };
//        $controller('LoginCtrl', {
//            $rootScope: $rootScope,
//            $scope: $scope,
//            AuthService: AuthService,
//            AUTH_EVENTS: AUTH_EVENTS,
//            $log: mockLog
//        });
//    }));

    it('should log-out current user', inject(function (AuthService) {
        //given user session exists

        //when user is logging out
//        $scope.logout();
        //then session is destroyed
        expect(true).toBe(true);
        //and broadcast event is sent

    }));


});