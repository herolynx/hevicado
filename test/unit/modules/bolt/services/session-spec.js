'use strict';

describe('session-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('bolt.services'));

    describe('Session-spec:', function () {

        var mockCookieStore, mockUserRoles, mockLog;
        var session;

        //prepare session for testing
        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockCookieStore = jasmine.createSpyObj('$cookieStore', ['put', 'remove', 'get']);
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
            mockCookieStore.get.andReturn(null);
            //then session contains default settings for guest
            expect(session.getToken()).toBeNull();
            expect(session.getUserId()).toBeNull();
            expect(session.getUserRole()).toBe(mockUserRoles.GUEST);
        });

        it('should load data from cookie when accessing current user\' data', function () {
            //given session service is initialized
            expect(session).toBeDefined();
            //and session has been created before
            mockCookieStore.get.andReturn({token: 'token-123', id: 'user-456', role: 'USER'});
            //when data of current user is accessed
            //then state from cookie is restored
            expect(session.getToken()).toBe('token-123');
            expect(session.getUserId()).toBe('user-456');
            expect(session.getUserRole()).toBe('USER');
        });

        it('should create new session', function () {
            //given session service is initialized
            expect(session).toBeDefined();
            //when creating new session
            session.create(
                {
                    token: 'token-123',
                    user: {
                        id: 'user-456',
                        role: 'USER'
                    }
                });
            //then cookie is created for current user
            expect(mockCookieStore.put).toHaveBeenCalledWith('currentUser', {
                token: 'token-123',
                id: 'user-456',
                role: 'USER'
            });
            //and proper log message appears
            expect(mockLog.debug).toHaveBeenCalledWith('Creating session - user id: user-456, role: USER, token: token-123');
        });

        it('should destroy current session', function () {
            //given session service is initialized
            expect(session).toBeDefined();
            //when destroying session
            session.destroy();
            //then cookie for current user is removed
            expect(mockCookieStore.remove).toHaveBeenCalledWith('currentUser');
            //and proper log message appears
            expect(mockLog.debug).toHaveBeenCalledWith('Deleting session - user id: null');
        });

        it('should keep only the most import data about user in session', function () {
            //given session service is initialized
            expect(session).toBeDefined();
            //when creating new session with all info about user
            session.create(
                {
                    token: 'token-123',
                    user: {
                        id: 'user-456',
                        role: 'ADMIN',
                        first_name: 'johnny',
                        last_name: 'bravo',
                        email: 'johnny.bravo@kunishu.com',
                        profile: {
                            lang: 'en',
                            time_zone: 'CET'
                        },
                        not_important: 'value1'
                    }
                }
            );
            //then cookie is created for current user
            //and session will keep only the most important data about user
            expect(mockCookieStore.put).toHaveBeenCalledWith('currentUser',
                {
                    id: 'user-456',
                    first_name: 'johnny',
                    last_name: 'bravo',
                    email: 'johnny.bravo@kunishu.com',
                    phone: undefined,
                    role: 'ADMIN',
                    token: 'token-123',
                    profile: {
                        lang: 'en', time_zone: 'CET'
                    }
                }
            );
        });

        it('should refresh only user info in session', function () {
            //given session service is initialized
            expect(session).toBeDefined();
            //and user has session created
            mockCookieStore.get.andReturn(
                {
                    token: 'token-123',
                    id: 'user-123',
                    first_name: 'johnny1',
                    last_name: 'bravo1',
                    role: 'USER'
                }
            );
            //when refreshing info about user
            session.refresh(
                {
                    token: 'token-456',
                    id: 'user-456',
                    role: 'ADMIN',
                    first_name: 'johnny2',
                    last_name: 'bravo2'
                }
            );
            //then only user info is refreshed
            //and crucial data like token remains untouched
            expect(mockCookieStore.put).toHaveBeenCalledWith('currentUser',
                {
                    token: 'token-123',
                    id: 'user-456',
                    role: 'ADMIN',
                    first_name: 'johnny2',
                    last_name: 'bravo2'
                }
            );
        });

    });

});
