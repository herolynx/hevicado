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
            var event = {
                start: Date.today().set({
                    hour: 8,
                    minute: 0
                })
            };
            renderer.attach(event);
            //then event is attach to new time line
            expect(event.timeline).toBe(0);
            expect(event.overlap.value).toBe(1);
        });

        it('should attach overlapping event to next time line', function () {
            //given first event takes one hour
            var event1 = {
                start: Date.today().set({
                    hour: 8,
                    minute: 0
                }),
                end: Date.today().set({
                    hour: 9,
                    minute: 0
                }),
                duration: 60
            };
            renderer.attach(event1);
            expect(event1.timeline).toBe(0);
            expect(event1.overlap.value).toBe(1);
            expect(event1.quarter).toBe(4);
            //when attaching new event that's overlapping previous event
            var event2 = {
                start: Date.today().set({
                    hour: 8,
                    minute: 15
                }),
                end: Date.today().set({
                    hour: 8,
                    minute: 45
                }),
                duration: 30
            };
            renderer.attach(event2);
            //then event is attached to new time line
            expect(event2.timeline).toBe(1);
            expect(event2.quarter).toBe(2);
            //and overlapping index is updated
            expect(event2.overlap.value).toBe(2);
            expect(event1.overlap.value).toBe(2);
            //and time line of previous event is not changed
            expect(event1.timeline).toBe(0);
        });

        it('should attach overlapping event to existing time line', function () {
            //given first starts at 8 and end at 9
            var event1 = {
                start: Date.today().set({
                    hour: 8,
                    minute: 0
                }),
                end: Date.today().set({
                    hour: 9,
                    minute: 0
                })
            };
            renderer.attach(event1);
            expect(event1.timeline).toBe(0);
            expect(event1.overlap.value).toBe(1);
            //and next event that starts 8 but ends 8:30
            var event2 = {
                start: Date.today().set({
                    hour: 8,
                    minute: 0
                }),
                end: Date.today().set({
                    hour: 8,
                    minute: 30
                })
            };
            renderer.attach(event2);
            expect(event2.timeline).toBe(1);
            expect(event2.overlap.value).toBe(2);
            //when attaching new event that starts after 8:30
            var event3 = {
                start: Date.today().set({
                    hour: 8,
                    minute: 45
                }),
                end: Date.today().set({
                    hour: 9,
                    minute: 15
                })
            };
            renderer.attach(event3);
            //then event is attached to second time line
            expect(event3.timeline).toBe(1);
            //and overlapping index is updated
            expect(event3.overlap.value).toBe(2);
            expect(event2.overlap.value).toBe(2);
            expect(event1.overlap.value).toBe(2);
            //and time lines of previous events are not changed
            expect(event1.timeline).toBe(0);
            expect(event2.timeline).toBe(1);
        });

        it('should dispatch events to keep time lines even', function () {
            //given first starts at 8 and end at 9
            var event1 = {
                start: Date.today().set({
                    hour: 8,
                    minute: 0
                }),
                end: Date.today().set({
                    hour: 9,
                    minute: 0
                })
            };
            renderer.attach(event1);
            expect(event1.timeline).toBe(0);
            expect(event1.overlap.value).toBe(1);
            //and next event that starts 8 but ends 8:30
            var event2 = {
                start: Date.today().set({
                    hour: 8,
                    minute: 0
                }),
                end: Date.today().set({
                    hour: 8,
                    minute: 30
                })
            };
            renderer.attach(event2);
            expect(event2.timeline).toBe(1);
            expect(event2.overlap.value).toBe(2);
            //and next event that starts at 8:45 and ends 9:15
            var event3 = {
                start: Date.today().set({
                    hour: 8,
                    minute: 45
                }),
                end: Date.today().set({
                    hour: 9,
                    minute: 15
                })
            };
            renderer.attach(event3);
            expect(event3.timeline).toBe(1);
            expect(event3.overlap.value).toBe(2);
            //when attaching new event that starts at 9 and ends 9:15
            var event4 = {
                start: Date.today().set({
                    hour: 9,
                    minute: 0
                }),
                end: Date.today().set({
                    hour: 9,
                    minute: 15
                })
            };
            renderer.attach(event4);
            //then event is attached to first time line
            //in order to keep them even
            expect(event4.timeline).toBe(0);
            //and overlapping index is updated
            expect(event4.overlap.value).toBe(2);
            expect(event3.overlap.value).toBe(2);
            expect(event2.overlap.value).toBe(2);
            expect(event1.overlap.value).toBe(2);
            //and time lines of previous events are not changed
            expect(event1.timeline).toBe(0);
            expect(event2.timeline).toBe(1);
            expect(event3.timeline).toBe(1);
        });

        it('should clear time lines when new event starts after attached events', function () {
            //given first starts at 8 and end at 9
            var event1 = {
                start: Date.today().set({
                    hour: 8,
                    minute: 0
                }),
                end: Date.today().set({
                    hour: 9,
                    minute: 0
                })
            };
            renderer.attach(event1);
            expect(event1.timeline).toBe(0);
            expect(event1.overlap.value).toBe(1);
            //and next event that starts 8 but ends 8:30
            var event2 = {
                start: Date.today().set({
                    hour: 8,
                    minute: 0
                }),
                end: Date.today().set({
                    hour: 8,
                    minute: 30
                })
            };
            renderer.attach(event2);
            expect(event2.timeline).toBe(1);
            expect(event2.overlap.value).toBe(2);
            //and next event that starts at 8:45 and ends 9:15
            var event3 = {
                start: Date.today().set({
                    hour: 8,
                    minute: 45
                }),
                end: Date.today().set({
                    hour: 9,
                    minute: 15
                })
            };
            renderer.attach(event3);
            expect(event3.timeline).toBe(1);
            expect(event3.overlap.value).toBe(2);
            //when attaching new event that starts after all attached events
            var event4 = {
                start: Date.today().set({
                    hour: 9,
                    minute: 15
                }),
                end: Date.today().set({
                    hour: 9,
                    minute: 30
                })
            };
            renderer.attach(event4);
            //then event is attached to first time line
            expect(event4.timeline).toBe(0);
            //and overlapping index of new event is cleared
            expect(event4.overlap.value).toBe(1);
            //and old overlapping indexes remain untouched
            expect(event3.overlap.value).toBe(2);
            expect(event2.overlap.value).toBe(2);
            expect(event1.overlap.value).toBe(2);
            //and time lines of previous events are not changed
            expect(event1.timeline).toBe(0);
            expect(event2.timeline).toBe(1);
            expect(event3.timeline).toBe(1);
        });

        it('should attach all events in proper order', function () {
            //given first starts at 8 and end at 9
            var event1 = {
                start: Date.today().set({
                    hour: 8,
                    minute: 0
                }),
                end: Date.today().set({
                    hour: 9,
                    minute: 0
                })
            };
            //and next event that starts 8 but ends 8:30
            var event2 = {
                start: Date.today().set({
                    hour: 8,
                    minute: 0
                }),
                end: Date.today().set({
                    hour: 8,
                    minute: 30
                })
            };
            //and next event that starts at 8:45 and ends 9:15
            var event3 = {
                start: Date.today().set({
                    hour: 8,
                    minute: 45
                }),
                end: Date.today().set({
                    hour: 9,
                    minute: 15
                })
            };
            //and next event that starts after all attached events
            var event4 = {
                start: Date.today().set({
                    hour: 9,
                    minute: 15
                }),
                end: Date.today().set({
                    hour: 9,
                    minute: 30
                })
            };
            //when attaching all events in random order
            renderer.attachAll([event4, event3, event2, event1]);
            //then events are sorted and attached to proper time lines
            expect(event1.timeline).toBe(0);
            expect(event2.timeline).toBe(1);
            expect(event3.timeline).toBe(1);
            expect(event4.timeline).toBe(0);
            //and proper overlapping indexes are set
            expect(event4.overlap.value).toBe(1);
            expect(event3.overlap.value).toBe(2);
            expect(event2.overlap.value).toBe(2);
            expect(event1.overlap.value).toBe(2);
        });


    });

    describe('CalendarCtrl-spec:', function () {

        beforeEach(angular.mock.module('chronos'));

        var ctrlScope;
        var mockCalendarService, mockUiNotification, mock, mockModal;
        var calendarPromise;

        //prepare controller for testing
        beforeEach(inject(function ($controller, $injector, _$rootScope_) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            //mock dependencies
            mockCalendarService = jasmine.createSpyObj('mockCalendarService', ['events', 'init']);
            calendarPromise = {
                success: function (f) {
                    calendarPromise.onSuccess = f;
                    return calendarPromise;
                },
                error: function (f) {
                    calendarPromise.onError = f;
                    return calendarPromise;
                }
            };
            mockCalendarService.events.andReturn(calendarPromise);
            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            var mockLog = jasmine.createSpyObj('mockLog', ['debug', 'info', 'error']);
            //inject mocks
            $controller('CalendarCtrl', {
                $scope: ctrlScope,
                $log: mockLog,
                $modal: mockModal,
                CalendarService: mockCalendarService,
                CalendarCollectionFactory: $injector.get('CalendarCollectionFactory'),
                CalendarRenderer: $injector.get('CalendarRenderer'),
                EventUtils: $injector.get('EventUtils'),
                uiNotification: mockUiNotification
            });
        }));

        describe('calendar initialization-spec:', function () {

            it('should initialize weekly view by shifting time table to beginning of the week', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week display period time
                var daysCount = 7;
                //and current user
                var currentUserId = 1;
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 3
                });
                //when initializing calendar
                ctrlScope.init(daysCount, startDate);
                //then calendar is prepared for displaying data of current user
                expect(mockCalendarService.init).toHaveBeenCalledWith(currentUserId);
                //and calendar time table is set for current week
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-09-29');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2014-10-05');
                //and events started to be loading
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-09-29');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-05');
            });

            it('should initialize weekly view by leaving curent Monday', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week display period time
                var daysCount = 7;
                //and current user
                var currentUserId = 1;
                //and current date is Monday
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                //when initializing calendar
                ctrlScope.init(daysCount, startDate);
                //then calendar is prepared for displaying data of current user
                expect(mockCalendarService.init).toHaveBeenCalledWith(currentUserId);
                //and calendar time table is set for current week
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-13');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2014-10-19');
                //and events started to be loading
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-13');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-19');
            });

            it('should initialize monthly view by shifting time table to beginning of the month', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one month display period time
                var daysCount = 31;
                //and current user
                var currentUserId = 1;
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                //when initializing calendar
                ctrlScope.init(daysCount, startDate);
                //then calendar is prepared for displaying data of current user
                expect(mockCalendarService.init).toHaveBeenCalledWith(currentUserId);
                //and calendar time table is set for beginning of the current month
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-01');
                expect(ctrlScope.days[30].toString('yyyy-MM-dd')).toBe('2014-10-31');
                expect(ctrlScope.days[31]).not.toBeDefined();
                //and events started to be loading
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-01');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-31');
            });

            it('should initialize daily view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day display period time
                var daysCount = 1;
                //and current user
                var currentUserId = 1;
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                //when initializing calendar
                ctrlScope.init(daysCount, startDate);
                //then calendar is prepared for displaying data of current user
                expect(mockCalendarService.init).toHaveBeenCalledWith(currentUserId);
                //and calendar time table is set for one day only
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-13');
                //and events started to be loading
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-13');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-13');
            });

        });

        describe('calendar data loading-spec:', function () {

            it('should load data for view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day display period time
                var daysCount = 1;
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                //when loading data for chosen view
                ctrlScope.init(daysCount, startDate);
                //and back-end responded successfully
                var events = [{
                    tile: 'sample-event',
                    start: startDate.clone(),
                    end: startDate.clone().add(1).hour()
            }];
                calendarPromise.onSuccess(events);
                //then calendar time table is set for one day only
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-13');
                //and events are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-13');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-13');
                expect(ctrlScope.eventsMap.size()).toBe(1);
                //and events are rendered properly
                expect(events[0].timeline).toBe(0);
                expect(events[0].overlap.value).toBe(1);
            });

            it('should inform user when data couldn\'t be loaded', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day display period time
                var daysCount = 1;
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                //when loading data for chosen view
                ctrlScope.init(daysCount, startDate);
                //and back-end responded with failure
                calendarPromise.onError('ERROR');
                //then user is informed properly
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Couldn\'t load events');
            });

            it('should refresh data of calendar view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day display period time
                var daysCount = 1;
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                ctrlScope.beginDate = startDate;
                ctrlScope.days = [startDate];
                //when calendar is refreshed
                ctrlScope.refresh();
                //then calendar time table is set for one day only
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-13');
                //and events are loaded again
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-13');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-13');
            });

        });

        describe('calendar navigation for weekly view-spec:', function () {

            it('should navigate to next week in week view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week view
                var daysCount = 7;
                //and current time table
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init(daysCount, startDate);
                //when moving to next week
                ctrlScope.nextWeek();
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-20');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2014-10-26');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-20');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-26');
            });

            it('should navigate to previous week in week view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week view
                var daysCount = 7;
                //and current time table
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init(daysCount, startDate);
                //when moving to previous week
                ctrlScope.previousWeek();
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-06');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2014-10-12');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-06');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-12');
            });

            it('should navigate to next day in daily view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day view
                var daysCount = 1;
                //and current time table
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init(daysCount, startDate);
                //when moving to next day
                ctrlScope.nextDay();
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-15');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-15');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-15');
            });

            it('should navigate to previous day in daily view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day view
                var daysCount = 1;
                //and current time table
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init(daysCount, startDate);
                //when moving to previous day
                ctrlScope.previousDay();
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-13');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-13');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-13');
            });

            it('should navigate to next month in weekly view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week view
                var daysCount = 7;
                //and current time table
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init(daysCount, startDate);
                //when moving to next month
                ctrlScope.nextMonth();
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-11-10');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2014-11-16');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-11-10');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-11-16');
            });

            it('should navigate to previous month in weekly view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week view
                var daysCount = 7;
                //and current time table
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init(daysCount, startDate);
                //when moving to previous month
                ctrlScope.previousMonth();
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-09-15');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2014-09-21');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-09-15');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-09-21');
            });

            it('should navigate to next year in weekly view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week view
                var daysCount = 7;
                //and current time table
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init(daysCount, startDate);
                //when moving to next year
                ctrlScope.nextYear();
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2015-10-12');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2015-10-18');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2015-10-12');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2015-10-18');
            });

            it('should navigate to previous year in weekly view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week view
                var daysCount = 7;
                //and current time table
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init(daysCount, startDate);
                //when moving to next year
                ctrlScope.previousYear();
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2013-10-14');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2013-10-20');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2013-10-14');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2013-10-20');
            });

        });




        describe('calendar navigation for monthly view-spec:', function () {

            it('should navigate to next month in monthly view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one month view
                var daysCount = 31;
                //and current time table
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init(daysCount, startDate);
                //when moving to next month
                ctrlScope.nextMonth();
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-27');
                expect(ctrlScope.days[ctrlScope.days.length-1].toString('yyyy-MM-dd')).toBe('2014-11-30');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-27');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-11-30');
            });

            it('should navigate to previous month in weekly view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week view
                var daysCount = 7;
                //and current time table
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init(daysCount, startDate);
                //when moving to previous month
                ctrlScope.previousMonth();
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-09-15');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2014-09-21');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-09-15');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-09-21');
            });

            it('should navigate to next year in weekly view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week view
                var daysCount = 7;
                //and current time table
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init(daysCount, startDate);
                //when moving to next year
                ctrlScope.nextYear();
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2015-10-12');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2015-10-18');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2015-10-12');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2015-10-18');
            });

            it('should navigate to previous year in weekly view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week view
                var daysCount = 7;
                //and current time table
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init(daysCount, startDate);
                //when moving to next year
                ctrlScope.previousYear();
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2013-10-14');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2013-10-20');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2013-10-14');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2013-10-20');
            });

        });

    });

});