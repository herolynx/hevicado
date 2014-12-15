'use strict';

describe('chronos-events-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos.events'));

    describe('EventUtils-spec:', function () {
        var mockEventStates;
        var eventUtils;

        //prepare service for testing
        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockEventStates = jasmine.createSpyObj('EVENT_STATE', ['OPEN', 'CLOSED', 'CANCELLED']);
            $provide.value('EVENT_STATE', mockEventStates);
        }));

        beforeEach(inject(function ($injector) {
            //prepare event utils
            eventUtils = $injector.get('EventUtils');
        }));

        describe('event states-spec:', function () {

            it('should return OPEN state for non-cancelled event in the future', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and future event that hasn't been cancelled
                var event = {
                    cancelled: null,
                    start: Date.today().add(1).days()
                };
                //when checking state of event
                var state = eventUtils.state(event);
                //then proper state is returned
                expect(state).not.toBeNull();
                expect(state).toBe(mockEventStates.OPEN);
            });

            it('should return CANCELLED state for event in the future', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and future event
                var event = {
                    cancelled: null,
                    start: Date.today().add(1).days()
                };
                //and event has been cancelled
                event.cancelled = Date.today();
                //when checking state of event
                var state = eventUtils.state(event);
                //then proper state is returned
                expect(state).not.toBeNull();
                expect(state).toBe(mockEventStates.CANCELLED);
            });

            it('should return CLOSED state for non-cancelled event in the past', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and past event that hasn't been cancelled
                var event = {
                    cancelled: null,
                    start: new Date().set({
                        day: 1,
                        month: 1,
                        year: 2014
                    })
                };
                //when checking state of event
                var state = eventUtils.state(event);
                //then proper state is returned
                expect(state).not.toBeNull();
                expect(state).toBe(mockEventStates.CLOSED);
            });

            it('should return CANCELLED state for event in the past', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and past event
                var event = {
                    cancelled: null,
                    start: new Date().set({
                        day: 1,
                        month: 1,
                        year: 2014
                    })
                };
                //and event has been cancelled
                event.cancelled = Date.today();
                //when checking state of event
                var state = eventUtils.state(event);
                //then proper state is returned
                expect(state).not.toBeNull();
                expect(state).toBe(mockEventStates.CANCELLED);
            });

        });

        describe('event shift operations-spec:', function () {

            it('should shift date to Monday of current week', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and date that is not Monday
                var date = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 3
                });
                //when shifting date to Monday
                var monday = eventUtils.currentMonday(date);
                //then Monday of current week is returned
                expect(monday.toString('yyyy-MM-dd')).toBe('2014-09-29');
            });

            it('should not shift date if it\'s Monday of current week', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and date that is Monday of current week
                var date = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                //when shifting date to Monday
                var monday = eventUtils.currentMonday(date);
                //then date is not shifted
                expect(monday.toString('yyyy-MM-dd')).toBe('2014-10-13');
            });

        });

        describe('event normalization-spec:', function () {

            it('should set duration of an event', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and event without duration time
                var date = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13,
                    hour: 8,
                    minute: 0
                });
                var event = {
                    start: date.clone(),
                    end: date.clone().add(1).hour()
                };
                expect(event.duration).not.toBeDefined();
                //when normalizing an event
                eventUtils.normalize(event);
                //then duration of event is set
                expect(event.duration).toBeDefined();
                expect(event.duration).toBe(60);
            });

            it('should parse string type of dates in an event', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and event with string dates
                var event = {
                    start: '2014-10-14 08:30:00',
                    end: '2014-10-14 09:00:00'
                };
                expect(typeof event.start).toBe('string');
                expect(typeof event.end).toBe('string');
                //when normalizing an event
                eventUtils.normalize(event);
                //then dates are converted
                expect(typeof event.start).toBe('object');
                expect(event.start.clone).toBeDefined();
                expect(event.start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-14 08:30:00');
                expect(typeof event.end).toBe('object');
                expect(event.end.clone).toBeDefined();
                expect(event.end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-14 09:00:00');
                expect(event.duration).toBe(30);
            });

            it('should parse string type of optional dates in an event', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and event with string dates
                var event = {
                    start: '2014-10-14 08:30:00',
                    end: '2014-10-14 09:00:00',
                    cancelled: '2014-10-10 18:30:00'
                };
                expect(typeof event.start).toBe('string');
                expect(typeof event.end).toBe('string');
                //when normalizing an event
                eventUtils.normalize(event);
                //then dates are converted
                expect(typeof event.start).toBe('object');
                expect(event.start.clone).toBeDefined();
                expect(event.start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-14 08:30:00');
                expect(typeof event.end).toBe('object');
                expect(event.end.clone).toBeDefined();
                expect(event.end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-14 09:00:00');
                expect(event.duration).toBe(30);
                //and optional dates are converted too
                expect(typeof event.cancelled).toBe('object');
                expect(event.cancelled.clone).toBeDefined();
                expect(event.cancelled.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-10 18:30:00');
            });

            it('should parse number types dates in an event', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and event with number dates
                var date = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14,
                    hour: 8,
                    minute: 0
                });
                var event = {
                    start: date.getTime(),
                    end: date.clone().add(1).hour().getTime()
                };
                expect(typeof event.start).toBe('number');
                expect(typeof event.end).toBe('number');
                //when normalizing an event
                eventUtils.normalize(event);
                //then dates are converted
                expect(typeof event.start).toBe('object');
                expect(event.start.clone).toBeDefined();
                expect(event.start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-14 08:00:00');
                expect(typeof event.end).toBe('object');
                expect(event.end.clone).toBeDefined();
                expect(event.end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-14 09:00:00');
                expect(event.duration).toBe(60);
            });

        });

        describe('to plain JSON normalization-spec:', function () {

            it('should convert event dates into string', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and event with sample dates
                var date = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13,
                    hour: 8,
                    minute: 0
                });
                var event = {
                    start: date.clone(),
                    end: date.clone().add(1).hour(),
                    cancelled: date.clone().add(2).hour()
                };
                expect(event.duration).not.toBeDefined();
                //when converting an event into plain JSON
                eventUtils.toJson(event);
                //then dates are converted into strings
                expect(event.start).toBe('2014-10-13 08:00:00');
                expect(event.end).toBe('2014-10-13 09:00:00');
                expect(event.cancelled).toBe('2014-10-13 10:00:00');
            });

        });

        describe('value normalization-spec:', function () {

            it('should normalize not allowed value', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and allowed values
                var values = ['value1', 'value2', 'value3'];
                //and not allowed current value
                var currentValue = 'value4';
                //when normalizing value
                var normalized = eventUtils.value(values, currentValue, 0);
                //then value is normalized
                expect(normalized).toBe('value1');
            });

            it('should not normalize not allowed value of owner', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and allowed values
                var values = ['value1', 'value2', 'value3'];
                //and not allowed current value
                var currentValue = 'value4';
                //and master user
                var isOwner = true;
                //when normalizing value
                var normalized = eventUtils.value(values, currentValue, 0, isOwner);
                //then value is normalized
                expect(normalized).toBe('value4');
            });

            it('should not normalize allowed value', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and allowed values
                var values = ['value1', 'value2', 'value3'];
                //and allowed current value
                var currentValue = 'value2';
                //when normalizing value
                var normalized = eventUtils.value(values, currentValue, 0);
                //then value is not changed
                expect(normalized).toBe('value2');
            });

        });

    });

    describe('EventActionManager-spec:', function () {

        var mockEventStates, mockSession;
        var eventActionManager, eventUtils;
        var currentUserId = "user-123";

        //prepare service for testing
        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockEventStates = jasmine.createSpyObj('EVENT_STATE', ['OPEN', 'CLOSED', 'CANCELLED']);
            mockEventStates.OPEN.key = 0;
            mockEventStates.CLOSED.key = 1;
            mockEventStates.CANCELLED.key = 2;
            $provide.value('EVENT_STATE', mockEventStates);
            mockSession = jasmine.createSpyObj('Session', ['getUserId']);
            $provide.value('Session', mockSession);
            mockSession.getUserId.andReturn(currentUserId);
        }));

        beforeEach(inject(function ($injector) {
            eventActionManager = $injector.get('EventActionManager');
            eventUtils = $injector.get('EventUtils');
        }));

        describe('event cancellation-spec:', function () {

            it('should allow doctor to cancel event in OPEN state', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in open state
                var event = {
                    id: 'event-123',
                    start: Date.today().add(1).days(),
                    doctor: {id: currentUserId},
                    patient: {id: 'diff-user-123'}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether event can be cancelled
                var canCancel = eventActionManager.canCancel(event);
                //then action is allowed
                expect(canCancel).toBe(true);
            });

            it('should allow patient to cancel event in OPEN state', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in open state
                var event = {
                    id: 'event-123',
                    start: Date.today().add(1).days(),
                    doctor: {id: 'diff-user-123'},
                    patient: {id: currentUserId}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether event can be cancelled
                var canCancel = eventActionManager.canCancel(event);
                //then action is allowed
                expect(canCancel).toBe(true);
            });

            it('should prevent cancellation of events by non-participant users', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in open state
                var event = {
                    id: 'event-123',
                    start: Date.today().add(1).days(),
                    doctor: {id: 'diff-user-123'},
                    patient: {id: 'diff-user-456'}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether event can be cancelled
                var canCancel = eventActionManager.canCancel(event);
                //then action is prohibited
                expect(canCancel).toBe(false);
            });

            it('should not allow to cancel new event', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and new/not existing event in open state
                var event = {
                    id: undefined,
                    start: Date.today().add(1).days(),
                    doctor: {id: currentUserId},
                    patient: {id: currentUserId}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether event can be cancelled
                var canCancel = eventActionManager.canCancel(event);
                //then action is prohibited
                expect(canCancel).toBe(false);
            });

            it('should not allow to cancel event in CLOSED state for event\'s participants', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in closed state
                var event = {
                    id: 'event-123',
                    start: new Date().set({
                        day: 1,
                        month: 1,
                        year: 2014
                    }),
                    doctor: {id: currentUserId},
                    patient: {id: currentUserId}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.CLOSED);
                //when checking whether event can be cancelled
                var canCancel = eventActionManager.canCancel(event);
                //then action is denied
                expect(canCancel).toBe(false);
            });

            it('should not allow to cancel event in CANCELLED state for event\'s participants', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event is cancelled already
                var event = {
                    id: 'event-123',
                    cancelled: Date.today(),
                    start: Date.today(),
                    doctor: {id: currentUserId},
                    patient: {id: currentUserId}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.CANCELLED);
                //when checking whether event can be cancelled
                var canCancel = eventActionManager.canCancel(event);
                //then action is denied
                expect(canCancel).toBe(false);
            });

            it('should prevent cancellation in case of errors', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in open state
                var event = {
                    id: 'event-123',
                    start: Date.today().add(1).days()
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether invalid event can be cancelled
                var canCancel = eventActionManager.canCancel(event);
                //then action is prohibited
                expect(canCancel).toBe(false);
            });

        });


        describe('event edition-spec:', function () {

            it('should allow doctor to edit event in OPEN state', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in open state
                var event = {
                    id: 'event-123',
                    start: Date.today().add(1).days(),
                    doctor: {id: currentUserId},
                    patient: {id: 'diff-user-123'}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether event can be edited
                var canEdit = eventActionManager.canEdit(event);
                //then action is allowed
                expect(canEdit).toBe(true);
            });

            it('should not allow patient to edit existing event in OPEN state', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in open state
                var event = {
                    id: 'event-123',
                    start: Date.today().add(1).days(),
                    doctor: {id: 'diff-user-123'},
                    patient: {id: currentUserId}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether event can be edited
                var canEdited = eventActionManager.canEdit(event);
                //then action is prohibited
                expect(canEdited).toBe(false);
            });

            it('should allow everybody to edit new event', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in open state
                var event = {
                    start: Date.today().add(1).days(),
                    doctor: {id: 'diff-user-123'},
                    patient: {id: 'diff-user-123'}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether event can be edited
                var canEdited = eventActionManager.canEdit(event);
                //then action is allowed
                expect(canEdited).toBe(true);
            });

            it('should not allow doctor to edit event in CLOSED state', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in closed state
                var event = {
                    id: 'event-123',
                    start: Date.today(),
                    doctor: {id: currentUserId},
                    patient: {id: 'diff-user-123'}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.CLOSED);
                //when checking whether event can be edited
                var canEdit = eventActionManager.canEdit(event);
                //then action is prohibited
                expect(canEdit).toBe(false);
            });

            it('should not allow doctor to edit event in CANCELLED state', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in cancelled state
                var event = {
                    id: 'event-123',
                    start: Date.today(),
                    cancelled: Date.today(),
                    doctor: {id: currentUserId},
                    patient: {id: 'diff-user-123'}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.CANCELLED);
                //when checking whether event can be edited
                var canEdit = eventActionManager.canEdit(event);
                //then action is prohibited
                expect(canEdit).toBe(false);
            });

            it('should prevent edition in case of errors', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in cancelled state
                var event = {
                    id: 'event-123',
                    start: Date.today()
                };
                //when checking whether invalid event can be edited
                var canEdit = eventActionManager.canEdit(event);
                //then action is prohibited
                expect(canEdit).toBe(false);
            });

        });

    });


});