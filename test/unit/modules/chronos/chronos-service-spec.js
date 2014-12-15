'use strict';

describe('chronos-service-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos'));

    describe('CalendarService-spec:', function () {

        var mockHttp, mockSession;
        var calendarService, userId;

        //prepare service for testing
        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockHttp = jasmine.createSpyObj('$http', ['get', 'post', 'put']);
            $provide.value('$http', mockHttp);
            mockSession = jasmine.createSpyObj('Session', ['getUserId']);
            $provide.value('Session', mockSession);

        }));

        beforeEach(inject(function ($injector, $q) {
            //prepare calendar service
            calendarService = $injector.get('CalendarService');
            userId = 'user-123';
            calendarService.init(userId);
        }));

        it('should get user\'s events for doctors', function () {
            //given calendar service is initialized
            expect(calendarService).toBeDefined();
            //and time period
            var start = new Date().set({
                year: 2014,
                month: 7,
                day: 12,
                hour: 0,
                minute: 0,
                second: 0
            });
            var end = new Date().set({
                year: 2014,
                month: 7,
                day: 12,
                hour: 23,
                minute: 59,
                second: 0
            });
            //when getting events from chosen time period
            var promise = calendarService.events(start, end);
            //then proper communication has place
            expect(promise).not.toBeNull();
            expect(mockHttp.get).toHaveBeenCalledWith('/calendar/' + userId + '/visit', {
                params: {
                    start: '2014-08-12 00:00:00',
                    end: '2014-08-12 23:59:00',
                    asDoctor: true
                }
            });
        });

        it('should get user\'s events for patients', function () {
            //given calendar service is initialized
            expect(calendarService).toBeDefined();
            //and time period
            var start = new Date().set({
                year: 2014,
                month: 7,
                day: 12,
                hour: 0,
                minute: 0,
                second: 0
            });
            var end = new Date().set({
                year: 2014,
                month: 7,
                day: 12,
                hour: 23,
                minute: 59,
                second: 0
            });
            //when getting events from chosen time period
            var promise = calendarService.events(start, end, false);
            //then proper communication has place
            expect(promise).not.toBeNull();
            expect(mockHttp.get).toHaveBeenCalledWith('/calendar/' + userId + '/visit', {
                params: {
                    start: '2014-08-12 00:00:00',
                    end: '2014-08-12 23:59:00',
                    asDoctor: false
                }
            });
        });

        it('should cancel event', function () {
            //given calendar service is initialized
            expect(calendarService).toBeDefined();
            //and sample event
            var event = {
                id: 'event-123'
            };
            //when cancelling event
            var promise = calendarService.cancel(event);
            //then proper communication has place
            expect(promise).not.toBeNull();
            expect(mockHttp.put).toHaveBeenCalled();
            expect(mockHttp.put.mostRecentCall.args[0]).toBe('/calendar/visit');
            expect(mockHttp.put.mostRecentCall.args[1].id).toBe(event.id);
            expect(mockHttp.put.mostRecentCall.args[1].cancelled).not.toBeNull();
        });

        it('should create event', function () {
            //given calendar service is initialized
            expect(calendarService).toBeDefined();
            //and sample event
            var event = {
                title: "sample event"
            };
            //when saving event without ID
            var promise = calendarService.save(event);
            //then event is created
            expect(promise).not.toBeNull();
            expect(mockHttp.post).toHaveBeenCalledWith('/calendar/visit', event);
        });

        it('should update event', function () {
            //given calendar service is initialized
            expect(calendarService).toBeDefined();
            //and sample event
            var event = {
                id: "event-123",
                title: "sample event"
            };
            //when saving event with ID
            var promise = calendarService.save(event);
            //then event is edited
            expect(promise).not.toBeNull();
            expect(mockHttp.put).toHaveBeenCalledWith('/calendar/visit', event);
        });

        it('should convert event values to plain JSON during save and update', function () {
            //given calendar service is initialized
            expect(calendarService).toBeDefined();
            //and sample event
            var event = {
                title: "sample event",
                start: Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 5,
                    hour: 13,
                    minute: 30,
                    second: 0
                }),
                end: Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 5,
                    hour: 14,
                    minute: 0,
                    second: 0
                }),
                cancelled: Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 2,
                    hour: 9,
                    minute: 45,
                    second: 23
                })
            };
            //when saving or updating event
            var promise = calendarService.save(event);
            //then event fields are converted to plain JSON
            expect(promise).not.toBeNull();
            expect(mockHttp.post).toHaveBeenCalledWith('/calendar/visit', {
                    title: 'sample event',
                    start: '2014-12-05 13:30:00',
                    end: '2014-12-05 14:00:00',
                    cancelled: '2014-12-02 09:45:23'
                }
            );
        });

    });

});