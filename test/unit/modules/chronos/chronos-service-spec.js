'use strict';

describe('chronos-service-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos.services'));

    describe('CalendarService-spec:', function () {

        var mockHttp;
        var calendarService, userId;

        //prepare service for testing
        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockHttp = jasmine.createSpyObj('$http', ['get', 'post', 'put', 'delete']);
            $provide.value('$http', mockHttp);
        }));

        beforeEach(inject(function ($injector, $q) {
            //prepare calendar service
            calendarService = $injector.get('CalendarService');
            userId = 'user-123';
            calendarService.init(userId);
        }));

        it('should get user\'s events', function () {
            //given calendar service is initialized
            expect(calendarService).toBeDefined();
            //and time period
            var start = new Date().set({
                year: 2014,
                month: 7,
                day: 12,
                hour: 0,
                minute: 0
            });
            var end = new Date().set({
                year: 2014,
                month: 7,
                day: 12,
                hour: 23,
                minute: 59
            });
            //when getting events from chosen time period
            var promise = calendarService.events(start, end);
            //then proper communication has place
            expect(promise).not.toBeNull();
            expect(mockHttp.get).toHaveBeenCalledWith('/calendar/events/search', {
                start: start,
                end: end,
                userId: userId
            });
        });

        it('should get options for editing events', function () {
            //given calendar service is initialized
            expect(calendarService).toBeDefined();
            //and date when edited event will take place
            var date = new Date().set({
                year: 2014,
                month: 7,
                day: 12,
                hour: 12,
                minute: 30
            });
            //when getting available options for edited event
            var promise = calendarService.options(date);
            //then proper communication has place
            expect(promise).not.toBeNull();
            expect(mockHttp.get).toHaveBeenCalledWith('/calendar/options', {
                userId: userId,
                date: date
            });
        });

        it('should delete event', function () {
            //given calendar service is initialized
            expect(calendarService).toBeDefined();
            //and event exists
            var eventId = 'event-123';
            //when deleting event
            var promise = calendarService.delete(eventId);
            //then proper communication has place
            expect(promise).not.toBeNull();
            expect(mockHttp.delete).toHaveBeenCalledWith('/calendar/events/delete', {
                id: eventId
            });
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
            expect(mockHttp.post).toHaveBeenCalledWith('/calendar/events/save', {
                event: event
            });
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
            expect(mockHttp.put).toHaveBeenCalledWith('/calendar/events/save', {
                event: event
            });
        });

    });

});