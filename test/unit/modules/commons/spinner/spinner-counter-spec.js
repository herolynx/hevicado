'use strict';

describe('spinner-counter-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('commons.spinner'));

    describe('SpinnerCounter-spec:', function () {

        var counter;
        var spinnerEvents;

        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            spinnerEvents = {COUNTER_CHANGED: 'mock-counter-changed'};
            $provide.value('SPINNER_EVENTS', spinnerEvents);
        }));

        beforeEach(inject(function ($injector, _$rootScope_, _$compile_) {
            counter = $injector.get('SpinnerCounter');
        }));

        it('should show that operation is in progress', function () {
            //given counter is initialized
            expect(counter).toBeDefined();
            //when operation is started
            counter.increment();
            //then status is shown as in-progress
            expect(counter.inProgress()).toBe(true);
        });

        it('should show that all operations are done', function () {
            //given counter is initialized
            expect(counter).toBeDefined();
            //and on-going operation
            counter.increment();
            expect(counter.inProgress()).toBe(true);
            //when operation is finished
            counter.decrement();
            //then status is shown as done
            expect(counter.inProgress()).toBe(false);
        });

    });

});