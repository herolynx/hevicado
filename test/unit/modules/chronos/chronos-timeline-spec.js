'use strict';

describe('chronos-timeline-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos'));

    describe('TimelineCtrl-spec:', function () {
        var mockCalendarService, mockUiNotification;
        var calendarPromise;
        var ctrlScope;

        //prepare controller for testing
        beforeEach(inject(function ($controller, _$rootScope_, $injector) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            //mock dependencies
            mockCalendarService = jasmine.createSpyObj('mockCalendarService', ['events', 'init']);
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
            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            var mockLog = jasmine.createSpyObj('mockLog', ['debug', 'info', 'error']);
            //inject mocks
            $controller('TimelineCtrl', {
                $scope: ctrlScope,
                $log: mockLog,
                CalendarService: mockCalendarService,
                EventUtils: $injector.get('EventUtils'),
                uiNotification: mockUiNotification
            });
        }));

        it('should initialize controller time table after creation', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            //then time window is set for the whole week
            expect(ctrlScope.startDate).not.toBeNull();
            expect(ctrlScope.endDate).not.toBeNull();
            expect(ctrlScope.showTillDate).not.toBeNull();
            //and calendar service is initialized
            expect(mockCalendarService.init).toHaveBeenCalled();
            //and loading of data has begun
            expect(mockCalendarService.events).toHaveBeenCalled();
            expect(ctrlScope.loading).toBe(true);
        });

        it('should initialize time window', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            //and start date
            var startDate = new Date().set({
                day: 3,
                month: 11,
                year: 2014,
                hour: 0,
                minute: 0,
                second: 0
            });
            //and months count
            var monthsCount = 3;
            //when time window is set
            ctrlScope.initTimeWindow(startDate, monthsCount);
            //then time window is set for chosen period of time
            expect(ctrlScope.startDate.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-09-03 00:00:00');
            expect(ctrlScope.endDate.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-12-03 00:00:00');
        });

        it('should get events from time window', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            expect(ctrlScope.events).toEqual([]);
            ctrlScope.loading = false;
            mockCalendarService.events.reset();
            //and time window
            var startDate = Date.today();
            var endDate = Date.today().add(1).days();
            //and sample events
            var events = [
                {
                    id: "event-1",
                    start: startDate.toString("yyyy-MM-dd HH:mm:ss"),
                    end: startDate.toString("yyyy-MM-dd HH:mm:ss")
                },
                {
                    id: "event-2",
                    start: startDate.toString("yyyy-MM-dd HH:mm:ss"),
                    end: startDate.toString("yyyy-MM-dd HH:mm:ss")
                }
            ];
            //when getting events 
            ctrlScope.getEvents(startDate, endDate);
            expect(ctrlScope.loading).toBe(true);
            //then calendar service is called
            expect(mockCalendarService.events).toHaveBeenCalledWith(startDate, endDate, false);
            calendarPromise.onSuccess(events);
            //and events are loaded properly
            expect(ctrlScope.loading).toBe(false);
            expect(ctrlScope.events.length).toBe(events.length);
        });

        it('should inform user that events cannot be loaded', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            expect(ctrlScope.events).toEqual([]);
            ctrlScope.loading = false;
            mockCalendarService.events.reset();
            //and time window
            var startDate = Date.today();
            var endDate = Date.today().add(1).days();
            //when getting events 
            ctrlScope.getEvents(startDate, endDate);
            expect(ctrlScope.loading).toBe(true);
            //and back-end has responded with failure
            expect(mockCalendarService.events).toHaveBeenCalledWith(startDate, endDate, false);
            calendarPromise.onError('ERROR');
            //then user is informed properly
            expect(ctrlScope.loading).toBe(false);
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('Couldn\'t load events');
        });

        it('should load next page of events', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            ctrlScope.loading = false;
            mockCalendarService.events.reset();
            //and current time window
            ctrlScope.startDate = new Date().set({
                day: 3,
                month: 8,
                year: 2014,
                hour: 0,
                minute: 0,
                second: 0
            });
            ctrlScope.endDate = new Date().set({
                day: 3,
                month: 11,
                year: 2014,
                hour: 0,
                minute: 0,
                second: 0
            });
            ctrlScope.showTillDate = new Date().set({
                day: 3,
                month: 1,
                year: 2014,
                hour: 0,
                minute: 0,
                second: 0
            });
            ctrlScope.monthsCount = 3;
            //when getting next page of events 
            ctrlScope.next();
            //then time window is shifted
            expect(ctrlScope.startDate.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-06-03 00:00:00');
            expect(ctrlScope.endDate.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-09-03 00:00:00');
            //and events from new time windows are taken
            expect(mockCalendarService.events).toHaveBeenCalledWith(ctrlScope.startDate, ctrlScope.endDate, false);
            expect(ctrlScope.loading).toBe(true);
        });

        it('should not load next page of events if time table is out of limit', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            ctrlScope.loading = false;
            mockCalendarService.events.reset();
            //and current time window
            ctrlScope.startDate = new Date().set({
                day: 3,
                month: 8,
                year: 2014,
                hour: 0,
                minute: 0,
                second: 0
            });
            ctrlScope.endDate = new Date().set({
                day: 3,
                month: 11,
                year: 2014,
                hour: 0,
                minute: 0,
                second: 0
            });
            ctrlScope.monthsCount = 3;
            //and limit of displayed data has been reached
            ctrlScope.showTillDate = ctrlScope.startDate;
            //when getting next page of events
            ctrlScope.next();
            //then time window is not shifted
            expect(ctrlScope.startDate.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-09-03 00:00:00');
            expect(ctrlScope.endDate.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-12-03 00:00:00');
            //and events from new time windows are not taken
            expect(mockCalendarService.events).not.toHaveBeenCalledWith(ctrlScope.startDate, ctrlScope.endDate, false);
            expect(ctrlScope.loading).toBe(false);
        });

    });

    describe('TimelineEventCtrl-spec:', function () {

        var mockCalendarService, mockUiNotification, mockActionManager, mockEventUtils, mockStates;
        var calendarPromise;
        var ctrlScope;

        //prepare controller for testing
        beforeEach(inject(function ($controller, _$rootScope_) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            //mock dependencies
            mockCalendarService = jasmine.createSpyObj('mockCalendarService', ['save']);
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
                id: 'event-1'
            };
            //and event can be cancelled
            mockActionManager.canCancel.andReturn(true);
            //when cancelling event
            ctrlScope.cancel(event);
            //then event is cancelled successfully
            expect(event.cancelled).toBeDefined();
            expect(event.cancelledBy).toEqual({
                id: 1
            });
            expect(mockActionManager.canCancel).toHaveBeenCalledWith(event);
            expect(mockCalendarService.save).toHaveBeenCalled();
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
            //and user is informed properly
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('Event cannot be cancelled');
        });

        it('should clear state of event after failure cancelation', function () {
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
            calendarPromise.error('ERROR');
            //then event is cancelled successfully
            expect(event.cancelled).toBe(null);
            expect(event.cancelledBy).toBe(null);
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