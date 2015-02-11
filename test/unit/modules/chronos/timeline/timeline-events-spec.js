'use strict';

describe('timeline-events-spec:', function () {

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

});