'use strict';

describe('chronos-timeline-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos.timeline'));

    describe('TimelineCtrl-spec:', function () {
        var mockCalendarService, mockUiNotification;
        var calendarPromise;
        var ctrlScope;

        //prepare controller for testing
        beforeEach(inject(function ($controller, _$rootScope_) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            //mock dependencies
            mockCalendarService = jasmine.createSpyObj('mockCalendarService', ['events']);
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
                uiNotification: mockUiNotification
            });
        }));

        it('should initialize time window', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            //and start date
            var startDate = new Date().set({
                day: 1,
                month: 0,
                year: 2014,
                hour: 0,
                minute: 0,
                second: 0
            });
            //and days count
            var daysCount = 7;
            //when time window is set
            ctrlScope.initTimeWindow(startDate, daysCount);
            //then time window is set for the whole week
            expect(ctrlScope.startDate.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-01-01 00:00:00');
            expect(ctrlScope.endDate.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-01-08 00:00:00');
        });

        it('should get events from time window', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            expect(ctrlScope.events).toEqual([]);
            //and time window
            var startDate = Date.today();
            var endDate = Date.today().add(1).days();
            //and sample events
            var events = [
                {
                    id: "event-1"
             },
                {
                    id: "event-2"
             }
            ];
            //when getting events 
            ctrlScope.getEvents(startDate, endDate);
            expect(ctrlScope.loading).toBe(true);
            //then calendar service is called
            expect(mockCalendarService.events).toHaveBeenCalledWith(startDate, endDate);
            calendarPromise.success(events);
            //and events are loaded properly
            expect(ctrlScope.loading).toBe(false);
            expect(ctrlScope.events).toEqual([{
                id: 'event-2'
            }, {
                id: 'event-1'
            }]);
        });

        it('should inform user that events cannot be loaded', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            expect(ctrlScope.events).toEqual([]);
            //and time window
            var startDate = Date.today();
            var endDate = Date.today().add(1).days();
            //when getting events 
            ctrlScope.getEvents(startDate, endDate);
            expect(ctrlScope.loading).toBe(true);
            //and back-end has responsed with failure
            expect(mockCalendarService.events).toHaveBeenCalledWith(startDate, endDate);
            calendarPromise.error('ERROR');
            //then user is informed properly
            expect(ctrlScope.loading).toBe(false);
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('Couldn\'t load events');
        });

        it('should load next page of events', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            //and current time window
            ctrlScope.startDate = new Date().set({
                day: 1,
                month: 0,
                year: 2014,
                hour: 0,
                minute: 0,
                second: 0
            });
            ctrlScope.endDate = new Date().set({
                day: 1,
                month: 0,
                year: 2014,
                hour: 0,
                minute: 0,
                second: 0
            });
            ctrlScope.daysCount = 2;
            //when getting next page of events 
            ctrlScope.next();
            //then time window is shifted
            expect(ctrlScope.startDate.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-01-01 00:00:00');
            expect(ctrlScope.endDate.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-01-03 00:00:00');
            //and events from new time windows are taken
            expect(mockCalendarService.events).toHaveBeenCalledWith(ctrlScope.startDate, ctrlScope.endDate);
            expect(ctrlScope.loading).toBe(true);
        });

    });

    describe('TimelineEventCtrl-spec:', function () {
        var mockCalendarService, mockUiNotification, mockActionManager, mockEventUtils;
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
            //inject mocks
            $controller('TimelineEventCtrl', {
                $scope: ctrlScope,
                $log: mockLog,
                CalendarService: mockCalendarService,
                uiNotification: mockUiNotification,
                EventActionManager: mockActionManager,
                EventUtils: mockEventUtils
            });
        }));

        it('should cancel event', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            //and event
            var event = {
                id: 'event-1'
            };
            //and event can be cannelled
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
            //and event cannot be cannelled
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
            //and event can be cannelled
            mockActionManager.canCancel.andReturn(true);
            //when cancelling event
            ctrlScope.cancel(event);
            //and back-end has responsed with failure
            calendarPromise.error('ERROR');
            //then event is cancelled successfully
            expect(event.cancelled).toBe(null);
            expect(event.cancelledBy).toBe(null);
        });

    });

});