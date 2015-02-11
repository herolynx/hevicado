'use strict';

describe('calendar-weekly-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos'));

    describe('WeeklyCalendarCtrl-spec:', function () {

        var ctrlScope;
        var injectedCtrls;

        beforeEach(function () {
            toUTCDate = function (value) {
                return typeof value != 'string' ? value : Date.parse(value);
            };
            toLocalDate = function (value) {
                return typeof value == 'string' ? Date.parse(value) : new Date(value);
            };
        });

        //prepare controller for testing
        beforeEach(inject(function ($controller, $injector, _$rootScope_) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            //inject mocks
            injectedCtrls = [];
            $controller('WeeklyCalendarCtrl', {
                $scope: ctrlScope,
                CalendarRenderer: $injector.get('CalendarRenderer'),
                $controller: function (ctrlName, params) {
                    injectedCtrls.push(ctrlName);
                    params.$scope.init = function () {
                        //mock
                    };
                    params.$scope.days = [];
                    params.$scope.events = [];
                    params.$scope.quarterLength = 15;
                }
            });
        }));

        it('should initialize controller', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //then proper sub-controllers are injected
            expect(injectedCtrls).toEqual(['CalendarCtrl', 'CalendarEditorCtrl']);
        });

        describe('Events management:', function () {

            it('should attach event to calendar grid', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and sample event
                var event = {
                    start: Date.today().set({
                        year: 2015,
                        month: 2,
                        day: 11,
                        hour: 8,
                        minute: 0
                    }),
                    end: Date.today().set({
                        year: 2015,
                        month: 2,
                        day: 11,
                        hour: 9,
                        minute: 0
                    })
                };
                //when attaching event to calendar
                ctrlScope.attachEvent(event);
                //then event is attached to proper place of a grid
                expect(ctrlScope.events[11][8][0]).toEqual([event]);
            });

            it('should detach event from calendar grid', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and sample event attached to calendar already
                var event = {
                    start: Date.today().set({
                        year: 2015,
                        month: 2,
                        day: 11,
                        hour: 8,
                        minute: 0
                    }),
                    end: Date.today().set({
                        year: 2015,
                        month: 2,
                        day: 11,
                        hour: 9,
                        minute: 0
                    })
                };
                ctrlScope.attachEvent(event);
                expect(ctrlScope.events[11][8][0]).toEqual([event]);
                //when detaching event from calendar
                ctrlScope.detachEvent(event);
                //then event is detached
                expect(ctrlScope.events[11][8][0]).toEqual([]);
            });

            it('should display all events on calendar', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and sample events
                var events = [
                    {
                        start: Date.today().set({
                            year: 2015,
                            month: 2,
                            day: 11,
                            hour: 8,
                            minute: 0
                        }),
                        end: Date.today().set({
                            year: 2015,
                            month: 2,
                            day: 11,
                            hour: 9,
                            minute: 0
                        }),
                        duration: 60
                    },
                    {
                        start: Date.today().set({
                            year: 2015,
                            month: 2,
                            day: 11,
                            hour: 8,
                            minute: 0
                        }),
                        end: Date.today().set({
                            year: 2015,
                            month: 2,
                            day: 11,
                            hour: 8,
                            minute: 30
                        }),
                        duration: 45
                    }
                ];
                ctrlScope.days = [Date.today().set({
                    year: 2015,
                    month: 2,
                    day: 11,
                    hour: 8,
                    minute: 0
                })];

                //when attaching all events to calendar
                ctrlScope.onEventsLoad(events);

                //then events are attached to calendar
                expect(ctrlScope.events[11][8][0].length).toBe(2);
                //and events will be displayed in proper place
                expect(ctrlScope.events[11][8][0][0].timeline).toBe(0);
                expect(ctrlScope.events[11][8][0][0].quarter).toBe(4);
                expect(ctrlScope.events[11][8][0][0].overlap).toEqual({value: 2});

                expect(ctrlScope.events[11][8][0][1].timeline).toBe(1);
                expect(ctrlScope.events[11][8][0][1].quarter).toBe(3);
                expect(ctrlScope.events[11][8][0][1].overlap).toEqual({value: 2});
            });

            it('should get all events attached to calendar', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and sample events attached to calendar
                var events = [
                    {
                        start: Date.today().set({
                            year: 2015,
                            month: 2,
                            day: 11,
                            hour: 8,
                            minute: 0
                        }),
                        end: Date.today().set({
                            year: 2015,
                            month: 2,
                            day: 11,
                            hour: 9,
                            minute: 0
                        }),
                        duration: 60
                    },
                    {
                        start: Date.today().set({
                            year: 2015,
                            month: 2,
                            day: 11,
                            hour: 8,
                            minute: 0
                        }),
                        end: Date.today().set({
                            year: 2015,
                            month: 2,
                            day: 11,
                            hour: 8,
                            minute: 30
                        }),
                        duration: 45
                    }
                ];
                ctrlScope.days = [Date.today().set({
                    year: 2015,
                    month: 2,
                    day: 11,
                    hour: 8,
                    minute: 0
                })];
                ctrlScope.onEventsLoad(events);

                //when attaching all events to calendar
                var allEvents = ctrlScope.flatten(ctrlScope.events);

                //then all events are returned
                expect(allEvents.length).toBe(2);
            });

        });

    });

});