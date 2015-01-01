'use strict';

describe('users-controllers-spec:', function () {

    describe('RegistrationCtrl-spec', function () {

        var ctrlScope;
        var spyRootScope;
        var mockUsersService, mockAuthService, mockAuthEvents, mockUserRoles, mockState;
        var mockUiNotification;
        /* Deferred response of authentication and users service */
        var deferredAuthService, userServicePromise;

        //prepare module for testing
        beforeEach(angular.mock.module('users.controllers'));

        //prepare controller for testing
        beforeEach(inject(function ($controller, _$rootScope_, $q) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            //create spy on root scope
            spyRootScope = _$rootScope_;
            spyOn(spyRootScope, '$broadcast');
            //mock services
            mockUsersService = jasmine.createSpyObj('UsersService', ['save']);
            mockAuthService = jasmine.createSpyObj('AuthService', ['login']);
            deferredAuthService = $q.defer();
            mockAuthService.login = function (credentials) {
                mockAuthService.loginStartedFor = credentials;
                return deferredAuthService.promise;
            };
            userServicePromise = {
                then: function (f, e) {
                    userServicePromise.deffered = f;
                    userServicePromise.error = e;
                }
            };
            mockUsersService.save = function (user) {
                return userServicePromise;
            };
            //mock others
            mockAuthEvents = jasmine.createSpyObj('AuthEvents', ['USER_LOGGED_IN', 'LOGIN_FAILED']);
            mockUserRoles = jasmine.createSpyObj('USER_ROLES', ['CLIENT']);
            mockState = jasmine.createSpyObj('$state', ['go']);
            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
            var mockLog = jasmine.createSpyObj('$log', ['debug', 'error']);
            //inject mocks
            $controller('RegistrationCtrl', {
                $rootScope: spyRootScope,
                $scope: ctrlScope,
                $state: mockState,
                UsersService: mockUsersService,
                AuthService: mockAuthService,
                USER_ROLES: mockUserRoles,
                AUTH_EVENTS: mockAuthEvents,
                uiNotification: mockUiNotification,
                $log: mockLog
            });
        }));

        it('should register user', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and sample user who wants to register
            expect(ctrlScope.user).toBeDefined();
            ctrlScope.user.email = 'new@kunishu.com';
            ctrlScope.user.password = 'pass-123';
            //when registering user
            ctrlScope.save(ctrlScope.user);
            //and user account has been created on back-end
            userServicePromise.deffered({
                data: {
                    id: "newUserId"
                }
            });
            //then user is registered
            //and auto-login procedure has been started
            expect(mockAuthService.loginStartedFor).toEqual({
                login: ctrlScope.user.email,
                password: ctrlScope.user.password
            });
        });

        it('should inform user about registration failure', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and sample user who wants to register
            expect(ctrlScope.user).toBeDefined();
            ctrlScope.user.email = 'new@kunishu.com';
            ctrlScope.user.password = 'pass-123';
            //when registering user
            ctrlScope.save(ctrlScope.user);
            //and user account hasn't been created on back-end
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            userServicePromise.error("Couldn't register user");
            //then user is not registered
            //and user is informed properly
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('User hasn\'t been registered');
        });

        it('should automatically log-in user after registration', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and sample user who wants to register
            expect(ctrlScope.user).toBeDefined();
            ctrlScope.user.email = 'new@kunishu.com';
            ctrlScope.user.password = 'pass-123';
            //and registration of user has started
            ctrlScope.save(ctrlScope.user);
            //and user account has been created on back-end
            userServicePromise.deffered({
                data: {
                    id: "newUserId"
                }
            });
            //when auto-login procedure has been started
            expect(mockAuthService.loginStartedFor).toEqual({
                login: ctrlScope.user.email,
                password: ctrlScope.user.password
            });
            //and user auth has completed successfully
            deferredAuthService.resolve();
            spyRootScope.$apply();
            //then broadcast message is sent that user has logged in
            expect(spyRootScope.$broadcast).toHaveBeenCalledWith(mockAuthEvents.USER_LOGGED_IN);
            //and user is redirected to default page
            expect(mockState.go).toHaveBeenCalledWith('default-user');
        });

        it('should inform user about failed auto-login', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and sample user who wants to register
            expect(ctrlScope.user).toBeDefined();
            ctrlScope.user.email = 'new@kunishu.com';
            ctrlScope.user.password = 'pass-123';
            //and registration of user has started
            ctrlScope.save(ctrlScope.user);
            //and user account has been created on back-end
            userServicePromise.deffered({
                data: {
                    id: "newUserId"
                }
            });
            //when auto-login procedure has been started
            expect(mockAuthService.loginStartedFor).toEqual({
                login: ctrlScope.user.email,
                password: ctrlScope.user.password
            });
            //and user auth has failed
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            deferredAuthService.reject();
            spyRootScope.$apply();
            //then broadcast message is sent that user log-in has failed
            expect(spyRootScope.$broadcast).toHaveBeenCalledWith(mockAuthEvents.LOGIN_FAILED);
            //and user is not redirected to default page
            expect(mockState.go).not.toHaveBeenCalledWith('default-user');
            //and user is informed properly
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('User has been registered but logging in is not possible at the moment');
        });

    });

    describe('UserProfileCtrl-spec', function () {

        var ctrlScope, spyRootScope;
        var mockUsersService, mockSession, mockUiNotification, mockAuthEvents;
        /* Deferred response of users service */
        var userServicePromise;

        //prepare module for testing
        beforeEach(angular.mock.module('users.controllers'));

        //prepare controller for testing
        beforeEach(inject(function ($controller, _$rootScope_, $q) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            spyRootScope = _$rootScope_;
            spyOn(spyRootScope, '$broadcast');
            //mock services
            mockSession = jasmine.createSpyObj('Session', ['getUserId', 'refresh']);
            mockUsersService = jasmine.createSpyObj('UsersService', ['save', 'get']);
            userServicePromise = {
                then: function (f, e) {
                    userServicePromise.deffered = f;
                    userServicePromise.error = e;
                }
            };
            mockUsersService.save = function (user) {
                mockUsersService.saveUser = user;
                return userServicePromise;
            };
            mockUsersService.get = function (userId) {
                mockUsersService.getUserId = userId;
                return userServicePromise;
            };
            //mock others
            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            var mockLog = jasmine.createSpyObj('$log', ['debug', 'error']);
            var mockLangs = ['en'];
            var mockThemes = ['blue'];
            var mockTimeZones = ['CET'];
            mockAuthEvents = {
                SESSION_REFRESH: 'mock-session-refresh'
            };
            //inject mocks
            $controller('UserProfileCtrl', {
                $rootScope: spyRootScope,
                $scope: ctrlScope,
                UsersService: mockUsersService,
                Session: mockSession,
                uiNotification: mockUiNotification,
                $log: mockLog,
                LANGS: mockLangs,
                TIME_ZONES: mockTimeZones,
                THEMES: mockThemes,
                AUTH_EVENTS: mockAuthEvents
            });
        }));

        it('should get user profile', function () {
            //given controller is defined
            expect(ctrlScope).toBeDefined();
            //and user that is logged in
            var user = {
                id: 'user-123',
                email: 'user@kunishu.com'
            };
            mockSession.getUserId = function () {
                return user.id;
            };
            //when getting user's profile
            ctrlScope.loadProfile();
            //and back-end responded successfully
            expect(mockUsersService.getUserId).toBe(user.id);
            userServicePromise.deffered({
                data: user
            });
            //then profile of user is loaded
            expect(ctrlScope.user).toBe(user);
        });

        it('should inform user when profile cannot be loaded', function () {
            //given controller is defined
            expect(ctrlScope).toBeDefined();
            //and user that is logged in
            var user = {
                id: 'user-123',
                email: 'user@kunishu.com'
            };
            mockSession.getUserId = function () {
                return user.id;
            };
            //when getting user's profile
            ctrlScope.loadProfile();
            //and back-end responded with failure
            expect(mockUsersService.getUserId).toBe(user.id);
            userServicePromise.error('Couldn\'t load profile data');
            //then user is informed properly
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('User profile wasn\'t loaded');
        });

        it('should change user credentials', function () {
            //given controller is defined
            expect(ctrlScope).toBeDefined();
            //and new user credentials
            var user = {
                id: 'user-123',
                email: 'user@kunishu.com',
                password: 'pass#123'
            };
            //when changing credentials
            ctrlScope.changeCredentials(user);
            //and back-end responded successfully
            expect(mockUsersService.saveUser).toEqual({
                id: 'user-123',
                email: 'user@kunishu.com',
                password: 'pass#123'
            });
            userServicePromise.deffered({
                data: 'OK'
            });
            //then credentials are changed
        });

        it('should inform user that credentials hasn\'t been changed', function () {
            //given controller is defined
            expect(ctrlScope).toBeDefined();
            //and new user credentials
            var user = {
                id: 'user-123',
                email: 'user@kunishu.com',
                password: 'pass#123'
            };
            //when changing credentials
            ctrlScope.changeCredentials(user);
            //and back-end responded with failure
            expect(mockUsersService.saveUser).toEqual({
                id: 'user-123',
                email: 'user@kunishu.com',
                password: 'pass#123'
            });
            userServicePromise.error('Error');
            //then user is informed properly
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('User credentials hasn\'t been saved');
        });

        it('should save user profile', function () {
            //given controller is defined
            expect(ctrlScope).toBeDefined();
            //and new user settings
            var user = {
                id: 'user-123',
                email: 'user@kunishu.com',
                password: 'pass#123',
                first_name: 'John',
                last_name: 'Bravo'
            };
            //when saving user profile
            ctrlScope.save(user);
            //and back-end responded successfully
            expect(mockUsersService.saveUser).toEqual({
                id: 'user-123',
                first_name: 'John',
                last_name: 'Bravo'
            });
            userServicePromise.deffered({
                data: 'OK'
            });
            //then profile is changed
            //and user info in session is refreshed
            expect(mockSession.refresh).toHaveBeenCalledWith(user);
            //and broadcast event is sent
            expect(spyRootScope.$broadcast).toHaveBeenCalledWith(mockAuthEvents.SESSION_REFRESH, user);
        });

        it('should inform user that profile hasn\t been changed', function () {
            //given controller is defined
            expect(ctrlScope).toBeDefined();
            //and new user settings
            var user = {
                id: 'user-123',
                email: 'user@kunishu.com',
                password: 'pass#123',
                first_name: 'John',
                last_name: 'Bravo'
            };
            //when saving user profile
            ctrlScope.save(user);
            //and back-end responded with failure
            expect(mockUsersService.saveUser).toEqual({
                id: 'user-123',
                first_name: 'John',
                last_name: 'Bravo'
            });
            userServicePromise.error('Error');
            //then user is informed properly
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('User profile hasn\'t been saved');
            //and user info in session is not refreshed
            expect(mockSession.refresh).not.toHaveBeenCalledWith(user);
            //and broadcast event is not sent
            expect(spyRootScope.$broadcast).not.toHaveBeenCalledWith(mockAuthEvents.SESSION_REFRESH, user);
        });

    });

});