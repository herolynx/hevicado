'use strict';

describe('auth-controller-spec - Login controller:', function () {

    var ctrlScope;
    var mockRootScope, mockAuthService, mockLog, mockAuthEvents;

    beforeEach(angular.mock.module('kunishu-auth.controllers'));

    //prepare mocked components
    beforeEach(inject(function ($controller) {
        //prepare controller for testing
        ctrlScope = { };
        //mock dependencies
        mockRootScope = jasmine.createSpyObj('$rootScope', ['$broadcast']);
        mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'logout']);
        mockLog = jasmine.createSpy('$log');
        mockAuthEvents = jasmine.createSpyObj('AuthEvents', ['USER_LOGGED_IN', 'LOGIN_FAILED', 'USER_LOGGED_OUT']);
        //inject mocks
        $controller('LoginCtrl', {
            $rootScope: mockRootScope,
            $scope: ctrlScope,
            AuthService: mockAuthService,
            AUTH_EVENTS: mockAuthEvents,
            $log: mockLog
        });
    }));

    it('should log-out currently logged in user', function () {
        //given user session exists
        mockAuthService.isAuthenticated = function () {
            return true;
        }
        //when user is logging out
        ctrlScope.logout();
        //then session is destroyed
        expect(mockAuthService.logout).toHaveBeenCalled();
        //and broadcast event is sent
        expect(mockRootScope.$broadcast).toHaveBeenCalledWith(mockAuthEvents.USER_LOGGED_OUT);
    });

    it('should not log-out guest user', function () {
        //given user is a guest (is not logged in)
        mockAuthService.isAuthenticated = function () {
            return false;
        }
        //when user is logging out
        ctrlScope.logout();
        //then session is not destroyed
        expect(mockAuthService.logout).not.toHaveBeenCalled();
        //and broadcast event is not sent
        expect(mockRootScope.$broadcast).not.toHaveBeenCalledWith(mockAuthEvents.USER_LOGGED_OUT);
    });

});