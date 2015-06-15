'use strict';

describe('calendar-base-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos'));

    describe('CalendarCtrl-spec:', function () {

        var ctrlScope;
        var mockCalendarService, mockUsersService;
        var mockUiNotification;
        var mockState, mockStateParams;
        var calendarPromise, userPromise;

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
                daysAmount: 1,
                data: {
                    addVisitState: 'mock-state.new-visit',
                    editVisitState: 'mock-state.edit-visit'
                }
            };
            mockStateParams = {doctorId: "doctor-123"};
            //inject mocks
            $controller('CalendarCtrl', {
                $scope: ctrlScope,
                $log: mockLog,
                $state: mockState,
                $stateParams: mockStateParams,
                CalendarService: mockCalendarService,
                EventUtils: $injector.get('EventUtils'),
                uiNotification: mockUiNotification,
                UsersService: mockUsersService
            });
        }));

        describe('calendar initialization-spec:', function () {

            it('should initialize weekly view by shifting time table to beginning of the week', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week display period time
                mockState.current.daysAmount = 7;
                //and current user
                var currentUserId = "doctor-123";
                //and current date
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 3
                });
                //when initializing calendar
                ctrlScope.init();
                //then calendar is prepared for displaying data of chosen user
                expect(ctrlScope.doctorId).toBe(currentUserId);
                expect(mockCalendarService.init).toHaveBeenCalledWith(currentUserId);
                //and calendar time table is set for current week
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
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
                mockState.current.daysAmount = 7;
                //and current user
                var currentUserId = "doctor-123";
                //and current date is Monday
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 15
                });
                //when initializing calendar
                ctrlScope.init();
                //then calendar is prepared for displaying data of chosen user
                expect(ctrlScope.doctorId).toBe(currentUserId);
                expect(mockCalendarService.init).toHaveBeenCalledWith(currentUserId);
                //and calendar time table is set for current week
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
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
                mockState.current.daysAmount = 31;
                //and current user
                var currentUserId = "doctor-123";
                //and current date
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                //when initializing calendar
                ctrlScope.init();
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
                mockState.current.daysAmount = 1;
                //and current user
                var currentUserId = "doctor-123";
                //and current date
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                //when initializing calendar
                ctrlScope.init();
                //then calendar is prepared for displaying data of chosen user
                expect(ctrlScope.doctorId).toBe(currentUserId);
                expect(mockCalendarService.init).toHaveBeenCalledWith(currentUserId);
                //and calendar time table is set for one day only
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-13');
                //and events started to be loading
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-13');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-13');
            });

            it('should initialize time table based on current date parameter', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week display period time
                mockState.current.daysAmount = 7;
                //and current user
                var currentUserId = "doctor-123";
                //and current date
                mockStateParams.currentDate = Date.today().set({
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
                ctrlScope.init();
                //then calendar is prepared for displaying data of chosen user
                expect(ctrlScope.doctorId).toBe(currentUserId);
                expect(mockCalendarService.init).toHaveBeenCalledWith(currentUserId);
                //and calendar time table is set for current week
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
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
                ctrlScope.onEventsLoad = function () {
                    ctrlScope.eventLoaded = true;
                };
                //and one day display period time
                mockState.current.daysAmount = 1;
                //and current date
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                //when loading data for chosen view
                ctrlScope.init();
                //and back-end responded successfully
                var events = [
                    {
                        title: 'sample-event',
                        start: mockStateParams.currentDate.clone(),
                        end: mockStateParams.currentDate.clone().add(1).hour()
                    }
                ];
                calendarPromise.onSuccess(events);
                //then calendar time table is set for one day only
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-13');
                //and events are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd HH:mm:ss')).toEqual('2014-10-13 00:00:00');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd HH:mm:ss')).toEqual('2014-10-13 23:59:59');
                expect(ctrlScope.eventLoaded).toBe(true);
            });

            it('should inform user when data couldn\'t be loaded', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day display period time
                mockState.current.daysAmount = 1;
                //and current date
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                //when loading data for chosen view
                ctrlScope.init();
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
                mockState.current.daysAmount = 1;
                //and current date
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 13
                });
                ctrlScope.beginDate = mockStateParams.currentDate;
                ctrlScope.currentDate = mockStateParams.currentDate;
                ctrlScope.endDate = mockStateParams.currentDate;
                ctrlScope.days = [mockStateParams.currentDate];
                //when calendar is refreshed
                ctrlScope.refresh();
                //then calendar time table is set for one day only
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-13');
                //and events are loaded again
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd HH:mm:ss')).toEqual('2014-10-13 00:00:00');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd HH:mm:ss')).toEqual('2014-10-13 23:59:59');
            });

            it('should load info about calendar owner', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day display period time
                mockState.current.daysAmount = 1;
                //and current date
                mockStateParams.currentDate = Date.today().set({
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
                ctrlScope.init();
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
                mockState.current.daysAmount = 1;
                //and current date
                mockStateParams.currentDate = Date.today().set({
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
                ctrlScope.init();
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

        });

        describe('calendar navigation for weekly view-spec:', function () {

            it('should navigate to next week in week view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one week view
                mockState.current.daysAmount = 7;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
                //when moving to next week
                ctrlScope.week(1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
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
                mockState.current.daysAmount = 7;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
                //when moving to previous week
                ctrlScope.week(-1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
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
                mockState.current.daysAmount = 7;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
                //when moving to next month
                ctrlScope.month(1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
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
                mockState.current.daysAmount = 7;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
                //when moving to previous month
                ctrlScope.month(-1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
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
                mockState.current.daysAmount = 7;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
                //when moving to next year
                ctrlScope.year(1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
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
                mockState.current.daysAmount = 7;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
                //when moving to next year
                ctrlScope.year(-1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
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
                mockState.current.daysAmount = 31;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
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
                mockState.current.daysAmount = 31;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
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
                mockState.current.daysAmount = 31;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
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
                mockState.current.daysAmount = 31;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
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
                mockState.current.daysAmount = 1;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
                //when moving to next day
                ctrlScope.day(1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-15');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-15');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-15');
            });

            it('should navigate to previous day in daily view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day view
                mockState.current.daysAmount = 1;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
                //when moving to previous day
                ctrlScope.day(-1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-10-13');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-13');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-13');
            });

            it('should navigate to next month in daily view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day view
                mockState.current.daysAmount = 1;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
                //when moving to next month
                ctrlScope.month(1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-11-14');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-11-14');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-11-14');
            });

            it('should navigate to previous month in daily view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day view
                mockState.current.daysAmount = 1;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
                //when moving to previous month
                ctrlScope.month(-1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2014-09-14');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-09-14');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-09-14');
            });

            it('should navigate to next year in daily view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day view
                mockState.current.daysAmount = 1;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
                //when moving to next year
                ctrlScope.year(1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
                expect(ctrlScope.days[0].toString('yyyy-MM-dd')).toBe('2015-10-14');
                //and events for new time table are loaded
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2015-10-14');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2015-10-14');
            });

            it('should navigate to previous year in daily view', function () {
                //given controller is initialized
                expect(ctrlScope).toBeDefined();
                //and one day view
                mockState.current.daysAmount = 1;
                //and current time table
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 14
                });
                ctrlScope.init();
                //when moving to previous year
                ctrlScope.year(-1);
                //then new time table is set
                expect(ctrlScope.days.length).toBe(mockState.current.daysAmount);
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
                mockState.current.daysAmount = 7;
                //and current user
                var currentUserId = "doctor-123";
                //and current date
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 3
                });
                //and calendar is initialized
                ctrlScope.init();
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
                mockState.current.daysAmount = 7;
                //and current user
                var currentUserId = "doctor-123";
                //and current date
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 3
                });
                //and calendar is initialized
                ctrlScope.init();
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
                mockState.current.daysAmount = 7;
                //and current user
                var currentUserId = "doctor-123";
                //and current date
                mockStateParams.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 3
                });
                //and calendar is initialized
                ctrlScope.init();
                expect(ctrlScope.datePickerOpened).not.toBeDefined();
                //and mini-calendar is shown
                var event = jasmine.createSpyObj('$event', ['preventDefault', 'stopPropagation']);
                ctrlScope.showDatePicker(event);
                expect(ctrlScope.datePickerOpened).toBe(true);
                //when date is chosen using mini-calendar
                ctrlScope.currentDate = Date.today().set({
                    year: 2014,
                    month: 9,
                    day: 10
                });
                ctrlScope.onDatePickerDateChange();
                //then mini-calendar is hidden
                expect(ctrlScope.datePickerOpened).toBe(false);
                //and loading of data has started
                expect(mockCalendarService.events.mostRecentCall.args[0].toString('yyyy-MM-dd')).toEqual('2014-10-06');
                expect(mockCalendarService.events.mostRecentCall.args[1].toString('yyyy-MM-dd')).toEqual('2014-10-12');
            });

        });

    });

});