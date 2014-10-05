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

});