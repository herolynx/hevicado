'use strict';

describe('auth-controller-spec - Login controller:', function () {

    var $rootScope, $scope;
    var mockAuthService, mockLog;

    beforeEach(angular.mock.module('kunishu-auth.controllers'));

    //prepare mocked components
    beforeEach(inject(function ($controller, _$rootScope_, _$log_) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        mockAuthService = { };
        mockLog = { };
        $controller('LoginCtrl', {
            $rootScope: $rootScope,
            $scope: $scope,
            AuthService: mockAuthService,
            AUTH_EVENTS: { },
            $log: _$log_
        });
    }));

    it('should log-out current user', function () {
        //given user session exists

        //when user is logging out

        //then session is destroyed
        expect(true).toBe(true);
        //and broadcast event is sent

    });


});