'use strict';

describe('auth-interceptor-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('bolt.services'));

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
            };
            //when HTTP request is about to be sent
            var config = {};
            config.headers = {Authorization: null};
            authInterceptor.request(config);
            //then current user's token is added to HTTP header
            expect(config.headers.Authorization).toBe('token-123');
        });

        it('should not add invalid token to out-going HTTP request', function () {
            //given auth interceptor is initialized
            expect(authInterceptor).toBeDefined();
            //and current user has invalid token
            mockSession.getToken = function () {
                return null;
            };
            //when HTTP request is about to be sent
            var config = {};
            config.headers = {Authorization: null};
            authInterceptor.request(config);
            //then HTTP header is empty
            expect(config.headers.Authorization).toBeNull();
        });

        it('should inform that user is not authenticated based on HTTP response', function () {
            //given auth interceptor is initialized
            expect(authInterceptor).toBeDefined();
            //when HTTP response is received with proper code
            var response = {status: 401};
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
            var response = {status: 403};
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
            var response = {status: 419};
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
            var response = {status: 200};
            expect(authInterceptor.response(response)).toBe(response);
        });
    });

});
