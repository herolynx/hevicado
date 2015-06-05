'use strict';

describe('auth-service-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('bolt.services'));

    describe('AuthService-spec:', function () {

        var mockHttp, mockUserRoles, mockSession;
        var authService;
        /* Deferred response of http service */
        var deferredHttp, $rootScope;

        //prepare session for testing
        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockHttp = jasmine.createSpyObj('$http', ['post']);
            $provide.value('$http', mockHttp);
            mockUserRoles = jasmine.createSpyObj('USER_ROLES', ['GUEST', 'USER']);
            $provide.value('USER_ROLES', mockUserRoles);
            mockSession = jasmine.createSpyObj('Session', ['create', 'destroy', 'getToken', 'getUserRole']);
            $provide.value('Session', mockSession);
        }));

        beforeEach(inject(function ($injector, $q, _$rootScope_) {
            $rootScope = _$rootScope_;
            //initialize deferred http response
            deferredHttp = $q.defer();
            mockHttp.post = function (url, args) {
                return deferredHttp.promise;
            };
            //get service
            authService = $injector.get('AuthService');
        }));

        it('should login user with valid credentials', function () {
            //given user is defined in service
            expect(authService).toBeDefined();
            var user = {
                token: 'token-123',
                id: 'user-345',
                role: 'USER'
            };
            //when trying to log in with user's credentials
            authService.login({login: 'user@bolt.com', password: 'pass#123'});
            //and response for authentication is positive
            var response = {data: user};
            deferredHttp.resolve(response);
            $rootScope.$apply();
            //then session is created for validated user
            expect(mockSession.create).toHaveBeenCalledWith(user);
        });

        it('should not login user with wrong credentials', function () {
            //given user is defined in service
            expect(authService).toBeDefined();
            var user = {
                token: 'token-123',
                id: 'user-345',
                role: 'USER'
            };
            //when trying to log in with wrong credentials
            authService.login({login: 'user@bolt.com', password: 'pass#123'});
            //and response for authentication is not positive
            deferredHttp.reject();
            $rootScope.$apply();
            //then session is not created for user
            expect(mockSession.create).not.toHaveBeenCalled();
        });

        it('should log out current user', function () {
            //given auth service is initialized
            expect(authService).toBeDefined();
            //when user is logging out
            authService.logout();
            //and back-end has responded
            deferredHttp.resolve();
            $rootScope.$apply();
            //then session of current user is destroyed
            expect(mockSession.destroy).toHaveBeenCalled();
        });

        it('should authenticate user with valid token', function () {
            //given token of user is valid
            expect(authService).toBeDefined();
            mockSession.getToken = function () {
                return 'token-123';
            };
            //when checking user whether user is authenticated
            //then check is positive
            expect(authService.isAuthenticated()).toBe(true);
        });

        it('should not authenticate user without valid token', function () {
            //given token of user is invalid
            expect(authService).toBeDefined();
            mockSession.getToken = function () {
                return null;
            };
            //when checking user whether user is authenticated
            //then check is negative
            expect(authService.isAuthenticated()).toBe(false);
        });

        it('should authorize user with correct access rights', function () {
            //given user has required access rights
            expect(authService).toBeDefined();
            mockSession.getUserRole = function () {
                return 'ADMIN';
            };
            //when checking whether user is authorized
            //then check is positive
            expect(authService.isAuthorized(['USER', 'ADMIN'])).toBe(true);
        });

        it('should not authorize user with insufficient access rights', function () {
            //given user hasn't required access rights
            expect(authService).toBeDefined();
            mockSession.getUserRole = function () {
                return 'GUEST';
            };
            //when checking whether user is authorized
            //then check is negative
            expect(authService.isAuthorized(['USER', 'ADMIN'])).toBe(false);
        });

        it('should return current session', function () {
            //given auth service is initialized
            expect(authService).toBeDefined();
            //when checking user's current session
            //then singleton instance is returned
            expect(authService.getCurrentSession()).toBe(mockSession);
        });
    });

});
