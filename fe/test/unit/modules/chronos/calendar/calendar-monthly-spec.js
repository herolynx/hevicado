'use strict';

describe('calendar-monthly-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos'));

    describe('MonthlyCalendarCtrl-spec:', function () {

        var ctrlScope;
        var injectedCtrls;
        var locPulsantis, locLuxMed;

        beforeEach(function () {
            toUTCDate = function (value) {
                return typeof value != 'string' ? value : Date.parse(value);
            };
            toLocalDate = function (value) {
                return typeof value == 'string' ? Date.parse(value) : new Date(value);
            };
            locPulsantis = {
                id: "loc-1",
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
            };
            locLuxMed = {
                id: "loc-2",
                name: "LuxMed",
                address: {
                    street: "Grabiszynska 8/4",
                    city: "Wroclaw",
                    country: "Poland"
                },
                color: "blue",
                working_hours: [
                    {
                        day: "Wendesday",
                        start: "08:00",
                        end: "10:00",
                        tzOffset: 0
                    }
                ]
            };
        });

        //prepare controller for testing
        beforeEach(inject(function ($controller, _$rootScope_) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            //inject mocks
            injectedCtrls = [];
            $controller('MonthlyCalendarCtrl', {
                $scope: ctrlScope,
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
            expect(injectedCtrls).toEqual(['CalendarCtrl']);
        });

        describe('Events management:', function () {

            it('should summarize about events per day and location', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and displayed days
                ctrlScope.days = [
                    Date.today().set({
                        year: 2015,
                        month: 2,
                        day: 10
                    }),
                    Date.today().set({
                        year: 2015,
                        month: 2,
                        day: 11
                    }),
                    Date.today().set({
                        year: 2015,
                        month: 2,
                        day: 12
                    })
                ];
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
                        duration: 60,
                        location: locPulsantis

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
                        duration: 45,
                        location: locPulsantis
                    },
                    {
                        start: Date.today().set({
                            year: 2015,
                            month: 2,
                            day: 11,
                            hour: 18,
                            minute: 0
                        }),
                        end: Date.today().set({
                            year: 2015,
                            month: 2,
                            day: 11,
                            hour: 19,
                            minute: 30
                        }),
                        duration: 60,
                        location: locLuxMed
                    }
                ];
                //when attaching all events to calendar
                ctrlScope.onEventsLoad(events);

                //then info about events is summarized
                expect(ctrlScope.events[11 + '-' + 2]).toEqual([
                    {
                        name: 'Pulsantis',
                        color: 'red',
                        value: 2
                    },
                    {
                        name: 'LuxMed',
                        color: 'blue',
                        value: 1
                    }
                ]);
                //and days without events have default info
                expect(ctrlScope.events[10 + '-' + 2]).toEqual([
                    {
                        name: '',
                        color: '',
                        value: 0
                    }
                ]);
                expect(ctrlScope.events[12 + '-' + 2]).toEqual([
                    {
                        name: '',
                        color: '',
                        value: 0
                    }
                ]);
                //and not displayed days are not initialized
                expect(ctrlScope.events[9 + '-' + 2]).not.toBeDefined();
                expect(ctrlScope.events[13 + '-' + 2]).not.toBeDefined();
            });

        });

    });

});