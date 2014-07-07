'use strict';

describe('auth-service-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('kunishu-auth.services'));

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
            expect(mockCookieStore.put).toHaveBeenCalledWith('currentUser', { token : 'token-123', userId : 'user-456', userRole : 'USER' });
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
});
