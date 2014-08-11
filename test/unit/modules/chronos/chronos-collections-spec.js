'use strict';

describe('events-map-spec:', function () {

    var eventsMap;

    //prepare module for testing
    beforeEach(angular.mock.module('chronos.collections'));

    beforeEach(inject(function ($injector) {
        eventsMap = $injector.get('EventsMap');
    }));

    describe('adding events', function () {

        it('should add single day event to single day entry', function () {
            //given event is defined for single day
            var event = {
                title: "Sample event",
                start: new Date().set({year: 2014, month: 7, day: 12, hour: 8, minute: 0}),
                end: new Date().set({year: 2014, month: 7, day: 12, hour: 12, minute: 0})
            };
            //when event is added to map
            var days = eventsMap.add(event);
            //then event is stored in single day entry
            expect(days).not.toBeNull();
            expect(days.length).toBe(1);
            expect(eventsMap.size()).toBe(1);
            //and key has proper format
            expect(days[0].toString('dd-MM-yyyy HH:mm')).toBe("12-08-2014 00:00");
            //and added event can be reached using key
            var key12 = Date.today().set({year: 2014, month: 7, day: 12});
            expect(eventsMap.contains(days[0])).toBeTruthy();
            expect(eventsMap.contains(key12)).toBeTruthy();
            var dayEvents = eventsMap.events(key12);
            expect(dayEvents).not.toBeNull();
            expect(dayEvents.length).toBe(1);
            expect(dayEvents[0].title).toBe("Sample event");
        });

        it('should add two day event to two day entries', function () {
            //given event is defined for two days
            var event = {
                title: "Sample event",
                start: new Date().set({year: 2014, month: 7, day: 12, hour: 8, minute: 0}),
                end: new Date().set({year: 2014, month: 7, day: 13, hour: 8, minute: 0})
            };
            //when event is added to map
            var days = eventsMap.add(event);
            //then event is stored in two day entries
            expect(days).not.toBeNull();
            expect(days.length).toBe(2);
            expect(eventsMap.size()).toBe(2);
            //and keys have proper format
            expect(days[0].toString('dd-MM-yyyy HH:mm')).toBe("12-08-2014 00:00");
            expect(days[1].toString('dd-MM-yyyy HH:mm')).toBe("13-08-2014 00:00");
            //and added event can be reached using first key
            var key12 = Date.today().set({year: 2014, month: 7, day: 12});
            expect(eventsMap.contains(days[0])).toBeTruthy();
            expect(eventsMap.contains(key12)).toBeTruthy();
            var eventKey12 = eventsMap.events(key12);
            expect(eventKey12).not.toBeNull();
            expect(eventKey12.length).toBe(1);
            expect(eventKey12[0].title).toBe("Sample event");
            //and added event can be reached using second key
            var key13 = Date.today().set({year: 2014, month: 7, day: 13});
            expect(eventsMap.contains(days[1])).toBeTruthy();
            expect(eventsMap.contains(key13)).toBeTruthy();
            var eventKey13 = eventsMap.events(key13);
            expect(eventKey13).not.toBeNull();
            expect(eventKey13.length).toBe(1);
            expect(eventKey13[0].title).toBe("Sample event");
        });

        it('should add two events to single day entry', function () {
            //given two events are defined
            var event1 = {
                title: "Sample event1",
                start: new Date().set({year: 2014, month: 7, day: 12, hour: 8, minute: 0}),
                end: new Date().set({year: 2014, month: 7, day: 12, hour: 12, minute: 0})
            };
            var event2 = {
                title: "Sample event2",
                start: new Date().set({year: 2014, month: 7, day: 12, hour: 12, minute: 30}),
                end: new Date().set({year: 2014, month: 7, day: 12, hour: 13, minute: 0})
            };
            //when events are added to collection
            eventsMap.add(event1);
            eventsMap.add(event2);
            //then events are stored in single day entry
            expect(eventsMap.size()).toBe(1);
            var key12 = Date.today().set({year: 2014, month: 7, day: 12});
            expect(eventsMap.contains(key12)).toBeTruthy();
            //and events can be reached using key
            var eventKey12 = eventsMap.events(key12);
            expect(eventKey12).not.toBeNull();
            expect(eventKey12.length).toBe(2);
            //and events contains proper data
            expect(eventKey12[0].title).toBe("Sample event1");
            expect(eventKey12[1].title).toBe("Sample event2");
        });

        it('should add all events to single day entry', function () {
            //given two events are defined
            var event1 = {
                title: "Sample event1",
                start: new Date().set({year: 2014, month: 7, day: 12, hour: 8, minute: 0}),
                end: new Date().set({year: 2014, month: 7, day: 12, hour: 12, minute: 0})
            };
            var event2 = {
                title: "Sample event2",
                start: new Date().set({year: 2014, month: 7, day: 12, hour: 12, minute: 30}),
                end: new Date().set({year: 2014, month: 7, day: 12, hour: 13, minute: 0})
            };
            //when all events are added to collection
            eventsMap.addAll([event1, event2]);
            //then events are stored in single day entry
            expect(eventsMap.size()).toBe(1);
            var key12 = Date.today().set({year: 2014, month: 7, day: 12});
            expect(eventsMap.contains(key12)).toBeTruthy();
            //and events can be reached using key
            var eventKey12 = eventsMap.events(key12);
            expect(eventKey12).not.toBeNull();
            expect(eventKey12.length).toBe(2);
            //and events contains proper data
            expect(eventKey12[0].title).toBe("Sample event1");
            expect(eventKey12[1].title).toBe("Sample event2");
        });

        it('should add over-lapping day events to single day entry', function () {
            //given two over-lapping events are defined
            var event1 = {
                title: "Sample event1",
                start: new Date().set({year: 2014, month: 7, day: 12, hour: 8, minute: 0}),
                end: new Date().set({year: 2014, month: 7, day: 12, hour: 12, minute: 0})
            };
            var event2 = {
                title: "Sample event2",
                start: new Date().set({year: 2014, month: 7, day: 12, hour: 8, minute: 0}),
                end: new Date().set({year: 2014, month: 7, day: 12, hour: 12, minute: 0})
            };
            //when events are added to collection
            eventsMap.addAll([event1, event2]);
            //then events are stored in single day entry
            expect(eventsMap.size()).toBe(1);
            var key12 = Date.today().set({year: 2014, month: 7, day: 12});
            expect(eventsMap.contains(key12)).toBeTruthy();
            //and events can be reached using key
            var eventKey12 = eventsMap.events(key12);
            expect(eventKey12).not.toBeNull();
            expect(eventKey12.length).toBe(2);
            //and events contains proper data
            expect(eventKey12[0].title).toBe("Sample event1");
            expect(eventKey12[1].title).toBe("Sample event2");
        });

    });

    describe('filtering events', function () {

        it('should filter events by time period', function () {
            //given events are defined
            var event1 = {
                title: "Sample event1",
                start: new Date().set({year: 2014, month: 7, day: 12, hour: 8, minute: 0}),
                end: new Date().set({year: 2014, month: 7, day: 12, hour: 9, minute: 0})
            };
            var event2 = {
                title: "Sample event2",
                start: new Date().set({year: 2014, month: 7, day: 12, hour: 8, minute: 0}),
                end: new Date().set({year: 2014, month: 7, day: 12, hour: 8, minute: 30})
            };
            var event3 = {
                title: "Sample event3",
                start: new Date().set({year: 2014, month: 7, day: 12, hour: 9, minute: 0}),
                end: new Date().set({year: 2014, month: 7, day: 12, hour: 12, minute: 0})
            };
            var event4 = {
                title: "Sample event4",
                start: new Date().set({year: 2014, month: 7, day: 12, hour: 9, minute: 0}),
                end: new Date().set({year: 2014, month: 7, day: 12, hour: 10, minute: 0})
            };
            var event5 = {
                title: "Sample event5",
                start: new Date().set({year: 2014, month: 7, day: 13, hour: 9, minute: 0}),
                end: new Date().set({year: 2014, month: 7, day: 13, hour: 12, minute: 0})
            };
            eventsMap.addAll([event1, event2, event3, event4, event5]);
            //and start hour filter
            var startFrom = new Date().set({year: 2014, month: 7, day: 12, hour: 8, minute: 0});
            var filterByStartDate = function (event) {
                return (startFrom.equals(event.start) || startFrom.isAfter(event.start))
                    && (startFrom.isBefore(event.end));
            };
            //when events are filtered
            var filtered = eventsMap.filter(filterByStartDate);
            //then single day entry is returned
            expect(filtered).not.toBeNull();
            var keys = Object.keys(filtered);
            expect(keys.length).toBe(1);
            //and day contains proper events
            var events = filtered[keys[0]];
            expect(events).not.toBeNull();
            expect(events.length).toBe(2);
            expect(events[0].title).toBe("Sample event1");
            expect(events[1].title).toBe("Sample event2");
        });
    });

});