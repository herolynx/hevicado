'use strict';

describe('timeline-event-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos'));

    describe('TimelineEventCtrl-spec:', function () {

        var mockCalendarService, mockUiNotification, mockActionManager, mockEventUtils, mockStates;
        var calendarPromise;
        var ctrlScope;

        //prepare controller for testing
        beforeEach(inject(function ($controller, _$rootScope_) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            //mock dependencies
            mockCalendarService = jasmine.createSpyObj('mockCalendarService', ['save', 'cancel']);
            calendarPromise = {
                success: function (f) {
                    calendarPromise.success = f;
                    return calendarPromise;
                },
                error: function (f) {
                    calendarPromise.error = f;
                    return calendarPromise;
                }
            };
            mockCalendarService.save.andReturn(calendarPromise);
            mockCalendarService.cancel.andReturn(calendarPromise);
            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            mockActionManager = jasmine.createSpyObj('mockActionManager', ['canCancel']);
            mockEventUtils = jasmine.createSpyObj('mockEventUtils', ['state']);
            var mockLog = jasmine.createSpyObj('mockLog', ['debug', 'info', 'error']);
            mockStates = {OPEN: "open", CLOSED: "closed", CANCELLED: "cancelled"};
            //inject mocks
            $controller('TimelineEventCtrl', {
                $scope: ctrlScope,
                $log: mockLog,
                CalendarService: mockCalendarService,
                uiNotification: mockUiNotification,
                EventActionManager: mockActionManager,
                EventUtils: mockEventUtils,
                EVENT_STATE: mockStates
            });
        }));

        it('should cancel event', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            //and event
            var event = {
                id: 'event-1',
                start: Date.today(),
                end: Date.today().add(1).hours()
            };
            //and event can be cancelled
            mockActionManager.canCancel.andReturn(true);
            //when cancelling event
            ctrlScope.cancel(event);
            //and back-end has responded with success
            calendarPromise.success('OK');
            //then event is cancelled successfully
            expect(event.cancelled).toBeDefined();
            expect(mockActionManager.canCancel).toHaveBeenCalledWith(event);
            expect(mockCalendarService.cancel).toHaveBeenCalledWith(event);
            //and state is refreshed
            expect(mockEventUtils.state).toHaveBeenCalledWith(event);
        });

        it('should block cancelling event', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            //and event
            var event = {
                id: 'event-1'
            };
            //and event cannot be cancelled
            mockActionManager.canCancel.andReturn(false);
            //when cancelling event
            ctrlScope.cancel(event);
            //then event is not cancelled
            expect(event.cancelled).toBeUndefined();
            expect(mockActionManager.canCancel).toHaveBeenCalledWith(event);
            expect(mockCalendarService.cancel).not.toHaveBeenCalledWith(event);
            //and user is informed properly
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('Event cannot be cancelled');
        });

        it('should inform user when event wasn\'t cancelled', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            //and event
            var event = {
                id: 'event-1'
            };
            //and event can be cancelled
            mockActionManager.canCancel.andReturn(true);
            //when cancelling event
            ctrlScope.cancel(event);
            //and back-end has responded with failure
            calendarPromise.error('Error');
            //then event is not cancelled
            expect(event.cancelled).not.toBeDefined();
            //and user is informed properly
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('Couldn\'t cancel event');
            //and state is not refreshed
            expect(mockEventUtils.state).not.toHaveBeenCalledWith(event);
        });

        it('should return event action manager', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            //when getting action manager
            var actionManager = ctrlScope.actions();
            //then event action manager is returned
            expect(actionManager).toBe(mockActionManager);
        });

        it('should read state of open event', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            //and event
            var event = {
                id: 'event-1'
            };
            //and event is opened
            mockEventUtils.state.andReturn(mockStates.OPEN);
            //when checking state of event
            ctrlScope.readState(event);
            //then event is active
            expect(ctrlScope.isActive).toBe(true);
            expect(ctrlScope.isDisabled).toBe(false);
            expect(ctrlScope.state).toBe(mockStates.OPEN);
        });

        it('should read state of closed event', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            //and event
            var event = {
                id: 'event-1'
            };
            //and event is closed
            mockEventUtils.state.andReturn(mockStates.CLOSED);
            //when checking state of event
            ctrlScope.readState(event);
            //then event is disabled
            expect(ctrlScope.isActive).toBe(false);
            expect(ctrlScope.isDisabled).toBe(true);
            expect(ctrlScope.state).toBe(mockStates.CLOSED);
        });

        it('should read state of cancelled event', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            //and event
            var event = {
                id: 'event-1'
            };
            //and event is cancelled
            mockEventUtils.state.andReturn(mockStates.CANCELLED);
            //when checking state of event
            ctrlScope.readState(event);
            //then event is disabled
            expect(ctrlScope.isActive).toBe(false);
            expect(ctrlScope.isDisabled).toBe(true);
            expect(ctrlScope.state).toBe(mockStates.CANCELLED);
        });


    });

});