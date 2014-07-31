'use strict';

describe('events-map-spec:', function () {

    var eventsMap;

    //prepare module for testing
    beforeEach(angular.mock.module('chronos.collections'));

    beforeEach(inject(function ($injector) {
        eventsMap = $injector.get('EventsMap');
    }));

    describe('events modification', function () {

        it('should store single day event in single day entry', function () {
            //given event is defined for single day
            var event = {
                start: Date.today().set({hour: 8, minute: 0}),
                end: Date.today().set({hour: 12, minute: 0})
            };
            //when event is added to map
//            var days = eventsMap.add(event);
            //then event is stored in single day entry
//            expect(days).not.toBeNull();
//            expect(days.length).toBe(1);
            //and key has proper format
        });

    });

})
;