'use strict';

describe('chronos-calendar-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos.calendar'));

    describe('CalendarRenderer-spec:', function () {

        var renderer;

        beforeEach(inject(function ($injector) {
            renderer = $injector.get('CalendarRenderer');
            expect(renderer).toBeDefined();
        }));

        it('should create time line for event', function () {
            //given no events are attached yet
            //when attaching first event
            var event = { start: Date.today().set({
                hour: 8,
                minute: 0
            }) };
            renderer.attach(event);
            //then event is attach to new time line
            expect(event.timeline).toBe(0);
            expect(event.overlap.value).toBe(1);
        });

        it('should attach overlapping event to next time line', function () {
            //given first event takes one hour
            var event1 = { start: Date.today().set({
                hour: 8,
                minute: 0
            }), end: Date.today().set({
                hour: 9,
                minute: 0
            })};
            renderer.attach(event1);
            expect(event1.timeline).toBe(0);
            expect(event1.overlap.value).toBe(1);
            //when attaching new event that's overlapping previous event
            var event2 = { start: Date.today().set({
                hour: 8,
                minute: 15
            }), end: Date.today().set({
                hour: 8,
                minute: 45
            })};
            renderer.attach(event2);
            //then event is attached to new time line
            expect(event2.timeline).toBe(1);
            //and overlapping index is updated
            expect(event2.overlap.value).toBe(2);
            expect(event1.overlap.value).toBe(2);
            //and time line of previous event is not changed
            expect(event1.timeline).toBe(0);
        });

        it('should attach overlapping event to existing time line', function () {
            //given first starts at 8 and end at 9
            var event1 = { start: Date.today().set({
                hour: 8,
                minute: 0
            }), end: Date.today().set({
                hour: 9,
                minute: 0
            })};
            renderer.attach(event1);
            expect(event1.timeline).toBe(0);
            expect(event1.overlap.value).toBe(1);
            //and next event that starts 8 but ends 8:30
            var event2 = { start: Date.today().set({
                hour: 8,
                minute: 0
            }), end: Date.today().set({
                hour: 8,
                minute: 30
            })};
            renderer.attach(event2);
            expect(event2.timeline).toBe(1);
            expect(event2.overlap.value).toBe(2);
            //when attaching new event that starts after 8:30
            var event3 = { start: Date.today().set({
                hour: 8,
                minute: 45
            }), end: Date.today().set({
                hour: 9,
                minute: 15
            })};
            renderer.attach(event3);
            //then event is attached to second time line
            expect(event3.timeline).toBe(1);
            //and overlapping index is updated
            expect(event3.overlap.value).toBe(3);
            expect(event2.overlap.value).toBe(3);
            expect(event1.overlap.value).toBe(3);
            //and time lines of previous events are not changed
            expect(event1.timeline).toBe(0);
            expect(event2.timeline).toBe(1);
        });

        it('should dispatch events to keep time lines even', function () {
            //given first starts at 8 and end at 9
            var event1 = { start: Date.today().set({
                hour: 8,
                minute: 0
            }), end: Date.today().set({
                hour: 9,
                minute: 0
            })};
            renderer.attach(event1);
            expect(event1.timeline).toBe(0);
            expect(event1.overlap.value).toBe(1);
            //and next event that starts 8 but ends 8:30
            var event2 = { start: Date.today().set({
                hour: 8,
                minute: 0
            }), end: Date.today().set({
                hour: 8,
                minute: 30
            })};
            renderer.attach(event2);
            expect(event2.timeline).toBe(1);
            expect(event2.overlap.value).toBe(2);
            //and next event that starts at 8:45 and ends 9:15
            var event3 = { start: Date.today().set({
                hour: 8,
                minute: 45
            }), end: Date.today().set({
                hour: 9,
                minute: 15
            })};
            renderer.attach(event3);
            expect(event3.timeline).toBe(1);
            expect(event3.overlap.value).toBe(3);
            //when attaching new event that starts at 9 and ends 9:15
            var event4 = { start: Date.today().set({
                hour: 9,
                minute: 0
            }), end: Date.today().set({
                hour: 9,
                minute: 15
            })};
            renderer.attach(event4);
            //then event is attached to first time line
            //in order to keep them even
            expect(event4.timeline).toBe(0);
            //and overlapping index is updated
            expect(event4.overlap.value).toBe(4);
            expect(event3.overlap.value).toBe(4);
            expect(event2.overlap.value).toBe(4);
            expect(event1.overlap.value).toBe(4);
            //and time lines of previous events are not changed
            expect(event1.timeline).toBe(0);
            expect(event2.timeline).toBe(1);
            expect(event3.timeline).toBe(1);
        });

        it('should clear time lines when new event starts after attached events', function () {
            //given first starts at 8 and end at 9
            var event1 = { start: Date.today().set({
                hour: 8,
                minute: 0
            }), end: Date.today().set({
                hour: 9,
                minute: 0
            })};
            renderer.attach(event1);
            expect(event1.timeline).toBe(0);
            expect(event1.overlap.value).toBe(1);
            //and next event that starts 8 but ends 8:30
            var event2 = { start: Date.today().set({
                hour: 8,
                minute: 0
            }), end: Date.today().set({
                hour: 8,
                minute: 30
            })};
            renderer.attach(event2);
            expect(event2.timeline).toBe(1);
            expect(event2.overlap.value).toBe(2);
            //and next event that starts at 8:45 and ends 9:15
            var event3 = { start: Date.today().set({
                hour: 8,
                minute: 45
            }), end: Date.today().set({
                hour: 9,
                minute: 15
            })};
            renderer.attach(event3);
            expect(event3.timeline).toBe(1);
            expect(event3.overlap.value).toBe(3);
            //when attaching new event that starts after all attached events
            var event4 = { start: Date.today().set({
                hour: 9,
                minute: 15
            }), end: Date.today().set({
                hour: 9,
                minute: 30
            })};
            renderer.attach(event4);
            //then event is attached to first time line
            expect(event4.timeline).toBe(0);
            //and overlapping index of new event is cleared
            expect(event4.overlap.value).toBe(1);
            //and old overlapping indexes remain untouched
            expect(event3.overlap.value).toBe(3);
            expect(event2.overlap.value).toBe(3);
            expect(event1.overlap.value).toBe(3);
            //and time lines of previous events are not changed
            expect(event1.timeline).toBe(0);
            expect(event2.timeline).toBe(1);
            expect(event3.timeline).toBe(1);
        });


    });

});