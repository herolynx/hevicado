'use strict';

describe('chronos-calendar-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos'));

    describe('CalendarCtrl-spec:', function () {

        var ctrlScope, mockRootScope;
        var mockCalendarService, mockUsersService;
        var mockEventActionManager, mockUiNotification, mockModal;
        var mockState, mockStateParams;
        var calendarPromise, userPromise, calendarEvents;

        beforeEach(function () {
            toUTCDate = function (value) {
                return typeof value != 'string' ? value : Date.parse(value);
            };
            toLocalDate = function (value) {
                return typeof value == 'string' ? Date.parse(value) : new Date(value);
            };
        });

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
                    userPromise.onSuccess = f;
                    return userPromise;
                },
                error: function (f) {
                    userPromise.onError = f;
                    return userPromise;
                }
            };
            mockUsersService.get.andReturn(userPromise);
            mockEventActionManager = jasmine.createSpyObj('mockEventActionManager', ['canCancel', 'canEdit']);
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

            it('should initialize time table based on current date parameter', function () {
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
                //and current date parameter is present
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 10
                });
                //when initializing calendar
                ctrlScope.init(daysCount, startDate);
                //then calendar is prepared for displaying data of chosen user
                expect(ctrlScope.doctorId).toBe(currentUserId);
                expect(mockCalendarService.init).toHaveBeenCalledWith(currentUserId);
                //and calendar time table is set for current week
                expect(ctrlScope.days.length).toBe(daysCount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-06');
                expect(ctrlScope.days[6].toString('yyyy-MM-dd')).toBe('2014-10-12');
                //and events started to be loading
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-06');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-12');
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
                var summaryInfo = ctrlScope.dayInfo(startDate, 4);
                //then info from that day is returned
                expect(summaryInfo.length).toBe(1);
                expect(summaryInfo[0]).toEqual({
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
                var summaryInfo = ctrlScope.dayInfo(startDate, 2);
                //then info from that day is returned
                expect(summaryInfo.length).toBe(2);
                expect(summaryInfo[0]).toEqual({
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
                var summaryInfo = ctrlScope.dayInfo(startDate, 4);
                expect(summaryInfo.length).toBe(1);
                expect(summaryInfo[0]).toEqual({
                    name: 'loc1',
                    value: 2
                });
                //when the same read is made one more time
                ctrlScope.eventsMap.clear();
                expect(ctrlScope.eventsMap.events(startDate).length).toBe(0);
                var cachedInfo = ctrlScope.dayInfo(startDate, 4);
                //then results are returned from cache
                expect(cachedInfo.length).toBe(1);
                expect(cachedInfo).toEqual(summaryInfo);
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

            it('should load info about calendar owner', function () {
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
                //and calendar owner
                var currentUserId = "doctor-123";
                var doctor = {
                    id: currentUserId,
                    first_name: 'Zbigniew',
                    last_name: 'Religa'
                };
                //when calendar is initialized
                ctrlScope.init(daysCount, startDate);
                //and back-end responded successfully
                userPromise.onSuccess(doctor);
                //then calendar is prepared for displaying data of chosen user
                expect(ctrlScope.doctorId).toBe(currentUserId);
                expect(mockCalendarService.init).toHaveBeenCalledWith(currentUserId);
                //and info about doctor is loaded
                expect(ctrlScope.doctor).toBe(doctor);
            });

            it('should inform user when info about calendar owner couldn\'t be loaded', function () {
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
                //and calendar owner
                var currentUserId = "doctor-123";
                var doctor = {
                    id: currentUserId,
                    first_name: 'Zbigniew',
                    last_name: 'Religa'
                };
                //when calendar is initialized
                ctrlScope.init(daysCount, startDate);
                //and back-end responded with failure
                userPromise.onError('Error');
                //then calendar is prepared for displaying data of chosen user
                expect(ctrlScope.doctorId).toBe(currentUserId);
                expect(mockCalendarService.init).toHaveBeenCalledWith(currentUserId);
                //and user is informed about failed info loading
                expect(ctrlScope.doctor).not.toBeDefined();
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Doctor\'s info not loaded - part of functionality may not workking properly');
            });

            it('should get filtered events for chosen day', function () {
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
                        end: startDate.clone().add(1).hour(),
                        cancelled: Date.today()
                    }
                ];
                calendarPromise.onSuccess(events);
                //when events are taken for chosen day
                var dayEvents = ctrlScope.getEvents(startDate);
                //then filtered events are returned
                expect(dayEvents.length).toBe(0);
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

        describe('calendar menu-spec:', function () {

            it('should show mini-calendar', function () {
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
                //and calendar is initialized
                ctrlScope.init(daysCount, startDate);
                expect(ctrlScope.datePickerOpened).not.toBeDefined();
                //when showing mini-calendar
                var event = jasmine.createSpyObj('$event', ['preventDefault', 'stopPropagation']);
                ctrlScope.showDatePicker(event);
                //then mini-calendar is shown
                expect(ctrlScope.datePickerOpened).toBe(true);
                expect(event.preventDefault).toHaveBeenCalled();
                expect(event.stopPropagation).toHaveBeenCalled();
            });

            it('should hide mini-calendar', function () {
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
                //and calendar is initialized
                ctrlScope.init(daysCount, startDate);
                expect(ctrlScope.datePickerOpened).not.toBeDefined();
                //and mini-calendar is shown
                var event = jasmine.createSpyObj('$event', ['preventDefault', 'stopPropagation']);
                ctrlScope.showDatePicker(event);
                expect(ctrlScope.datePickerOpened).toBe(true);
                //when  calling show date picker once again
                ctrlScope.showDatePicker(event);
                //then mini-calendar is hidden
                expect(ctrlScope.datePickerOpened).toBe(false);
            });

            it('should reset current data param when data is changed using mini-calendar', function () {
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
                //and current date parameter is present
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 10
                });
                //and calendar is initialized
                ctrlScope.init(daysCount, startDate);
                expect(ctrlScope.datePickerOpened).not.toBeDefined();
                //and mini-calendar is shown
                var event = jasmine.createSpyObj('$event', ['preventDefault', 'stopPropagation']);
                ctrlScope.showDatePicker(event);
                expect(ctrlScope.datePickerOpened).toBe(true);
                //when date is chosen using mini-calendar
                ctrlScope.onDatePickerDateChange();
                //then mini-calendar is hidden
                expect(ctrlScope.datePickerOpened).toBe(false);
                //and current data param is reset
                expect(mockStateParams.currentDate).toBeNull();
                //and loading of data has started
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-06');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-12');
            });

            it('should find location for chosen time window', function () {
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
                //and current date parameter is present
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 10
                });
                //and calendar's owner
                var doctor = {
                    id: currentUserId,
                    first_name: 'Zbigniew',
                    last_name: 'Religa',
                    locations: [
                        {
                            id: "546b8fd1ef680df8426005c2",
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
                        }
                    ]
                };
                //and calendar is initialized
                ctrlScope.init(daysCount, startDate);
                userPromise.onSuccess(doctor);
                //when searching for location assigned for chosen time window
                //in doctor's working hours
                var location = ctrlScope.findLocation(Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15
                }), 9, 30);
                //then proper location according to working hours is found
                expect(location).not.toBeNull();
                expect(location.color).toBe('red');
                expect(location.name).toBe('Pulsantis');
            });

            it('should find location for chosen time window using cache', function () {
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
                //and current date parameter is present
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 10
                });
                //and calendar's owner
                var doctor = {
                    id: currentUserId,
                    first_name: 'Zbigniew',
                    last_name: 'Religa',
                    locations: [
                        {
                            id: "546b8fd1ef680df8426005c2",
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
                        }
                    ]
                };
                //and calendar is initialized
                ctrlScope.init(daysCount, startDate);
                userPromise.onSuccess(doctor);
                //and location has been searched once
                var location = ctrlScope.findLocation(Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15
                }), 9, 30);
                //then proper location according to working hours is found
                expect(location).not.toBeNull();
                expect(location.name).toBe('Pulsantis');
                //when searching for location assigned for the second time
                ctrlScope.doctor.locations = [];
                var cachedLocation = ctrlScope.findLocation(Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15
                }), 9, 30);
                //then proper location is returned from cache
                expect(cachedLocation).not.toBeNull();
                expect(cachedLocation.name).toBe('Pulsantis');
                expect(cachedLocation.color).toBe('red');
                expect(cachedLocation).toEqual(location);
            });

            it('should return default location for non-working hours', function () {
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
                //and current date parameter is present
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 10
                });
                //and calendar's owner
                var doctor = {
                    id: currentUserId,
                    first_name: 'Zbigniew',
                    last_name: 'Religa',
                    locations: [
                        {
                            id: "546b8fd1ef680df8426005c2",
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
                                    start: "08:0e0",
                                    end: "16:00",
                                    tzOffset: 0
                                }
                            ]
                        }
                    ]
                };
                //and calendar is initialized
                ctrlScope.init(daysCount, startDate);
                userPromise.onSuccess(doctor);
                //when searching for location for non-working hours
                var location = ctrlScope.findLocation(Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15
                }), 10, 30);
                //then proper location according to working hours is found
                expect(location).not.toBeNull();
                expect(location.name).not.toBeDefined();
                expect(location.color).toBeDefined();
            });

        });

    });

});