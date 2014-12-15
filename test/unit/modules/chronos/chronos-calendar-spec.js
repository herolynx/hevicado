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

        var ctrlScope, mockRootScope;
        var mockCalendarService, mockUsersService;
        var mockEventActionManager, mockUiNotification, mockModal;
        var mockState, mockStateParams;
        var calendarPromise, userPromise, calendarEvents;

        //prepare controller for testing
        beforeEach(inject(function ($controller, $injector, _$rootScope_, CALENDAR_EVENTS) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            mockRootScope = jasmine.createSpyObj('$rootScope', ['$broadcast']);
            calendarEvents = CALENDAR_EVENTS;
            //mock dependencies
            mockCalendarService = jasmine.createSpyObj('mockCalendarService', ['events', 'init', 'cancel', 'save']);
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
            mockCalendarService.cancel.andReturn(calendarPromise);
            mockCalendarService.save.andReturn(calendarPromise);
            mockUsersService = jasmine.createSpyObj('mockUsersService', ['get']);
            userPromise = {
                success: function (f) {
                    calendarPromise.onSuccess = f;
                    return calendarPromise;
                },
                error: function (f) {
                    calendarPromise.onError = f;
                    return calendarPromise;
                }
            };
            mockUsersService.get.andReturn(userPromise);
            mockEventActionManager = jasmine.createSpyObj('mockEventActionManager', ['canCancel']);
            //mock others
            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            var mockLog = jasmine.createSpyObj('mockLog', ['debug', 'info', 'error']);
            mockState = jasmine.createSpyObj('$state', ['go']);
            mockState.current = {
                data: {
                    addVisitState: 'mock-state.new-visit',
                    editVisitState: 'mock-state.edit-visit'
                }
            };
            mockStateParams = {doctorId: "doctor-123"};
            //inject mocks
            $controller('CalendarCtrl', {
                $rootScope: mockRootScope,
                $scope: ctrlScope,
                $log: mockLog,
                $state: mockState,
                $stateParams: mockStateParams,
                CalendarService: mockCalendarService,
                CalendarCollectionFactory: $injector.get('CalendarCollectionFactory'),
                CalendarRenderer: $injector.get('CalendarRenderer'),
                EventUtils: $injector.get('EventUtils'),
                EventActionManager: mockEventActionManager,
                uiNotification: mockUiNotification,
                UsersService: mockUsersService
            });
        }));

        describe('calendar initialization-spec:', function () {

            it('should initialize weekly view by shifting time table to beginning of the week', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week display period time
                var daysCount = 7;
                //and current user
                var currentUserId = "doctor-123";
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 3
                });
                //when initializing calendar
                ctrlScope.init(daysCount, startDate);
                //then calendar is prepared for displaying data of chosen user
                expect(ctrlScope.doctorId).toBe(currentUserId);
                expect(mockCalendarService.init).toHaveBeenCalledWith(currentUserId);
                //and calendar time table is set for current week
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-09-29');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2014-10-05');
                //and events started to be loading
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-09-29');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-05');
            });

            it('should initialize weekly view by leaving current Monday', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week display period time
                var daysCount = 7;
                //and current user
                var currentUserId = "doctor-123";
                //and current date is Monday
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 15
                });
                //when initializing calendar
                ctrlScope.init(daysCount, startDate);
                //then calendar is prepared for displaying data of chosen user
                expect(ctrlScope.doctorId).toBe(currentUserId);
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
                var currentUserId = "doctor-123";
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                //when initializing calendar
                ctrlScope.init(daysCount, startDate);
                //then calendar is prepared for displaying data of chosen user
                expect(ctrlScope.doctorId).toBe(currentUserId);
                expect(mockCalendarService.init).toHaveBeenCalledWith(currentUserId);
                //and calendar time table is set for beginning of the current month
                expect(ctrlScope.days.length).toBe(35);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-09-29');
                expect(ctrlScope.days[34].toString('yyyy-MM-dd')).toBe('2014-11-02');
                //and events started to be loading
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-09-29');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-11-02');
            });

            it('should initialize daily view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day display period time
                var daysCount = 1;
                //and current user
                var currentUserId = "doctor-123";
                //and current date
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                //when initializing calendar
                ctrlScope.init(daysCount, startDate);
                //then calendar is prepared for displaying data of chosen user
                expect(ctrlScope.doctorId).toBe(currentUserId);
                expect(mockCalendarService.init).toHaveBeenCalledWith(currentUserId);
                //and calendar time table is set for one day only
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-13');
                //and events started to be loading
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-13');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-13');
            });

            it('should create two calendars with different caches', inject(function ($controller, $injector, $rootScope) {
                //given 1st instance of calendar is created
                expect(ctrlScope).toBeDefined();
                //when creating another instance of calendar
                //and new controller is not created in exact the same moment
                setTimeout(function () {
                    var ctrlScope2 = $rootScope.$new();
                    $controller('CalendarCtrl', {
                        $scope: ctrlScope2,
                        $log: {},
                        $modal: mockModal,
                        CalendarService: mockCalendarService,
                        CalendarCollectionFactory: $injector.get('CalendarCollectionFactory'),
                        CalendarRenderer: $injector.get('CalendarRenderer'),
                        EventUtils: $injector.get('EventUtils'),
                        uiNotification: mockUiNotification
                    });
                    //then new instance is created with separate cache
                    expect(ctrlScope2).toBeDefined();
                    expect(ctrlScope2).not.toBe(ctrlScope);
                }, 1000);
            }));

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
                var events = [
                    {
                        title: 'sample-event',
                        start: startDate.clone(),
                        end: startDate.clone().add(1).hour()
                    }
                ];
                calendarPromise.onSuccess(events);
                //then calendar time table is set for one day only
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-13');
                //and events are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd HH:mm:ss')).toEqual('2014-10-13 00:00:00');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd HH:mm:ss')).toEqual('2014-10-13 23:59:59');
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //when calendar is refreshed
                ctrlScope.refresh();
                //then calendar time table is set for one day only
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-13');
                //and events are loaded again
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd HH:mm:ss')).toEqual('2014-10-13 00:00:00');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd HH:mm:ss')).toEqual('2014-10-13 23:59:59');
            });

            it('should get existing events for chosen day', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        title: 'sample-event',
                        start: startDate.clone(),
                        end: startDate.clone().add(1).hour()
                    }
                ];
                calendarPromise.onSuccess(events);
                //when events are taken for chosen day
                var dayEvents = ctrlScope.getEvents(startDate);
                //then all existing events are returned
                expect(dayEvents.length).toBe(1);
                expect(dayEvents[0].title).toBe(events[0].title);
            });

            it('should return empty results when events for chosen day not exist', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        title: 'sample-event',
                        start: startDate.clone(),
                        end: startDate.clone().add(1).hour()
                    }
                ];
                calendarPromise.onSuccess(events);
                //when events are taken for different day
                var dayEvents = ctrlScope.getEvents(startDate.clone().add(1).days());
                //then empty result is returned
                expect(dayEvents.length).toBe(0);
            });

            it('should get events for specific point of time', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        title: 'sample-event1',
                        start: startDate.clone(),
                        end: startDate.clone().add(1).hour()
                    },
                    {
                        title: 'sample-event2',
                        start: startDate.clone().add(1).hour(),
                        end: startDate.clone().add(2).hour()
                    }
                ];
                calendarPromise.onSuccess(events);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                //when events are taken for chosen hour
                var dayEvents = ctrlScope.getEvents(startDate);
                //then only events from that hour are returned
                expect(dayEvents.length).toBe(1);
                expect(dayEvents[0].title).toBe(events[0].title);
            });

            it('should get events from cache', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        title: 'sample-event1',
                        start: startDate.clone(),
                        end: startDate.clone().add(1).hour()
                    },
                    {
                        title: 'sample-event2',
                        start: startDate.clone().add(1).hour(),
                        end: startDate.clone().add(2).hour()
                    }
                ];
                calendarPromise.onSuccess(events);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                //and events have been read once
                var dayEvents = ctrlScope.getEvents(startDate);
                expect(dayEvents.length).toBe(1);
                expect(dayEvents[0].title).toBe(events[0].title);
                //when making the same read once again
                ctrlScope.eventsMap.clear();
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(0);
                var cachedEvents = ctrlScope.getEvents(startDate);
                //then results are returned from cache
                expect(cachedEvents.length).toBe(1);
                expect(cachedEvents[0].title).toBe(events[0].title);
                expect(cachedEvents).toEqual(dayEvents);
            });

            it('should get summary info for chosen day and single location', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        title: 'sample-event1',
                        start: startDate.clone(),
                        end: startDate.clone().add(1).hour(),
                        location: {
                            name: 'loc1'
                        }
                    },
                    {
                        title: 'sample-event2',
                        start: startDate.clone().add(1).hour(),
                        end: startDate.clone().add(2).hour(),
                        location: {
                            name: 'loc1'
                        }
                    }
                ];
                calendarPromise.onSuccess(events);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                //when summary info for chosen day is taken
                var summayInfo = ctrlScope.dayInfo(startDate, 4);
                //then info from that day is returned
                expect(summayInfo.length).toBe(1);
                expect(summayInfo[0]).toEqual({
                    name: 'loc1',
                    value: 2
                });
            });

            it('should return empty summary info when no events planned for day', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        title: 'sample-event1',
                        start: startDate.clone(),
                        end: startDate.clone().add(1).hour(),
                        location: {
                            name: 'loc1'
                        }
                    }
                ];
                calendarPromise.onSuccess(events);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(1);
                //when summary info for chosen day is taken when no events are defined
                var summaryInfo = ctrlScope.dayInfo(startDate.add(1).days(), 4);
                //then empty info is returned
                expect(summaryInfo.length).toBe(1);
                expect(summaryInfo[0]).toEqual({
                    name: '',
                    color: 'turquoise',
                    value: 0
                });
            });

            it('should get summary info for chosen day and many locations', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        title: 'sample-event1',
                        start: startDate.clone(),
                        end: startDate.clone().add(1).hour(),
                        location: {
                            name: 'loc1'
                        }
                    },
                    {
                        title: 'sample-event2',
                        start: startDate.clone().add(1).hour(),
                        end: startDate.clone().add(2).hour(),
                        location: {
                            name: 'loc1'
                        }
                    },
                    {
                        title: 'sample-event3',
                        start: startDate.clone().add(1).hour(),
                        end: startDate.clone().add(2).hour(),
                        location: {
                            name: 'loc2'
                        }
                    },
                    {
                        title: 'sample-event4',
                        start: startDate.clone().add(1).hour(),
                        end: startDate.clone().add(2).hour(),
                        location: {
                            name: 'loc3'
                        }
                    }

                ];
                calendarPromise.onSuccess(events);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(4);
                //when summary info for chosen day is taken
                var summayInfo = ctrlScope.dayInfo(startDate, 2);
                //then info from that day is returned
                expect(summayInfo.length).toBe(2);
                expect(summayInfo[0]).toEqual({
                    name: 'loc1',
                    value: 2
                }, {
                    name: 'loc2',
                    value: 1
                });
            });

            it('should get summary info from cache', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        title: 'sample-event1',
                        start: startDate.clone(),
                        end: startDate.clone().add(1).hour(),
                        location: {
                            name: 'loc1'
                        }
                    },
                    {
                        title: 'sample-event2',
                        start: startDate.clone().add(1).hour(),
                        end: startDate.clone().add(2).hour(),
                        location: {
                            name: 'loc1'
                        }
                    }
                ];
                calendarPromise.onSuccess(events);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                //and summary info has been read once
                var summayInfo = ctrlScope.dayInfo(startDate, 4);
                expect(summayInfo.length).toBe(1);
                expect(summayInfo[0]).toEqual({
                    name: 'loc1',
                    value: 2
                });
                //when the same read is made one more time
                ctrlScope.eventsMap.clear();
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(0);
                var cachedInfo = ctrlScope.dayInfo(startDate, 4);
                //then results are returned from cache
                expect(cachedInfo.length).toBe(1);
                expect(cachedInfo).toEqual(summayInfo);
            });

            it('should clear cache when new data is loaded', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        title: 'sample-event1',
                        start: startDate.clone(),
                        end: startDate.clone().add(1).hour()
                    },
                    {
                        title: 'sample-event2',
                        start: startDate.clone().add(1).hour(),
                        end: startDate.clone().add(2).hour()
                    }
                ];
                calendarPromise.onSuccess(events);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                //and events have been read once
                var dayEvents = ctrlScope.getEvents(startDate);
                expect(dayEvents.length).toBe(1);
                expect(dayEvents[0].title).toBe(events[0].title);
                //and cache has been initialized
                ctrlScope.eventsMap.clear();
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(0);
                var cachedEvents = ctrlScope.getEvents(startDate);
                expect(cachedEvents.length).toBe(1);
                expect(cachedEvents).toEqual(dayEvents);
                //when new data is read
                ctrlScope.refresh();
                calendarPromise.onSuccess([
                    {
                        title: 'sample-event3',
                        start: startDate.clone(),
                        end: startDate.clone().add(1).hour()
                    }
                ]);
                //and the same read is made as before
                var newEvents = ctrlScope.getEvents(startDate);
                //then new data is returned
                expect(newEvents.length).toBe(1);
                expect(newEvents[0].title).toBe('sample-event3');
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
                ctrlScope.week(1);
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
                ctrlScope.week(-1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-06');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2014-10-12');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-06');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-12');
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
                ctrlScope.month(1);
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
                ctrlScope.month(-1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-09-08');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2014-09-14');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-09-08');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-09-14');
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
                ctrlScope.year(1);
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
                ctrlScope.year(-1);
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
                ctrlScope.month(1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(35);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-27');
                expect(ctrlScope.days[34].toString('yyyy-MM-dd')).toBe('2014-11-30');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-27');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-11-30');
            });

            it('should navigate to previous month in monthly view', function () {
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
                //when moving to previous month
                ctrlScope.month(-1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(35);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-09-01');
                expect(ctrlScope.days[34].toString('yyyy-MM-dd')).toBe('2014-10-05');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-09-01');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-05');
            });

            it('should navigate to previous year in monthly view', function () {
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
                //when moving to previous year
                ctrlScope.year(-1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(35);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2013-09-30');
                expect(ctrlScope.days[34].toString('yyyy-MM-dd')).toBe('2013-11-03');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2013-09-30');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2013-11-03');
            });

            it('should navigate to next year in monthly view', function () {
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
                //when moving to next year
                ctrlScope.year(1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(35);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2015-09-28');
                expect(ctrlScope.days[34].toString('yyyy-MM-dd')).toBe('2015-11-01');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2015-09-28');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2015-11-01');
            });

        });

        describe('calendar navigation for daily view-spec:', function () {

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
                ctrlScope.day(1);
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
                ctrlScope.day(-1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-13');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-13');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-13');
            });

            it('should navigate to next month in daily view', function () {
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
                //when moving to next month
                ctrlScope.month(1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-11-14');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-11-14');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-11-14');
            });

            it('should navigate to previous month in daily view', function () {
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
                //when moving to previous month
                ctrlScope.month(-1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-09-14');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-09-14');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-09-14');
            });

            it('should navigate to next year in daily view', function () {
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
                //when moving to next year
                ctrlScope.year(1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2015-10-14');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2015-10-14');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2015-10-14');
            });

            it('should navigate to previous year in daily view', function () {
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
                //when moving to previous year
                ctrlScope.year(-1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2013-10-14');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2013-10-14');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2013-10-14');
            });

        });

        describe('events modification-spec:', function () {

            it('should start adding new event', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and edition of event has not started
                mockState.current.name = "mock-state.calendar";
                //and current user
                var currentUserId = "doctor-123";
                //and ctrl is initialized
                ctrlScope.init(1, Date.today());
                expect(ctrlScope.doctorId).toBe(currentUserId);
                //when starting adding event on chosen time
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 23
                });
                ctrlScope.addEvent(startDate, 13, 30);
                //then event edition is started
                var startTime = startDate.clone().set({hour: 13, minute: 30, second: 0});
                expect(mockState.go).toHaveBeenCalledWith(mockState.current.data.addVisitState, {
                    doctorId: currentUserId,
                    startTime: startTime.toString('yyyy-MM-dd HH:mm'),
                    currentDate: startTime.toString('yyyy-MM-dd')
                });
            });

            it('should change date of edited event', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and edition of event has started
                mockState.current.name = mockState.current.data.addVisitState;
                //and current user
                var currentUserId = "doctor-123";
                //and ctrl is initialized
                ctrlScope.init(1, Date.today());
                expect(ctrlScope.doctorId).toBe(currentUserId);
                //when starting chosing new start date of an edited event
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 23
                });
                ctrlScope.addEvent(startDate, 13, 30);
                //then event edition is NOT started
                var startTime = startDate.clone().set({hour: 13, minute: 30, second: 0});
                expect(mockState.go).not.toHaveBeenCalledWith(mockState.current.data.addVisitState, {
                    doctorId: currentUserId,
                    startTime: startTime.toString('yyyy-MM-dd HH:mm')
                });
                //and proper info event about new picked data is broadcasted
                expect(mockRootScope.$broadcast).toHaveBeenCalledWith(calendarEvents.CALENDAR_TIME_PICKED, startTime);
            });

            it('should start editing event', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and current user
                var currentUserId = "doctor-123";
                //and ctrl is initialized
                ctrlScope.init(1, Date.today());
                //and existing event to be edited
                var startDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 23
                });
                var event = {
                    id: 'event-123',
                    title: 'sample-event',
                    start: startDate.clone(),
                    end: startDate.clone().add(1).hour()
                };
                //when starting editing event
                ctrlScope.editEvent(event);
                //then event edition is started
                expect(mockState.go).toHaveBeenCalledWith(mockState.current.data.editVisitState, {
                    doctorId: currentUserId,
                    eventId: event.id,
                    currentDate: event.start.toString('yyyy-MM-dd')
                });
            });

            it('should cancel event', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        id: 1,
                        title: 'sample-event1',
                        start: startDate.clone().add(3).hours(),
                        end: startDate.clone().add(5).hours()
                    },
                    {
                        id: 2,
                        title: 'sample-event2',
                        start: startDate.clone().add(3).hours(),
                        end: startDate.clone().add(4).hours()
                    }
                ];
                calendarPromise.onSuccess(events);
                expect(events[0].timeline).toBe(0);
                expect(events[1].timeline).toBe(1);
                expect(events[0].overlap.value).toBe(2);
                expect(events[1].overlap.value).toBe(2);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                //and event can be cancelled
                mockEventActionManager.canCancel.andReturn(true);
                //when one of events is cancelled
                ctrlScope.cancelEvent(events[0]);
                //and back-end responded successfully
                calendarPromise.onSuccess('CANCELLED');
                //then event is cancelled
                expect(mockEventActionManager.canCancel).toHaveBeenCalledWith(events[0]);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(1);
                //and time line is refreshed for proper period of time
                expect(events[1].timeline).toBe(0);
                expect(events[1].overlap.value).toBe(1);
            });

            it('should inform user when event cannot be cancelled', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        id: 1,
                        title: 'sample-event1',
                        start: startDate.clone().add(3).hour(),
                        end: startDate.clone().add(5).hour()
                    },
                    {
                        id: 2,
                        title: 'sample-event2',
                        start: startDate.clone().add(3).hour(),
                        end: startDate.clone().add(4).hour()
                    }
                ];
                calendarPromise.onSuccess(events);
                expect(events[0].timeline).toBe(0);
                expect(events[1].timeline).toBe(1);
                expect(events[0].overlap.value).toBe(2);
                expect(events[1].overlap.value).toBe(2);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                //and event can be cancelled
                mockEventActionManager.canCancel.andReturn(true);
                //when one of events is cancelled
                ctrlScope.cancelEvent(events[0]);
                //and back-end responded with failure
                calendarPromise.onError('FAILURE');
                //then user is informed properly
                expect(mockEventActionManager.canCancel).toHaveBeenCalledWith(events[0]);
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Couldn\'t cancel event');
            });

            it('should change event time period on drag and drop', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        id: 1,
                        title: 'sample-event1',
                        start: startDate.clone().add(3).hour(),
                        end: startDate.clone().add(5).hour(),
                        duration: 120
                    },
                    {
                        id: 2,
                        title: 'sample-event2',
                        start: startDate.clone().add(3).hour(),
                        end: startDate.clone().add(4).hour(),
                        duration: 60
                    }
                ];
                calendarPromise.onSuccess(events);
                expect(events[0].timeline).toBe(0);
                expect(events[1].timeline).toBe(1);
                expect(events[0].overlap.value).toBe(2);
                expect(events[1].overlap.value).toBe(2);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                //when one of events is updated on DnD
                var dndEvent = {};
                ctrlScope.dndDrop(dndEvent, events[0], startDate, 8, 0, 0);
                //and back-end responded successfully
                calendarPromise.onSuccess('UPDATED');
                //then event is updated
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                expect(events[0].start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 08:00:00');
                expect(events[0].end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 10:00:00');
                //and time line is refreshed for proper period of time
                expect(events[0].timeline).toBe(0);
                expect(events[1].timeline).toBe(0);
                expect(events[0].overlap.value).toBe(1);
                expect(events[1].overlap.value).toBe(1);
            });

            it('should fallback drag and drop changes when event cannot be saved', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        id: 1,
                        title: 'sample-event1',
                        start: startDate.clone().add(3).hour(),
                        end: startDate.clone().add(5).hour(),
                        duration: 120
                    },
                    {
                        id: 2,
                        title: 'sample-event2',
                        start: startDate.clone().add(3).hour(),
                        end: startDate.clone().add(4).hour(),
                        duration: 60
                    }
                ];
                calendarPromise.onSuccess(events);
                expect(events[0].timeline).toBe(0);
                expect(events[1].timeline).toBe(1);
                expect(events[0].overlap.value).toBe(2);
                expect(events[1].overlap.value).toBe(2);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                //when one of events is updated on DnD
                var dndEvent = {};
                ctrlScope.dndDrop(dndEvent, events[0], startDate, 8, 0, 0);
                //and back-end responded with failure
                calendarPromise.onError('FAILURE');
                //then old state of event is restored
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                expect(events[0].start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 03:00:00');
                expect(events[0].end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 05:00:00');
                //and time lines are restored
                expect(events[0].timeline).toBe(0);
                expect(events[1].timeline).toBe(1);
                expect(events[0].overlap.value).toBe(2);
                expect(events[1].overlap.value).toBe(2);
                //and user is informed about error
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Couldn\'t save event');
            });

            it('should change event duration on resize', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        id: 1,
                        title: 'sample-event1',
                        start: startDate.clone().add(3).hour(),
                        end: startDate.clone().add(5).hour(),
                        duration: 120
                    },
                    {
                        id: 2,
                        title: 'sample-event2',
                        start: startDate.clone().add(3).hour(),
                        end: startDate.clone().add(4).hour(),
                        duration: 60
                    }
                ];
                calendarPromise.onSuccess(events);
                expect(events[0].timeline).toBe(0);
                expect(events[1].timeline).toBe(1);
                expect(events[0].overlap.value).toBe(2);
                expect(events[1].overlap.value).toBe(2);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                //when duration of event is changed using resizing
                var dndEvent = {};
                var ui = {
                    size: {
                        height: 150
                    },
                    originalSize: {
                        height: 120
                    }
                };
                ctrlScope.dndChangeTime(dndEvent, ui, events[0]);
                //and back-end responded successfully
                calendarPromise.onSuccess('UPDATED');
                //then event is updated
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                expect(events[0].start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 03:00:00');
                expect(events[0].end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 05:30:00');
                expect(events[0].duration).toBe(150);
                //and time line is refreshed for proper period of time
                expect(events[0].timeline).toBe(0);
                expect(events[1].timeline).toBe(1);
                expect(events[0].overlap.value).toBe(2);
                expect(events[1].overlap.value).toBe(2);
            });

            it('should fallback resize change on event', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        id: 1,
                        title: 'sample-event1',
                        start: startDate.clone().add(3).hour(),
                        end: startDate.clone().add(5).hour(),
                        duration: 120
                    },
                    {
                        id: 2,
                        title: 'sample-event2',
                        start: startDate.clone().add(3).hour(),
                        end: startDate.clone().add(4).hour(),
                        duration: 60
                    }
                ];
                calendarPromise.onSuccess(events);
                expect(events[0].timeline).toBe(0);
                expect(events[1].timeline).toBe(1);
                expect(events[0].overlap.value).toBe(2);
                expect(events[1].overlap.value).toBe(2);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                //when duration of event is changed using resizing
                var dndEvent = {};
                var ui = {
                    size: {
                        height: 150
                    },
                    originalSize: {
                        height: 120
                    }
                };
                ctrlScope.dndChangeTime(dndEvent, ui, events[0]);
                //and back-end responded with failure
                calendarPromise.onError('ERROR');
                //then event is updated
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                expect(events[0].start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 03:00:00');
                expect(events[0].end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 05:00:00');
                expect(events[0].duration).toBe(150);
                //and time line is refreshed for proper period of time
                expect(events[0].timeline).toBe(0);
                expect(events[1].timeline).toBe(1);
                expect(events[0].overlap.value).toBe(2);
                expect(events[1].overlap.value).toBe(2);
                //and user is informed about error
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Couldn\'t save event');
            });

            it('should change event duration on resize and order of events on time line', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        id: 1,
                        title: 'sample-event1',
                        start: startDate.clone().add(3).hour(),
                        end: startDate.clone().add(5).hour(),
                        duration: 120
                    },
                    {
                        id: 2,
                        title: 'sample-event2',
                        start: startDate.clone().add(3).hour(),
                        end: startDate.clone().add(4).hour(),
                        duration: 60
                    }
                ];
                calendarPromise.onSuccess(events);
                expect(events[0].timeline).toBe(0);
                expect(events[1].timeline).toBe(1);
                expect(events[0].overlap.value).toBe(2);
                expect(events[1].overlap.value).toBe(2);
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                //when duration of event is changed using resizing
                var dndEvent = {};
                var ui = {
                    size: {
                        height: 180
                    },
                    originalSize: {
                        height: 60
                    }
                };
                ctrlScope.dndChangeTime(dndEvent, ui, events[1]);
                //and back-end responded successfully
                calendarPromise.onSuccess('UPDATED');
                //then event is updated
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(2);
                expect(events[1].start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 03:00:00');
                expect(events[1].end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-10-13 06:00:00');
                expect(events[1].duration).toBe(180);
                //and order of events is changed on time line
                expect(events[0].timeline).toBe(1);
                expect(events[1].timeline).toBe(0);
                expect(events[0].overlap.value).toBe(2);
                expect(events[1].overlap.value).toBe(2);
            });

            it('should clear cache after drag-and-drop or resizing', function () {
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
                ctrlScope.currentDate = startDate;
                ctrlScope.endDate = startDate;
                ctrlScope.days = [startDate];
                //and loaded data
                ctrlScope.init(daysCount, startDate);
                var events = [
                    {
                        id: 1,
                        title: 'sample-event1',
                        start: startDate.clone().add(3).hour(),
                        end: startDate.clone().add(5).hour(),
                        duration: 120
                    },
                    {
                        id: 2,
                        title: 'sample-event2',
                        start: startDate.clone().add(3).hour(),
                        end: startDate.clone().add(4).hour(),
                        duration: 60
                    }
                ];
                calendarPromise.onSuccess(events);
                //and first read has been done
                expect(ctrlScope.getEvents(startDate, 3, 0).length).toBe(2);
                //when one of events is updated using DnD or resizing
                var dndEvent = {};
                var newDate = startDate.clone().add(1).days();
                ctrlScope.dndDrop(dndEvent, events[0], newDate, 8, 0, 0);
                //and back-end responded successfully
                calendarPromise.onSuccess('UPDATED');
                //then cache is cleared
                //and new results are taken
                expect(ctrlScope.getEvents(startDate, 3, 0).length).toBe(1);
                expect(ctrlScope.getEvents(newDate, 8, 0).length).toBe(1);
            });

        });

    });

});