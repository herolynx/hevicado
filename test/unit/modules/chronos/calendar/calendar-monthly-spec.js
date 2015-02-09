'use strict';

describe('calendar-monhtly-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos'));

    describe('MonthlyCalendarCtrl-spec:', function () {

        var ctrlScope, mockRootScope;
        var mockCalendarService, mockUsersService;
        var mockEventActionManager, mockUiNotification, mockModal;
        var mockState, mockStateParams;
        var calendarPromise, userPromise, calendarEvents;

        beforeEach(function () {
            toUTCDate = function (value) {
                return typeof value != 'string' ? value : Date.parse(value);
            };
            toLocalDate = function (value) {
                return typeof value == 'string' ? Date.parse(value) : new Date(value);
            };
        });

        //prepare controller for testing
        beforeEach(inject(function ($controller, $injector, _$rootScope_, CALENDAR_EVENTS) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            mockRootScope = jasmine.createSpyObj('$rootScope', ['$broadcast']);
            calendarEvents = CALENDAR_EVENTS;
            //mock dependencies
            mockCalendarService = jasmine.createSpyObj('mockCalendarService', ['events', 'init', 'cancel', 'save']);
            calendarPromise = {
                success: function (f) {
                    calendarPromise.onSuccess = f;
                    return calendarPromise;
                },
                error: function (f) {
                    calendarPromise.onError = f;
                    return calendarPromise;
                }
            };
            mockCalendarService.events.andReturn(calendarPromise);
            mockCalendarService.cancel.andReturn(calendarPromise);
            mockCalendarService.save.andReturn(calendarPromise);
            mockUsersService = jasmine.createSpyObj('mockUsersService', ['get']);
            userPromise = {
                success: function (f) {
                    userPromise.onSuccess = f;
                    return userPromise;
                },
                error: function (f) {
                    userPromise.onError = f;
                    return userPromise;
                }
            };
            mockUsersService.get.andReturn(userPromise);
            mockEventActionManager = jasmine.createSpyObj('mockEventActionManager', ['canCancel', 'canEdit']);
            //mock others
            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            var mockLog = jasmine.createSpyObj('mockLog', ['debug', 'info', 'error']);
            mockState = jasmine.createSpyObj('$state', ['go']);
            mockState.current = {
                data: {
                    addVisitState: 'mock-state.new-visit',
                    editVisitState: 'mock-state.edit-visit'
                }
            };
            mockStateParams = {doctorId: "doctor-123"};
            //inject mocks
            $controller('CalendarCtrl', {
                $rootScope: mockRootScope,
                $scope: ctrlScope,
                $log: mockLog,
                $state: mockState,
                $stateParams: mockStateParams,
                CalendarService: mockCalendarService,
                CalendarCollectionFactory: $injector.get('CalendarCollectionFactory'),
                CalendarRenderer: $injector.get('CalendarRenderer'),
                EventUtils: $injector.get('EventUtils'),
                EventActionManager: mockEventActionManager,
                uiNotification: mockUiNotification,
                UsersService: mockUsersService
            });
        }));

    });

});