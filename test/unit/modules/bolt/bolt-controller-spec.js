'use strict';

describe('bolt-controller-spec - Login controller:', function () {

    var ctrlScope;
    var spyRootScope;
    var mockAuthService, mockLog, mockAuthEvents, mockState;
    /* Deferred response of authentication service */
    var deferredAuthService;

    //prepare module for testing
    beforeEach(angular.mock.module('bolt.controllers'));

    //prepare controller for testing
    beforeEach(inject(function ($controller, _$rootScope_, $q) {
        //prepare controller for testing
        ctrlScope = _$rootScope_.$new();
        //create spy on root scope
        spyRootScope = _$rootScope_;
        spyOn(spyRootScope, '$broadcast');
        //mock auth service
        mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'logout', 'login']);
        deferredAuthService = $q.defer();
        mockAuthService.login = function (credentials) {
            return deferredAuthService.promise;
        };
        mockAuthService.logout = function (credentials) {
            mockAuthService.sessionDestroyed = true;
            return deferredAuthService.promise;
        };
        //mock others
        mockLog = jasmine.createSpyObj('$log', ['debug']);
        mockAuthEvents = jasmine.createSpyObj('AuthEvents', ['USER_LOGGED_IN', 'LOGIN_FAILED', 'USER_LOGGED_OUT']);
        mockState = jasmine.createSpyObj('$state', ['go']);
        //inject mocks
        $controller('LoginCtrl', {
            $rootScope: spyRootScope,
            $scope: ctrlScope,
            $state: mockState,
            AuthService: mockAuthService,
            AUTH_EVENTS: mockAuthEvents,
            $log: mockLog
        });
    }));

    describe('logging out scenarios:', function () {
        it('should log-out currently logged in user', function () {
            //given user session exists
            mockAuthService.isAuthenticated = function () {
                return true;
            };
            //when user is logging out
            ctrlScope.logout();
            //and back-end has responded
            deferredAuthService.resolve();
            spyRootScope.$apply();
            //then session is destroyed
            expect(mockAuthService.sessionDestroyed).toBe(true);
            //and broadcast event is sent
            expect(spyRootScope.$broadcast).toHaveBeenCalledWith(mockAuthEvents.USER_LOGGED_OUT);
            //and user is redirected to default page for guests
            expect(mockState.go).toHaveBeenCalledWith('default');
        });

        it('should not log-out guest user', function () {
            //given user is a guest (is not logged in)
            mockAuthService.isAuthenticated = function () {
                return false;
            };
            //when user is logging out
            ctrlScope.logout();
            //then session is not destroyed
            expect(mockAuthService.sessionDestroyed).not.toBeDefined();
            //and broadcast event is not sent
            expect(spyRootScope.$broadcast).not.toHaveBeenCalledWith(mockAuthEvents.USER_LOGGED_OUT);
        });
    });

    describe('logging in scenarios:', function () {
        it('should log in user with correct credentials', function () {
            //given user's credentials are correct
            var credentials = {
                login: 'johny@bravo.com',
                password: 'pass#123'

            };
            //when user is logging in
            ctrlScope.login(credentials);
            //and successful response is received
            deferredAuthService.resolve();
            spyRootScope.$apply();
            //then user is logged in
            //and proper broadcast event is sent
            expect(spyRootScope.$broadcast).toHaveBeenCalledWith(mockAuthEvents.USER_LOGGED_IN);
            //and user is redirected to default page for users
            expect(mockState.go).toHaveBeenCalledWith('default-user');
        });

        it('should not log in user with incorrect credentials', function () {
            //given user's credentials are incorrect
            var credentials = {
                login: 'johny@bravo.com',
                password: 'wrongPass'

            };
            //when user is logging in
            ctrlScope.login(credentials);
            //and failed response is received
            deferredAuthService.reject();
            spyRootScope.$apply();
            //then user is not logged in
            //and proper broadcast event is sent
            expect(spyRootScope.$broadcast).toHaveBeenCalledWith(mockAuthEvents.LOGIN_FAILED);
            //and user is not redirected to dault page for users
            expect(mockState.go).not.toHaveBeenCalledWith('default-user');
        });
    });

});