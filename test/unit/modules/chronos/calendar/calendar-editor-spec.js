'use strict';

describe('calendar-editor-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos'));

    describe('CalendarEditorCtrl-spec:', function () {

        var ctrlScope, mockRootScope;
        var mockCalendarService;
        var mockEventActionManager, mockUiNotification;
        var mockState, mockStateParams;
        var calendarPromise, calendarEvents;

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
                daysAmount: 1,
                data: {
                    addVisitState: 'mock-state.new-visit',
                    editVisitState: 'mock-state.edit-visit'
                }
            };
            mockStateParams = {doctorId: "doctor-123", currentDate: new Date()};
            //inject mocks
            $controller('CalendarEditorCtrl', {
                $rootScope: mockRootScope,
                $scope: ctrlScope,
                $log: mockLog,
                $state: mockState,
                $stateParams: mockStateParams,
                CalendarService: mockCalendarService,
                EventUtils: $injector.get('EventUtils'),
                EventActionManager: mockEventActionManager,
                uiNotification: mockUiNotification
            });
            ctrlScope.afterEventsLoad = function () {
                ctrlScope.eventsLoaded = true;
            };
            ctrlScope.attachEvent = function (event) {
                ctrlScope.attachedEvent = event;
            };
            ctrlScope.detachEvent = function (event) {
                ctrlScope.detachedEvent = event;
            };
            ctrlScope.buildTimelineFor = function (start, end) {
                ctrlScope.timeline = [start, end];
            };
        }));

        describe('events modification-spec:', function () {

            it('should start adding new event', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and edition of event has not started
                mockState.current.name = "mock-state.calendar";
                //and current user
                ctrlScope.doctorId = "doctor-123";
                //when starting adding event on chosen time
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 23
                });
                ctrlScope.addEvent(startDate, 13, 30);
                //then event edition is started
                var startTime = startDate.clone().set({hour: 13, minute: 30, second: 0});
                expect(mockState.go).toHaveBeenCalledWith(mockState.current.data.addVisitState, {
                    doctorId: 'doctor-123',
                    startTime: startTime.toString('yyyy-MM-dd HH:mm'),
                    currentDate: startTime.toString('yyyy-MM-dd')
                });
            });

            it('should change date of edited event', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and edition of event has started
                mockState.current.name = mockState.current.data.addVisitState;
                //and current user
                ctrlScope.doctorId = "doctor-123";
                //when starting choosing new start date of an edited event
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 23
                });
                ctrlScope.addEvent(startDate, 13, 30);
                //then event edition is NOT started
                var startTime = startDate.clone().set({hour: 13, minute: 30, second: 0});
                expect(mockState.go).not.toHaveBeenCalledWith(mockState.current.data.addVisitState, {
                    doctorId: 'doctor-123',
                    startTime: startTime.toString('yyyy-MM-dd HH:mm')
                });
                //and proper info event about new picked data is broad-casted
                expect(mockRootScope.$broadcast).toHaveBeenCalledWith(calendarEvents.CALENDAR_TIME_PICKED, startTime);
            });

            it('should start editing event', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and current user
                ctrlScope.doctorId = "doctor-123";
                //and existing event to be edited
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 23
                });
                var event = {
                    id: 'event-123',
                    title: 'sample-event',
                    start: startDate.clone(),
                    end: startDate.clone().add(1).hour()
                };
                //when starting editing event
                ctrlScope.editEvent(event);
                //then event edition is started
                expect(mockState.go).toHaveBeenCalledWith(mockState.current.data.editVisitState, {
                    doctorId: 'doctor-123',
                    eventId: event.id,
                    currentDate: event.start.toString('yyyy-MM-dd')
                });
            });

            it('should cancel event', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                ctrlScope.beginDate = startDate;
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and event can be cancelled
                var event = {
                    id: 1,
                    title: 'sample-event1',
                    start: startDate.clone().add(3).hours(),
                    end: startDate.clone().add(5).hours()
                };
                mockEventActionManager.canCancel.andReturn(true);
                //when one of events is cancelled
                ctrlScope.cancelEvent(event);
                //and back-end responded successfully
                calendarPromise.onSuccess('CANCELLED');
                //then event is cancelled
                expect(mockEventActionManager.canCancel).toHaveBeenCalledWith(event);
                //and event is detached
                expect(ctrlScope.detachedEvent).toBe(event);
                //and time line is refreshed
                expect(ctrlScope.timeline).toEqual([event.start, event.end]);
            });

            it('should block event cancellation', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                ctrlScope.beginDate = startDate;
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and event cannot be cancelled
                var event = {
                    id: 1,
                    title: 'sample-event1',
                    start: startDate.clone().add(3).hours(),
                    end: startDate.clone().add(5).hours()
                };
                mockEventActionManager.canCancel.andReturn(false);
                //when one of events is cancelled
                ctrlScope.cancelEvent(event);
                //then event is not cancelled
                expect(mockEventActionManager.canCancel).toHaveBeenCalledWith(event);
                expect(mockCalendarService.cancel).not.toHaveBeenCalled();
                //then user is informed properly
                expect(mockEventActionManager.canCancel).toHaveBeenCalledWith(event);
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Event cannot be cancelled');
                //and event is not detached
                expect(ctrlScope.detachedEvent).not.toBeDefined();
                //and time line is not refreshed
                expect(ctrlScope.timeline).not.toBeDefined();
            });

            it('should inform user when event cannot be cancelled due to backend failure', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                ctrlScope.beginDate = startDate;
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and event can be cancelled
                var event = {
                    id: 1,
                    title: 'sample-event1',
                    start: startDate.clone().add(3).hours(),
                    end: startDate.clone().add(5).hours()
                };
                mockEventActionManager.canCancel.andReturn(true);
                //when one of events is cancelled
                ctrlScope.cancelEvent(event);
                //and back-end responded with failure
                calendarPromise.onError('FAILURE');
                //then user is informed properly
                expect(mockEventActionManager.canCancel).toHaveBeenCalledWith(event);
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Couldn\'t cancel event');
                //and event is not detached
                expect(ctrlScope.detachedEvent).not.toBeDefined();
                //and time line is not refreshed
                expect(ctrlScope.timeline).not.toBeDefined();
            });

            it('should change event time period on drag and drop', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day display period time
                var daysCount = 1;
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                ctrlScope.beginDate = startDate;
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and event can be changed
                var event = {
                    id: 1,
                    title: 'sample-event1',
                    start: startDate.clone().add(3).hours(),
                    end: startDate.clone().add(5).hours()
                };
                mockEventActionManager.canEdit.andReturn(true);

                //when one of events is updated on DnD
                var dndEvent = {};
                ctrlScope.dndDrop(dndEvent, event, startDate, 8, 0, 0);
                //and back-end responded successfully
                calendarPromise.onSuccess('UPDATED');
                //then event is updated
                expect(event.start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 08:00:00');
                expect(event.end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 10:00:00');
                //and event is updated
                expect(ctrlScope.detachedEvent).toBe(event);
                expect(ctrlScope.attachedEvent).toBe(event);
                //and time line is refreshed
                expect(ctrlScope.timeline).toEqual([event.start, event.end]);

            });

            it('should fallback drag and drop changes when event cannot be saved', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                ctrlScope.beginDate = startDate;
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and event can be changed
                var event = {
                    id: 1,
                    title: 'sample-event1',
                    start: startDate.clone().add(3).hours(),
                    end: startDate.clone().add(5).hours()
                };
                mockEventActionManager.canEdit.andReturn(true);

                //when one of events is updated on DnD
                var dndEvent = {};
                ctrlScope.dndDrop(dndEvent, event, startDate, 8, 0, 0);
                //and back-end responded with failure
                calendarPromise.onError('FAILURE');
                //then old state of event is restored
                expect(event.start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 03:00:00');
                expect(event.end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 05:00:00');
                //and event is updated
                expect(ctrlScope.detachedEvent).toBe(event);
                expect(ctrlScope.attachedEvent).toBe(event);
                //and time line is refreshed
                expect(ctrlScope.timeline).toEqual([event.start, event.end]);
                //and user is informed about error
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Couldn\'t save event');
            });

            it('should change event duration on resize', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                ctrlScope.beginDate = startDate;
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and event can be changed
                var event = {
                    id: 1,
                    title: 'sample-event1',
                    start: startDate.clone().add(3).hours(),
                    end: startDate.clone().add(5).hours()
                };
                mockEventActionManager.canEdit.andReturn(true);

                //when duration of event is changed using resizing
                var dndEvent = {};
                var ui = {
                    size: {
                        height: 150
                    },
                    originalSize: {
                        height: 120
                    }
                };
                ctrlScope.dndChangeTime(dndEvent, ui, event);
                //and back-end responded successfully
                calendarPromise.onSuccess('UPDATED');
                //then event is updated
                expect(event.start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 03:00:00');
                expect(event.end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 05:30:00');
                expect(event.duration).toBe(150);
                //and event is updated
                expect(ctrlScope.detachedEvent).toBe(event);
                expect(ctrlScope.attachedEvent).toBe(event);
                //and time line is refreshed
                expect(ctrlScope.timeline).toEqual([event.start, event.end]);
            });

            it('should fallback resize change on event', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                ctrlScope.beginDate = startDate;
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and event can be changed
                var event = {
                    id: 1,
                    title: 'sample-event1',
                    start: startDate.clone().add(3).hours(),
                    end: startDate.clone().add(5).hours()
                };
                mockEventActionManager.canEdit.andReturn(true);

                //when duration of event is changed using resizing
                var dndEvent = {};
                var ui = {
                    size: {
                        height: 150
                    },
                    originalSize: {
                        height: 120
                    }
                };
                ctrlScope.dndChangeTime(dndEvent, ui, event);
                //and back-end responded with failure
                calendarPromise.onError('ERROR');
                //then event is updated
                expect(event.start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 03:00:00');
                expect(event.end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 05:00:00');
                expect(event.duration).toBe(150);
                //and event is updated
                expect(ctrlScope.detachedEvent).toBe(event);
                expect(ctrlScope.attachedEvent).toBe(event);
                //and time line is refreshed
                expect(ctrlScope.timeline).toEqual([event.start, event.end]);
                //and user is informed about error
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Couldn\'t save event');
            });

        });


    });

});