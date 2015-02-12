'use strict';

describe('info-event-spec:', function () {

    var mockCalendarService, mockEventActionManager;
    var mockUsersService, mockSession;
    var mockUiNotification, mockLog;
    var mockState, mockStateParams;
    var $rootScope, ctrlScope, calendarPromise, userPromise, allPromise, mockQ;

    //prepare module for testing
    beforeEach(angular.mock.module('chronos'));

    beforeEach(function () {
        toUTCDate = function (value) {
            return typeof value != 'string' ? value : Date.parse(value);
        };
        toLocalDate = function (value) {
            return typeof value == 'string' ? Date.parse(value) : new Date(value);
        };
    });

    describe('DisplayEventCtrl-spec:', function () {

        var mockController, mockCtrlState;

        //prepare controller for testing
        beforeEach(inject(function ($controller, $injector, _$rootScope_) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            $rootScope = _$rootScope_;

            //mock calendar related stuff
            mockCalendarService = jasmine.createSpyObj('mockCalendarService', ['event']);
            calendarPromise = {};
            calendarPromise.error = function (f) {
                calendarPromise.onError = f;
                return calendarPromise;
            };
            calendarPromise.success = function (f) {
                calendarPromise.onSuccess = f;
                return calendarPromise;
            };
            mockCalendarService.event.andReturn(calendarPromise);

            //mock state related stuff
            mockStateParams = {};

            //mock others
            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            var mockLog = jasmine.createSpyObj('mockLog', ['debug', 'info', 'error']);
            mockCtrlState = {};
            mockController = function (name, state) {
                mockCtrlState.name = name;
                mockCtrlState.state = state;
            };

            //inject mocks
            $controller('DisplayEventCtrl', {
                $scope: ctrlScope,
                $log: mockLog,
                $stateParams: mockStateParams,
                CalendarService: mockCalendarService,
                uiNotification: mockUiNotification,
                $controller: mockController
            });

        }));

        it('should initialize controller', function () {
            //given controller is defined
            expect(ctrlScope).toBeDefined();

            //then controller is initialized properly
            expect(mockCtrlState.name).toBe('TimelineEventCtrl');
            expect(mockCtrlState.state).not.toBeNull();
        });

        it('should display event details', function () {
            //given controller is defined
            expect(ctrlScope).toBeDefined();
            //and event to be displayed
            mockStateParams.eventId = 'event-123';
            //and sample event
            var event = {
                id: 'event-123',
                start: '2014-12-16 10:30',
                end: '2014-12-16 11:30'
            };

            //when loading info about event
            ctrlScope.load(mockStateParams.eventId);

            //then info is loaded
            expect(mockCalendarService.event).toHaveBeenCalledWith(mockStateParams.eventId);
            calendarPromise.onSuccess(event);
            //and info is properly formatted
            expect(ctrlScope.event.id).toBe('event-123');
            expect(ctrlScope.event.start.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-16 10:30');
            expect(ctrlScope.event.end.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-16 11:30');
        });

        it('should inform user when info about even cannot be displayed', function () {
            //given controller is defined
            expect(ctrlScope).toBeDefined();
            //and event to be displayed
            mockStateParams.eventId = 'event-123';
            //and sample event
            var event = {
                id: 'event-123',
                start: '2014-12-16 10:30',
                end: '2014-12-16 11:30'
            };

            //when loading info about event
            ctrlScope.load(mockStateParams.eventId);

            //then info is loaded
            expect(mockCalendarService.event).toHaveBeenCalledWith(mockStateParams.eventId);
            calendarPromise.onError('Error');
            //and user is informed if into cannot be displayed
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('Couldn\'t load event details');
        });

    });

});