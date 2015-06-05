'use strict';

describe('user-payments-spec:', function () {

    describe('UserPaymentPlanCtrl-spec', function () {

        var ctrlScope, injectedCtrls;
        var mockSession, mockAuthEvents, mockRoles, mockCtrl;

        //prepare module for testing
        beforeEach(angular.mock.module('users.account'));

        //prepare controller for testing
        beforeEach(inject(function ($controller, _$rootScope_, $q) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            //mock services
            mockSession = jasmine.createSpyObj('Session', ['getUserId', 'getUserRole']);
            //mock others
            var mockLog = jasmine.createSpyObj('$log', ['debug', 'error']);
            mockAuthEvents = {
                USER_LOGGED_IN: 'mock-user-logged-in',
                USER_LOGGED_OUT: 'mock-user-logged-out',
                SESSION_REFRESH: 'mock-session-refresh',
                SESSION_TIMEOUT: 'mock-session-timeout'
            };
            mockRoles = {DOCTOR: 'doctor', USER: 'user'};
            //inject mocks
            injectedCtrls = [];
            mockCtrl = {
                eventBus: [],
                eventBusHandlers: []
            };
            $controller('UserPaymentPlanCtrl', {
                $scope: ctrlScope,
                $controller: function (ctrlName, params) {
                    injectedCtrls.push(ctrlName);
                    params.$scope.loadProfile = function () {
                        mockCtrl.profileLoaded = true;
                    };
                    params.$scope.save = function (user) {
                        mockCtrl.savedUser = user;
                    };
                    params.$scope.$on = function (event, handler) {
                        mockCtrl.eventBus.push(event);
                        mockCtrl.eventBusHandlers.push(handler);
                    };
                },
                Session: mockSession,
                $log: mockLog,
                AUTH_EVENTS: mockAuthEvents,
                USER_ROLES: mockRoles
            });
        }));

        describe('user info management', function () {

            it('should initialize user payments', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and user is not logged in

                //then user controller is injected
                expect(injectedCtrls).toEqual(['UserProfileCtrl']);
                //and user profile is not loaded for not logged in user
                expect(mockCtrl.profileLoaded).not.toBeDefined();
                //and ctrl is registered in event bus
                expect(mockCtrl.eventBus).toEqual([mockAuthEvents.USER_LOGGED_IN, mockAuthEvents.USER_LOGGED_OUT,
                    mockAuthEvents.SESSION_REFRESH, mockAuthEvents.SESSION_TIMEOUT]);
            });

            it('should load user info', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and user is logged in
                mockSession.getUserId.andReturn('user-123');
                mockSession.getUserRole.andReturn(mockRoles.USER);
                //when controller is refreshed
                ctrlScope.refresh();
                //then user profile is loaded for logged in user
                expect(mockCtrl.profileLoaded).toBe(true);
            });

            it('should refresh user info when user is logged in', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and event bus is initialized
                expect(mockCtrl.eventBus).toEqual([mockAuthEvents.USER_LOGGED_IN, mockAuthEvents.USER_LOGGED_OUT,
                    mockAuthEvents.SESSION_REFRESH, mockAuthEvents.SESSION_TIMEOUT]);
                //when user logs in
                mockSession.getUserId.andReturn('user-123');
                mockSession.getUserRole.andReturn(mockRoles.USER);
                mockCtrl.eventBusHandlers[0]();
                //then user profile is loaded for logged in user
                expect(mockCtrl.profileLoaded).toBe(true);
            });

            it('should refresh user info when user is logged out', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and event bus is initialized
                expect(mockCtrl.eventBus).toEqual([mockAuthEvents.USER_LOGGED_IN, mockAuthEvents.USER_LOGGED_OUT,
                    mockAuthEvents.SESSION_REFRESH, mockAuthEvents.SESSION_TIMEOUT]);
                //when user logs out
                mockSession.getUserId.andReturn(null);
                mockSession.getUserRole.andReturn(mockRoles.USER);
                mockCtrl.eventBusHandlers[1]();
                //then user profile is loaded for logged in user
                expect(mockCtrl.profileLoaded).not.toBeDefined();
                //and user info is cleared
                expect(ctrlScope.user).toEqual({});
            });

            it('should refresh user info when user session changes', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and event bus is initialized
                expect(mockCtrl.eventBus).toEqual([mockAuthEvents.USER_LOGGED_IN, mockAuthEvents.USER_LOGGED_OUT,
                    mockAuthEvents.SESSION_REFRESH, mockAuthEvents.SESSION_TIMEOUT]);
                //and user is logged in
                mockSession.getUserId.andReturn('user-123');
                mockSession.getUserRole.andReturn(mockRoles.USER);
                //when session is refreshed
                mockCtrl.eventBusHandlers[2]();
                //then user profile is reloaded
                expect(mockCtrl.profileLoaded).toBe(true);
            });

            it('should refresh user info on session time-out', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and event bus is initialized
                expect(mockCtrl.eventBus).toEqual([mockAuthEvents.USER_LOGGED_IN, mockAuthEvents.USER_LOGGED_OUT,
                    mockAuthEvents.SESSION_REFRESH, mockAuthEvents.SESSION_TIMEOUT]);
                //and user is logged in
                mockSession.getUserId.andReturn('user-123');
                mockSession.getUserRole.andReturn(mockRoles.USER);
                //when time-out occurs for user session
                mockCtrl.eventBusHandlers[3]();
                //then user profile is reloaded
                expect(mockCtrl.profileLoaded).toBe(true);
            });

        });

        describe('payment plans management', function () {

            it('should switch to free plan', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and user has doctor plan
                mockSession.getUserId.andReturn('user-123');
                ctrlScope.user.role = mockRoles.DOCTOR;
                expect(ctrlScope.isFreePlan()).toBe(false);
                expect(ctrlScope.isDoctorPlan()).toBe(true);

                //when changing plan
                ctrlScope.freePlan();

                //then user changes are saved
                expect(mockCtrl.savedUser).toEqual({role: mockRoles.USER});
                //and plan is changed
                expect(ctrlScope.isFreePlan()).toBe(true);
                expect(ctrlScope.isDoctorPlan()).toBe(false);
            });

            it('should switch to doctor plan', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and user has free plan
                mockSession.getUserId.andReturn('user-123');
                ctrlScope.user.role = mockRoles.USER;
                expect(ctrlScope.isFreePlan()).toBe(true);
                expect(ctrlScope.isDoctorPlan()).toBe(false);

                //when changing plan
                ctrlScope.doctorPlan();

                //then user changes are saved
                //and default info is set
                expect(mockCtrl.savedUser).toEqual(
                    {
                        role: 'doctor',
                        degree: '$$degree-1',
                        locations: []
                    }
                );
                //and plan is changed
                expect(ctrlScope.isFreePlan()).toBe(false);
                expect(ctrlScope.isDoctorPlan()).toBe(true);
            });

            it('should not overwrite old data while switching to doctor plan', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and user has free plan
                mockSession.getUserId.andReturn('user-123');
                ctrlScope.user.role = mockRoles.USER;
                expect(ctrlScope.isFreePlan()).toBe(true);
                expect(ctrlScope.isDoctorPlan()).toBe(false);
                //and user has doctor planned activated in the past
                ctrlScope.user.degree = "old-degree";
                ctrlScope.user.locations = [{id: 'old-location'}];

                //when changing plan
                ctrlScope.doctorPlan();

                //then user changes are saved
                //and old info is not overwritten
                expect(mockCtrl.savedUser).toEqual(
                    {
                        role: 'doctor',
                        degree: 'old-degree',
                        locations: [{id: 'old-location'}]
                    }
                );
                //and plan is changed
                expect(ctrlScope.isFreePlan()).toBe(false);
                expect(ctrlScope.isDoctorPlan()).toBe(true);
            });

        });

    });

});