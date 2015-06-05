'use strict';

describe('http-progress-watcher-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('commons.spinner'));

    describe('HttpProgressWatcher-spec:', function () {

        var watcher;
        var mockCounter, mockQ;

        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockCounter = jasmine.createSpyObj('SpinnerCounter', ['increment', 'decrement']);
            $provide.value('SpinnerCounter', mockCounter);
            mockQ = {
                reject: function () {
                    mockQ.rejected = true;
                }
            };
            $provide.value('$q', mockQ);
        }));

        beforeEach(inject(function ($injector) {
            watcher = $injector.get('HttpProgressWatcher');
        }));

        it('should increment counter when HTTP request is sent', function () {
            //given watcher is active
            expect(watcher).toBeDefined();
            //when request is sent
            watcher.request();
            //then operation is marked as started
            expect(mockCounter.increment).toHaveBeenCalled();
        });

        it('should decrement counter when HTTP response is received', function () {
            //given watcher is active
            expect(watcher).toBeDefined();
            //when response is received
            watcher.response();
            //then operation is marked as completed
            expect(mockCounter.decrement).toHaveBeenCalled();
        });

        it('should decrement counter when HTTP response failure is received', function () {
            //given watcher is active
            expect(watcher).toBeDefined();
            //when response is received
            watcher.responseError();
            //then operation is marked as completed
            expect(mockCounter.decrement).toHaveBeenCalled();
            //and operation is rejected
            expect(mockQ.rejected).toBe(true);
        });

        it('should decrement counter when HTTP request failure is received', function () {
            //given watcher is active
            expect(watcher).toBeDefined();
            //when response is received
            watcher.requestError();
            //then operation is marked as completed
            expect(mockCounter.decrement).toHaveBeenCalled();
            //and operation is rejected
            expect(mockQ.rejected).toBe(true);
        });


    });

});