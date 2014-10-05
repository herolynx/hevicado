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

        it('should return OPEN state for non-cancelled event in the future', function () {
            //given event utils are initialized
            expect(eventUtils).toBeDefined();
            //and future event that hasn't been cancelled
            event = {
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
            event = {
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
            event = {
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
            event = {
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

    describe('EventActionManager-spec:', function () {
        var mockEventStates;
        var eventActionManager, eventUtils;

        //prepare service for testing
        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockEventStates = jasmine.createSpyObj('EVENT_STATE', ['OPEN', 'CLOSED', 'CANCELLED']);
            mockEventStates.OPEN.key = 0;
            mockEventStates.CLOSED.key = 1;
            mockEventStates.CANCELLED.key = 2;
            $provide.value('EVENT_STATE', mockEventStates);

        }));

        beforeEach(inject(function ($injector) {
            eventActionManager = $injector.get('EventActionManager');
            eventUtils = $injector.get('EventUtils');
        }));

        it('should allow cancel event in OPEN state', function () {
            //given action manager is initialized
            expect(eventActionManager).toBeDefined();
            //and event in open state
            event = {
                cancelled: null,
                start: Date.today().add(1).days()
            };
            expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
            //when checking whether event can be cancelled
            var canCancel = eventActionManager.canCancel(event);
            //then action is allowed
            expect(canCancel).toBe(true);
        });

        it('should not allow cancel event in CLOSED state', function () {
            //given action manager is initialized
            expect(eventActionManager).toBeDefined();
            //and event in closed state
            event = {
                cancelled: null,
                start: new Date().set({
                    day: 1,
                    month: 1,
                    year: 2014
                })
            };
            expect(eventUtils.state(event)).toBe(mockEventStates.CLOSED);
            //when checking whether event can be cancelled
            var canCancel = eventActionManager.canCancel(event);
            //then action is denied
            expect(canCancel).toBe(false);
        });

        it('should not allow cancel event in CANCELLED state', function () {
            //given action manager is initialized
            expect(eventActionManager).toBeDefined();
            //and event is cancelled already
            event = {
                cancelled: Date.today(),
                start: Date.today()
            };
            expect(eventUtils.state(event)).toBe(mockEventStates.CANCELLED);
            //when checking whether event can be cancelled
            var canCancel = eventActionManager.canCancel(event);
            //then action is denied
            expect(canCancel).toBe(false);
        });
    });

});