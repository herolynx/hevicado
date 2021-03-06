'use strict';

describe('event-util-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos.commons'));

    beforeEach(function () {
        toUTCDate = function (value) {
            return typeof value != 'string' ? value : Date.parse(value);
        };
        toLocalDate = function (value) {
            return typeof value == 'string' ? Date.parse(value) : new Date(value);
        };
        toTZDate = function (date, tzOffset) {
            return date;
        };
    });

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

            it('should mark events with time windows occupied by other users', function () {
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
                //then proper color is set
                expect(event.location).toEqual({color: 'red'});
            });

        });

        describe('to plain JSON normalization-spec:', function () {

            it('should add time zone offset', function () {
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
                //then time zone offset is added
                expect(event.tzOffset).toBeDefined();
                expect(event.tzOffset).not.toBeNull();
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

        describe('find location-spec:', function () {

            var locations = [
                {
                    id: "546b8fd1ef680df8426005c2",
                    name: "Pulsantis",
                    address: {
                        street: "Grabiszynska 8/4",
                        city: "Wroclaw",
                        country: "Poland"
                    },
                    color: "red",
                    working_hours: [
                        {
                            day: "Monday",
                            start: "08:00",
                            end: "10:00",
                            tzOffset: 0
                        },
                        {
                            day: "Monday",
                            start: "12:00",
                            end: "14:00",
                            tzOffset: 0
                        },
                        {
                            day: "Tuesday",
                            start: "08:00",
                            end: "16:00",
                            tzOffset: 0
                        }
                    ]
                }
            ];

            it('should find location if time is given in working hours', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and chosen time
                var time = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 9,
                    minute: 30
                });
                //when looking for locations in working hours
                var foundLoc = eventUtils.findLocation(locations, time);
                //then proper location is found
                expect(foundLoc).not.toBeNull();
                expect(foundLoc.name).toBe('Pulsantis');
            });

            it('should not find location outside of working hours', function () {
                //given event utils are initialized
                expect(eventUtils).toBeDefined();
                //and chosen time
                var time = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 11,
                    minute: 0
                });
                //when looking for locations outside of working hours
                var foundLoc = eventUtils.findLocation(locations, time);
                //then no location is found
                expect(foundLoc).toBeNull();
            });

        });

    });

});