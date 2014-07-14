'use strict';

describe('bolt-service-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('bolt.services'));

    describe('Session-spec:', function () {

        var mockCookieStore, mockUserRoles, mockLog;
        var session;

        //prepare session for testing
        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockCookieStore = jasmine.createSpyObj('$cookieStore', ['put', 'remove']);
            $provide.value('$cookieStore', mockCookieStore);
            mockUserRoles = jasmine.createSpyObj('USER_ROLES', ['GUEST', 'USER']);
            $provide.value('USER_ROLES', mockUserRoles);
            mockLog = jasmine.createSpyObj('$log', ['debug']);
            $provide.value('$log', mockLog);
        }));

        beforeEach(inject(function ($injector) {
            session = $injector.get('Session');
        }));

        it('should contain default settings for guest user', function () {
            //given session service is initialized
            expect(session).toBeDefined();
            //when session hasn't been created

            //then session contains default settings for guest
            expect(session.getToken()).toBeNull();
            expect(session.getUserId()).toBeNull();
            expect(session.getUserRole()).toBe(mockUserRoles.GUEST);
        });

        it('should create new session', function () {
            //given session service is initialized
            expect(session).toBeDefined();
            //when creating new session
            session.create('token-123', 'user-456', 'USER');
            //then cookie is created for current user
            expect(mockCookieStore.put).toHaveBeenCalledWith('currentUser', { token: 'token-123', userId: 'user-456', userRole: 'USER' });
            //and proper log message appears
            expect(mockLog.debug).toHaveBeenCalledWith('Creating session - USER: user-456, userRole: USER, token: token-123');
        });

        it('should destroy current session', function () {
            //given session service is initialized
            expect(session).toBeDefined();
            //when destroying session
            session.destroy();
            //then cookie for current user is removed
            expect(mockCookieStore.remove).toHaveBeenCalledWith('currentUser');
            //and proper log message appears
            expect(mockLog.debug).toHaveBeenCalledWith('Deleting session - USER: null');
        });
    });

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
            }
            //get service
            authService = $injector.get('AuthService');
        }));

        it('should login user with valid credentials', function () {
            //given user is defined in service
            expect(authService).toBeDefined();
            var user = {
                token: 'token-123',
                userid: 'user-345',
                role: 'USER'
            };
            //when trying to log in with user's credentials
            authService.login({ user: 'user@bolt.com', password: 'pass#123' });
            //and response for authentication is positive
            deferredHttp.resolve(user);
            $rootScope.$apply();
            //then session is created for validated user
            expect(mockSession.create).toHaveBeenCalledWith(user.token, user.userid, user.role);
        });

        it('should not login user with wrong credentials', function () {
            //given user is defined in service
            expect(authService).toBeDefined();
            var user = {
                token: 'token-123',
                userid: 'user-345',
                role: 'USER'
            };
            //when trying to log in with wrong credentials
            authService.login({ user: 'user@bolt.com', password: 'pass#123' });
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
            //then session of current user is destroyed
            expect(mockSession.destroy).toHaveBeenCalled();
        });

        it('should authenticate user with valid token', function () {
            //given token of user is valid
            expect(authService).toBeDefined();
            mockSession.getToken = function () {
                return 'token-123';
            }
            //when checking user whether user is authenticated
            //then check is positive
            expect(authService.isAuthenticated()).toBe(true);
        });

        it('should not authenticate user without valid token', function () {
            //given token of user is invalid
            expect(authService).toBeDefined();
            mockSession.getToken = function () {
                return null;
            }
            //when checking user whether user is authenticated
            //then check is negative
            expect(authService.isAuthenticated()).toBe(false);
        });

        it('should authorize user with correct access rights', function () {
            //given user has required access rights
            expect(authService).toBeDefined();
            mockSession.getUserRole = function () {
                return 'ADMIN';
            }
            //when checking whether user is authorized
            //then check is positive
            expect(authService.isAuthorized(['USER', 'ADMIN'])).toBe(true);
        });

        it('should not authorize user with insufficient access rights', function () {
            //given user hasn't required access rights
            expect(authService).toBeDefined();
            mockSession.getUserRole = function () {
                return 'GUEST';
            }
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

    describe('AuthInterceptor-spec:', function () {

        var mockAuthEvents, mockSession;
        var spyRootScope, spyQ;
        var authInterceptor;

        //prepare session for testing
        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockAuthEvents = jasmine.createSpyObj('AuthEvents', ['USER_NOT_AUTHENTICATED', 'USER_NOT_AUTHORIZED', 'SESSION_TIMEOUT']);
            $provide.value('AUTH_EVENTS', mockAuthEvents);
            mockSession = jasmine.createSpyObj('Session', ['getToken']);
            $provide.value('Session', mockSession);
        }));

        beforeEach(inject(function ($injector, _$rootScope_, _$q_) {
            //create spies
            spyRootScope = _$rootScope_;
            spyOn(spyRootScope, '$broadcast');
            spyQ = _$q_;
            spyOn(spyQ, 'when');
            spyOn(spyQ, 'reject');
            //get service
            authInterceptor = $injector.get('AuthInterceptor');
        }));

        it('should add valid token to out-going HTTP request', function () {
            //given auth interceptor is initialized
            expect(authInterceptor).toBeDefined();
            //and current user has valid token
            mockSession.getToken = function () {
                return 'token-123';
            }
            //when HTTP request is about to be sent
            var config = { };
            config.headers = { Authorization: null };
            authInterceptor.request(config);
            //then current user's token is added to HTTP header
            expect(config.headers.Authorization).toBe('Bearer token-123');
        });

        it('should not add invalid token to out-going HTTP request', function () {
            //given auth interceptor is initialized
            expect(authInterceptor).toBeDefined();
            //and current user has invalid token
            mockSession.getToken = function () {
                return null;
            }
            //when HTTP request is about to be sent
            var config = { };
            config.headers = { Authorization: null };
            authInterceptor.request(config);
            //then HTTP header is empty
            expect(config.headers.Authorization).toBeNull();
        });

        it('should inform that user is not authenticated based on HTTP response', function () {
            //given auth interceptor is initialized
            expect(authInterceptor).toBeDefined();
            //when HTTP response is received with proper code
            var response = { status: 401 };
            authInterceptor.response(response);
            //then proper broadcast message is sent
            expect(spyRootScope.$broadcast).toHaveBeenCalledWith(mockAuthEvents.USER_NOT_AUTHENTICATED);
            //and response is rejected from dispatching
            expect(spyQ.reject).toHaveBeenCalledWith(response);
        });

        it('should inform that user is not authorized based on HTTP response', function () {
            //given auth interceptor is initialized
            expect(authInterceptor).toBeDefined();
            //when HTTP response is received with proper code
            var response = { status: 403 };
            authInterceptor.response(response);
            //then proper broadcast message is sent
            expect(spyRootScope.$broadcast).toHaveBeenCalledWith(mockAuthEvents.USER_NOT_AUTHORIZED);
            //and response is rejected from dispatching
            expect(spyQ.reject).toHaveBeenCalledWith(response);
        });

        it('should inform about expired user\'s session based on HTTP response', function () {
            //given auth interceptor is initialized
            expect(authInterceptor).toBeDefined();
            //when HTTP response is received with proper code
            var response = { status: 419 };
            authInterceptor.response(response);
            //then proper broadcast message is sent
            expect(spyRootScope.$broadcast).toHaveBeenCalledWith(mockAuthEvents.SESSION_TIMEOUT);
            //and response is rejected from dispatching
            expect(spyQ.reject).toHaveBeenCalledWith(response);
        });

        it('should pass through HTTP response without error code', function () {
            //given auth interceptor is initialized
            expect(authInterceptor).toBeDefined();
            //when HTTP response is received without error code
            //then response is propagated
            var response = { status: 200 };
            expect(authInterceptor.response(response)).toBe(response);
        });
    });

});
