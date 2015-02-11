'use strict';

describe('user-profile-spec:', function () {

    describe('UserProfileCtrl-spec', function () {

        var ctrlScope, spyRootScope;
        var mockUsersService, mockSession, mockUiNotification, mockAuthEvents, mockLabels;
        /* Deferred response of users service */
        var userServicePromise;

        //prepare module for testing
        beforeEach(angular.mock.module('users.account'));

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
            //mock labels
            mockLabels = jasmine.createSpyObj('mockLabels', ['getDegrees']);
            var labelPromise = {
                then: function (f) {
                    labelPromise.onSuccess = f;
                    return labelPromise;
                }
            };
            mockLabels.getDegrees.andReturn(labelPromise);
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
            mockAuthEvents = {
                SESSION_REFRESH: 'mock-session-refresh'
            };
            var mockRoles = {DOCTOR: 'doctor'};
            //inject mocks
            $controller('UserProfileCtrl', {
                $rootScope: spyRootScope,
                $scope: ctrlScope,
                UsersService: mockUsersService,
                Session: mockSession,
                uiNotification: mockUiNotification,
                $log: mockLog,
                LANGS: mockLangs,
                THEMES: mockThemes,
                AUTH_EVENTS: mockAuthEvents,
                Labels: mockLabels,
                USER_ROLES: mockRoles
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