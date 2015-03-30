'use strict';

describe('edit-visit-spec:', function () {

    var mockCalendarService, mockEventActionManager;
    var mockUsersService, mockSession;
    var mockUiNotification, mockLog;
    var mockState, mockStateParams;
    var $rootScope, ctrlScope, calendarPromise, userPromise, allPromise, mockQ;

    //prepare module for testing
    beforeEach(angular.mock.module('chronos'));

    beforeEach(function () {
        toUTCDate = function (value) {
            return typeof value != 'string' ? value : Date.parse(value);
        };
        toLocalDate = function (value) {
            return typeof value == 'string' ? Date.parse(value) : new Date(value);
        };
    });

    describe('EditEventCtrl-spec:', function () {

        //prepare controller for testing
        beforeEach(inject(function ($controller, $injector, _$rootScope_) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            $rootScope = _$rootScope_;
            allPromise = {
                then: function (success, error) {
                    mockQ.onSuccess = success;
                    mockQ.onError = error;
                    return mockQ;
                }
            };
            mockQ = {};
            mockQ.all = function (promises) {
                mockQ.promises = promises;
                return allPromise;
            };
            mockQ.when = function (value) {
                mockQ.value = value;
                return calendarPromise;
            };

            //mock calendar related stuff
            mockCalendarService = jasmine.createSpyObj('mockCalendarService', ['event', 'cancel', 'save']);
            calendarPromise = {};
            calendarPromise.error = function (f) {
                calendarPromise.onError = f;
                return calendarPromise;
            };
            calendarPromise.success = function (f) {
                calendarPromise.onSuccess = f;
                return calendarPromise;
            };
            mockCalendarService.event.andReturn(calendarPromise);
            mockCalendarService.cancel.andReturn(calendarPromise);
            mockCalendarService.save.andReturn(calendarPromise);
            mockEventActionManager = jasmine.createSpyObj('mockEventActionManager', ['canCancel', 'canEdit']);

            //mock state related stuff
            mockState = jasmine.createSpyObj('$state', ['go']);
            mockState.current = {
                data: {
                    addVisitState: 'mock-state.new-visit',
                    editVisitState: 'mock-state.edit-visit'
                }
            };
            mockStateParams = {doctorId: "doctor-123"};

            //mock users related stuff
            mockUsersService = jasmine.createSpyObj('mockUsersService', ['get', 'search']);
            userPromise = {};
            userPromise.error = function (f) {
                userPromise.onError = f;
                return userPromise;
            };
            userPromise.then = function (success, error) {
                userPromise.onSuccess = success;
                userPromise.onError = error;
                return userPromise;
            };
            mockUsersService.get.andReturn(userPromise);
            mockUsersService.search.andReturn(userPromise);
            mockSession = jasmine.createSpyObj('mockSession', ['getUserId', 'getInfo']);

            //mock others
            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            var mockLog = jasmine.createSpyObj('mockLog', ['debug', 'info', 'error']);

            //inject mocks
            $controller('EditEventCtrl', {
                $scope: ctrlScope,
                $log: mockLog,
                $state: mockState,
                $stateParams: mockStateParams,
                $q: mockQ,
                Session: mockSession,
                CalendarService: mockCalendarService,
                EventActionManager: mockEventActionManager,
                EventUtils: $injector.get('EventUtils'),
                CALENDAR_EVENTS: $injector.get('CALENDAR_EVENTS'),
                UsersService: mockUsersService,
                UserUtils: $injector.get('UserUtils'),
                uiNotification: mockUiNotification
            });

        }));

        describe('event edition for doctors-spec:', function () {

            var currentUserId, doctor;

            beforeEach(function () {
                currentUserId = 'doctor-123';
                mockStateParams.doctorId = currentUserId;
                mockSession.getUserId.andReturn(currentUserId);
                doctor = {
                    id: 'doctor-123',
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
                            ],
                            templates: [
                                {
                                    id: "546c1fd1ef660df8526005b1",
                                    name: "Ass examination",
                                    description: "Details go here...",
                                    durations: [30, 60]
                                },
                                {
                                    id: "546c1fd1ef660df8526005b2",
                                    name: "Eye examination",
                                    description: "Details go here...",
                                    durations: [30]
                                }
                            ]
                        }
                    ]
                };
            });

            it('should prepare existing event for edition', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and existing event
                var event = {
                    id: 'event-123',
                    start: Date.today().set({
                        year: 2014,
                        month: 11,
                        day: 15,
                        hour: 8,
                        minute: 30,
                        second: 0
                    }),
                    end: Date.today().set({
                        year: 2014,
                        month: 11,
                        day: 15,
                        hour: 9,
                        minute: 0,
                        second: 0
                    }),
                    doctor: {
                        id: 'doctor-123',
                        first_name: 'Zbigniew',
                        last_name: 'Religa'
                    },
                    patient: {
                        id: 'patient-123',
                        first_name: 'Johnny',
                        last_name: 'Bravo'
                    }
                };
                mockStateParams.eventId = event.id;

                //when initializing editor
                ctrlScope.init();

                //then info about doctor is about to be loaded
                expect(ctrlScope.isOwner).toBe(true);
                expect(mockUsersService.get).toHaveBeenCalledWith(currentUserId);
                //and edited event is about to be loaded
                expect(mockCalendarService.event).toHaveBeenCalledWith(event.id);
                mockQ.onSuccess([{data: doctor}, {data: event}]);
                expect(ctrlScope.doctor).toEqual(doctor);
                expect(ctrlScope.editedEvent).toEqual(event);
                //and access rights are properly granted
                expect(mockEventActionManager.canCancel).toHaveBeenCalledWith(event);
                expect(mockEventActionManager.canEdit).toHaveBeenCalledWith(event);
                //and patient is properly formatted
                expect(ctrlScope.editedEvent.patient.toString()).toBe('Bravo, Johnny');
                //and location and templates are set properly
                expect(ctrlScope.location.name).toBe('Pulsantis');
                var viewTempl = angular.copy(doctor.locations[0].templates);
                viewTempl[0].srcName = viewTempl[0].name;
                viewTempl[1].srcName = viewTempl[1].name;
                expect(ctrlScope.templates).toEqual(viewTempl);
            });

            it('should prepare new event for edition with default start time', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.editedEvent = {};
                //and new event about to be created
                mockStateParams.eventId = null;
                //and start time is not set
                mockStateParams.startTime = null;

                //when initializing editor
                ctrlScope.init();

                //then info about doctor is about to be loaded
                expect(ctrlScope.isOwner).toBe(true);
                expect(mockUsersService.get).toHaveBeenCalledWith(currentUserId);
                //and new event is prepared
                expect(mockCalendarService.event).not.toHaveBeenCalled();
                mockQ.onSuccess([{data: doctor}, mockQ.value]);
                expect(ctrlScope.doctor).toEqual(doctor);

                expect(ctrlScope.editedEvent.start).not.toBeNull();
                expect(ctrlScope.editedEvent.end).not.toBeNull();
                expect(ctrlScope.editedEvent.duration).toBe(30);
                //and access rights are properly granted
                expect(mockEventActionManager.canCancel).toHaveBeenCalled();
                expect(mockEventActionManager.canEdit).toHaveBeenCalled();
                //and patient is properly formatted
                expect(ctrlScope.editedEvent.patient.toString()).toBe('');
                //and location and templates are set properly
                expect(ctrlScope.location).not.toBeNull();
                expect(ctrlScope.templates).not.toBeNull();
            });


            it('should prepare new event for edition with chosen start time', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.editedEvent = {};
                //and new event about to be created
                mockStateParams.eventId = null;
                //and start time is not set
                mockStateParams.startTime = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 12,
                    minute: 30,
                    second: 0
                });

                //when initializing editor
                ctrlScope.init();

                //then info about doctor is about to be loaded
                expect(ctrlScope.isOwner).toBe(true);
                expect(mockUsersService.get).toHaveBeenCalledWith(currentUserId);
                //and new event is prepared
                expect(mockCalendarService.event).not.toHaveBeenCalled();
                mockQ.onSuccess([{data: doctor}, mockQ.value]);
                expect(ctrlScope.doctor).toEqual(doctor);

                expect(ctrlScope.editedEvent.start.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-15 12:30');
                expect(ctrlScope.editedEvent.end.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-15 13:00');
                expect(ctrlScope.editedEvent.duration).toBe(30);
                //and access rights are properly granted
                expect(mockEventActionManager.canCancel).toHaveBeenCalled();
                expect(mockEventActionManager.canEdit).toHaveBeenCalled();
                //and patient is properly formatted
                expect(ctrlScope.editedEvent.patient.toString()).toBe('');
                //and location and templates are set properly
                expect(ctrlScope.location.name).toBe('Pulsantis');
                var viewTempl = angular.copy(doctor.locations[0].templates);
                viewTempl[0].srcName = viewTempl[0].name;
                viewTempl[1].srcName = viewTempl[1].name;
                expect(ctrlScope.templates).toEqual(viewTempl);
            });

            it('should inform user when editor cannot be initialized', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and existing event
                var event = {
                    id: 'event-123',
                    start: Date.today().set({
                        year: 2014,
                        month: 11,
                        day: 15,
                        hour: 8,
                        minute: 30,
                        second: 0
                    }),
                    end: Date.today().set({
                        year: 2014,
                        month: 11,
                        day: 15,
                        hour: 9,
                        minute: 0,
                        second: 0
                    }),
                    doctor: {
                        id: 'doctor-123',
                        first_name: 'Zbigniew',
                        last_name: 'Religa'
                    },
                    patient: {
                        id: 'patient-123',
                        first_name: 'Johnny',
                        last_name: 'Bravo'
                    }
                };
                mockStateParams.eventId = event.id;

                //when initializing editor
                ctrlScope.editedEvent = {};
                ctrlScope.init();

                //then info about doctor is about to be loaded
                expect(ctrlScope.isOwner).toBe(true);
                expect(mockUsersService.get).toHaveBeenCalledWith(currentUserId);
                //and edited event is about to be loaded
                expect(mockCalendarService.event).toHaveBeenCalledWith(event.id);
                mockQ.onError('Failed');
                expect(ctrlScope.doctor).not.toBeDefined();
                expect(ctrlScope.editedEvent).toEqual({});
                //and user is informed about failure
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Couldn\'t initialize editor');
            });

            it('should change event after calendar date change in working hours', inject(function (CALENDAR_EVENTS) {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                ctrlScope.isOwner = true;
                //and user can edit event
                ctrlScope.canEdit = true;
                //and currently edited event
                ctrlScope.editedEvent.title = 'doctors title';
                ctrlScope.editedEvent.start = null;
                ctrlScope.editedEvent.end = null;
                ctrlScope.isDateValid = null;

                //when date is changed on calendar
                var newStartTime = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 8,
                    minute: 30,
                    second: 0
                });
                $rootScope.$broadcast(CALENDAR_EVENTS.CALENDAR_TIME_PICKED, newStartTime);

                //then edited event is updated properly
                expect(ctrlScope.editedEvent.title).toBe('doctors title');
                expect(ctrlScope.editedEvent.start.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-15 08:30');
                expect(ctrlScope.editedEvent.end).toBeNull();
                expect(ctrlScope.isDateValid).toBe(true);
                expect(ctrlScope.location.name).toBe('Pulsantis');
                expect(ctrlScope.templates.length).toBe(2);
            }));

            it('should change event after calendar date change outside of working hours', inject(function (CALENDAR_EVENTS) {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                ctrlScope.isOwner = true;
                //and user can edit event
                ctrlScope.canEdit = true;
                //and currently edited event
                ctrlScope.editedEvent.title = 'doctors title';
                ctrlScope.editedEvent.start = null;
                ctrlScope.editedEvent.end = null;
                ctrlScope.isDateValid = null;

                //when date is changed on calendar
                var newStartTime = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 7,
                    minute: 30,
                    second: 0
                });
                $rootScope.$broadcast(CALENDAR_EVENTS.CALENDAR_TIME_PICKED, newStartTime);

                //then edited event is updated properly
                expect(ctrlScope.editedEvent.title).toBe('doctors title');
                expect(ctrlScope.editedEvent.start.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-15 07:30');
                expect(ctrlScope.editedEvent.end).toBeNull();
                expect(ctrlScope.isDateValid).toBe(true);
                expect(ctrlScope.location.name).toBe('');
                expect(ctrlScope.templates.length).toBe(1);
            }));

            it('should not change event after calendar date change if doctor cannot edit event', inject(function (CALENDAR_EVENTS) {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                ctrlScope.isOwner = true;
                //and user cannot edit event
                ctrlScope.canEdit = false;
                //and currently edited event
                ctrlScope.editedEvent.title = 'Ass examination';
                ctrlScope.editedEvent.start = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 8,
                    minute: 30,
                    second: 0
                });
                ctrlScope.editedEvent.end = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 9,
                    minute: 0,
                    second: 0
                });
                ctrlScope.isDateValid = null;

                //when date is changed on calendar
                var newStartTime = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 17,
                    hour: 7,
                    minute: 30,
                    second: 0
                });
                $rootScope.$broadcast(CALENDAR_EVENTS.CALENDAR_TIME_PICKED, newStartTime);

                //then edited event is updated properly
                expect(ctrlScope.editedEvent.title).toBe('Ass examination');
                expect(ctrlScope.editedEvent.start.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-15 08:30');
            }));

        });

        describe('event edition for patients-spec:', function () {

            var currentUserId, doctor;

            beforeEach(function () {
                currentUserId = 'patient-123';
                mockStateParams.doctorId = 'doctor-123';
                mockSession.getUserId.andReturn(currentUserId);
                mockSession.getInfo.andReturn({
                    id: currentUserId,
                    first_name: 'Johnny',
                    last_name: 'Bravo'
                });
                doctor = {
                    id: 'doctor-123',
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
                            ],
                            templates: [
                                {
                                    id: "546c1fd1ef660df8526005b1",
                                    name: "Ass examination",
                                    description: "Details go here...",
                                    durations: [30, 60]
                                },
                                {
                                    id: "546c1fd1ef660df8526005b2",
                                    name: "Eye examination",
                                    description: "Details go here...",
                                    durations: [30]
                                }
                            ]
                        }
                    ]
                };
            });

            it('should prepare existing event for edition', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and existing event
                var event = {
                    id: 'event-123',
                    start: Date.today().set({
                        year: 2014,
                        month: 11,
                        day: 15,
                        hour: 8,
                        minute: 30,
                        second: 0
                    }),
                    end: Date.today().set({
                        year: 2014,
                        month: 11,
                        day: 15,
                        hour: 9,
                        minute: 0,
                        second: 0
                    }),
                    doctor: {
                        id: 'doctor-123',
                        first_name: 'Zbigniew',
                        last_name: 'Religa'
                    },
                    patient: {
                        id: 'patient-123',
                        first_name: 'Johnny',
                        last_name: 'Bravo'
                    }
                };
                mockStateParams.eventId = event.id;

                //when initializing editor
                ctrlScope.init();

                //then info about doctor is about to be loaded
                expect(ctrlScope.isOwner).toBe(false);
                expect(mockUsersService.get).toHaveBeenCalledWith('doctor-123');
                //and edited event is about to be loaded
                expect(mockCalendarService.event).toHaveBeenCalledWith(event.id);
                mockQ.onSuccess([{data: doctor}, {data: event}]);
                expect(ctrlScope.doctor).toEqual(doctor);
                expect(ctrlScope.editedEvent).toEqual(event);
                //and access rights are properly granted
                expect(mockEventActionManager.canCancel).toHaveBeenCalledWith(event);
                expect(mockEventActionManager.canEdit).toHaveBeenCalledWith(event);
                //and patient is properly formatted
                expect(ctrlScope.editedEvent.patient.toString()).toBe('Bravo, Johnny');
                //and location and templates are set properly
                expect(ctrlScope.location.name).toBe('Pulsantis');
                var viewTempl = angular.copy(doctor.locations[0].templates);
                viewTempl[0].srcName = viewTempl[0].name;
                viewTempl[1].srcName = viewTempl[1].name;
                expect(ctrlScope.templates).toEqual(viewTempl);
            });

            it('should prepare new event for edition with default start time', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.editedEvent = {};
                //and new event about to be created
                mockStateParams.eventId = null;
                //and start time is not set
                mockStateParams.startTime = null;

                //when initializing editor
                ctrlScope.init();

                //then info about doctor is about to be loaded
                expect(ctrlScope.isOwner).toBe(false);
                expect(mockUsersService.get).toHaveBeenCalledWith('doctor-123');
                //and new event is prepared
                expect(mockCalendarService.event).not.toHaveBeenCalled();
                mockQ.onSuccess([{data: doctor}, mockQ.value]);
                expect(ctrlScope.doctor).toEqual(doctor);

                expect(ctrlScope.editedEvent.start).not.toBeNull();
                expect(ctrlScope.editedEvent.end).not.toBeNull();
                expect(ctrlScope.editedEvent.duration).not.toBeNull();
                //and access rights are properly granted
                expect(mockEventActionManager.canCancel).toHaveBeenCalled();
                expect(mockEventActionManager.canEdit).toHaveBeenCalled();
                //and patient is properly formatted
                expect(ctrlScope.editedEvent.patient.toString()).toBe('Bravo, Johnny');
                //and location and templates are set properly
                expect(ctrlScope.location).not.toBeNull();
                expect(ctrlScope.templates).not.toBeNull();
            });


            it('should prepare new event for edition with chosen start time', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.editedEvent = {};
                //and new event about to be created
                mockStateParams.eventId = null;
                //and start time is not set
                mockStateParams.startTime = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 12,
                    minute: 30,
                    second: 0
                });

                //when initializing editor
                ctrlScope.init();

                //then info about doctor is about to be loaded
                expect(ctrlScope.isOwner).toBe(false);
                expect(mockUsersService.get).toHaveBeenCalledWith('doctor-123');
                //and new event is prepared
                expect(mockCalendarService.event).not.toHaveBeenCalled();
                mockQ.onSuccess([{data: doctor}, mockQ.value]);
                expect(ctrlScope.doctor).toEqual(doctor);

                expect(ctrlScope.editedEvent.start.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-15 12:30');
                expect(ctrlScope.editedEvent.end.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-15 13:00');
                expect(ctrlScope.editedEvent.duration).toBe(30);
                //and access rights are properly granted
                expect(mockEventActionManager.canCancel).toHaveBeenCalled();
                expect(mockEventActionManager.canEdit).toHaveBeenCalled();
                //and patient is properly formatted
                expect(ctrlScope.editedEvent.patient.toString()).toBe('Bravo, Johnny');
                //and location and templates are set properly
                expect(ctrlScope.location.name).toBe('Pulsantis');
                var viewTempl = angular.copy(doctor.locations[0].templates);
                viewTempl[0].srcName = viewTempl[0].name;
                viewTempl[1].srcName = viewTempl[1].name;
                expect(ctrlScope.templates).toEqual(viewTempl);
            });

            it('should inform user when editor cannot be initialized', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and existing event
                var event = {
                    id: 'event-123',
                    start: Date.today().set({
                        year: 2014,
                        month: 11,
                        day: 15,
                        hour: 8,
                        minute: 30,
                        second: 0
                    }),
                    end: Date.today().set({
                        year: 2014,
                        month: 11,
                        day: 15,
                        hour: 9,
                        minute: 0,
                        second: 0
                    }),
                    doctor: {
                        id: 'doctor-123',
                        first_name: 'Zbigniew',
                        last_name: 'Religa'
                    },
                    patient: {
                        id: 'patient-123',
                        first_name: 'Johnny',
                        last_name: 'Bravo'
                    }
                };
                mockStateParams.eventId = event.id;

                //when initializing editor
                ctrlScope.editedEvent = {};
                ctrlScope.init();

                //then info about doctor is about to be loaded
                expect(ctrlScope.isOwner).toBe(false);
                expect(mockUsersService.get).toHaveBeenCalledWith('doctor-123');
                //and edited event is about to be loaded
                expect(mockCalendarService.event).toHaveBeenCalledWith(event.id);
                mockQ.onError('Failed');
                expect(ctrlScope.doctor).not.toBeDefined();
                expect(ctrlScope.editedEvent).toEqual({});
                //and user is informed about failure
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Couldn\'t initialize editor');
            });

            it('should change event after calendar date change in working hours', inject(function (CALENDAR_EVENTS) {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                ctrlScope.isOwner = false;
                //and user can edit event
                ctrlScope.canEdit = true;
                //and currently edited event
                ctrlScope.editedEvent.title = 'Ass examination';
                ctrlScope.editedEvent.start = null;
                ctrlScope.editedEvent.end = null;
                ctrlScope.isDateValid = null;

                //when date is changed on calendar
                var newStartTime = Date.today().add(5).days();
                $rootScope.$broadcast(CALENDAR_EVENTS.CALENDAR_TIME_PICKED, newStartTime);

                //then edited event is updated properly
                expect(ctrlScope.editedEvent.title).toBe('');
                expect(ctrlScope.editedEvent.start).toBe(newStartTime);
                expect(ctrlScope.editedEvent.end).toBeNull();
                expect(ctrlScope.isDateValid).toBe(true);
                expect(ctrlScope.location.name).toBe('');
                expect(ctrlScope.templates.length).toBe(1);
            }));

            it('should change event after calendar date change outside of working hours', inject(function (CALENDAR_EVENTS) {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                ctrlScope.isOwner = false;
                //and user can edit event
                ctrlScope.canEdit = true;
                //and currently edited event
                ctrlScope.editedEvent.title = 'Ass examination';
                ctrlScope.editedEvent.start = null;
                ctrlScope.editedEvent.end = null;
                ctrlScope.isDateValid = null;

                //when date is changed on calendar
                var newStartTime = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 8,
                    minute: 30,
                    second: 0
                });
                $rootScope.$broadcast(CALENDAR_EVENTS.CALENDAR_TIME_PICKED, newStartTime);

                //then edited event is updated properly
                expect(ctrlScope.editedEvent.title).toBe('Ass examination');
                expect(ctrlScope.editedEvent.start.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-15 08:30');
                expect(ctrlScope.editedEvent.end).toBeNull();
                expect(ctrlScope.isDateValid).toBe(false);
                expect(ctrlScope.location.name).toBe('Pulsantis');
                expect(ctrlScope.templates.length).toBe(2);
            }));

            it('should not change event after calendar date change if patient cannot edit event', inject(function (CALENDAR_EVENTS) {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                ctrlScope.isOwner = false;
                //and user cannot edit event
                ctrlScope.canEdit = false;
                //and currently edited event
                ctrlScope.editedEvent.title = 'Ass examination';
                ctrlScope.editedEvent.start = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 8,
                    minute: 30,
                    second: 0
                });
                ctrlScope.editedEvent.end = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 9,
                    minute: 0,
                    second: 0
                });
                ctrlScope.isDateValid = null;

                //when date is changed on calendar
                var newStartTime = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 17,
                    hour: 7,
                    minute: 30,
                    second: 0
                });
                $rootScope.$broadcast(CALENDAR_EVENTS.CALENDAR_TIME_PICKED, newStartTime);

                //then edited event is updated properly
                expect(ctrlScope.editedEvent.title).toBe('Ass examination');
                expect(ctrlScope.editedEvent.start.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-15 08:30');
            }));

            it('should refresh duration time after template changed', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and templates
                ctrlScope.templates = doctor.locations[0].templates;
                //and duration set for event
                ctrlScope.editedEvent.duration = 120;
                ctrlScope.durations = undefined;

                //when template is changed
                ctrlScope.editedEvent.title = 'Ass examination';
                ctrlScope.onTemplateChange();

                //then duration time is refreshed
                expect(ctrlScope.durations).toEqual([30, 60]);
                expect(ctrlScope.editedEvent.duration).toBe(30);
            });

        });

        describe('editor options-spec:', function () {

            var currentUserId, doctor;

            beforeEach(function () {
                currentUserId = 'patient-123';
                mockStateParams.doctorId = 'doctor-123';
                mockSession.getUserId.andReturn(currentUserId);
                mockSession.getInfo.andReturn({
                    id: currentUserId,
                    first_name: 'Johnny',
                    last_name: 'Bravo'
                });
                doctor = {
                    id: 'doctor-123',
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
                            ],
                            templates: [
                                {
                                    id: "546c1fd1ef660df8526005b1",
                                    name: "Ass examination",
                                    description: "Details go here...",
                                    durations: [30, 60]
                                },
                                {
                                    id: "546c1fd1ef660df8526005b2",
                                    name: "Eye examination",
                                    description: "Details go here...",
                                    durations: [30]
                                }
                            ]
                        }
                    ]
                };
            });

            it('should find users for typing ahead', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                ctrlScope.isOwner = true;
                //and user can edit event
                ctrlScope.canEdit = true;

                //when typing user's name
                ctrlScope.findUsers('Zbi');

                //then users search is started
                expect(mockUsersService.search).toHaveBeenCalledWith('Zbi');

                //and results if returned are properly formatted
                var foundUsers = [
                    {
                        first_name: 'Zbigniew',
                        last_name: 'Religa',
                        email: 'zbysiu@kunishu.com'
                    }
                ];
                userPromise.onSuccess({data: foundUsers});
                expect(foundUsers[0].toString()).toBe('Religa, Zbigniew (zbysiu@kunishu.com)');
            });

            it('should inform user when user type-ahead is not working', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                ctrlScope.isOwner = true;
                //and user can edit event
                ctrlScope.canEdit = true;

                //when typing user's name
                ctrlScope.findUsers('Zbi');

                //then users search is started
                expect(mockUsersService.search).toHaveBeenCalledWith('Zbi');

                //and  user is informed if error occurred while searched
                userPromise.onError('FAILURE');
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Couldn\'t find users');
            });

            it('should change event duration after template change', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                ctrlScope.isOwner = true;
                //and user can edit event
                ctrlScope.canEdit = true;
                //and current durations
                ctrlScope.durations = [];
                //and templates
                ctrlScope.templates = doctor.locations[0].templates;

                //when event template is changed
                ctrlScope.editedEvent.title = 'Ass examination';
                ctrlScope.onTemplateChange();

                //then durations are updated
                expect(ctrlScope.durations).toEqual([30, 60]);
            });

        });

        describe('saving editor changes-spec:', function () {

            var currentUserId, doctor;

            beforeEach(function () {
                currentUserId = 'patient-123';
                mockStateParams.doctorId = 'doctor-123';
                mockSession.getUserId.andReturn(currentUserId);
                mockSession.getInfo.andReturn({
                    id: currentUserId,
                    first_name: 'Johnny',
                    last_name: 'Bravo'
                });
                doctor = {
                    id: 'doctor-123',
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
                            ],
                            templates: [
                                {
                                    id: "546c1fd1ef660df8526005b1",
                                    name: "Ass examination",
                                    description: "Details go here...",
                                    durations: [30, 60]
                                },
                                {
                                    id: "546c1fd1ef660df8526005b2",
                                    name: "Eye examination",
                                    description: "Details go here...",
                                    durations: [30]
                                }
                            ]
                        }
                    ]
                };
            });

            it('should go to previous page after cancelling edition', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                //and previous page
                mockState.previous = {
                    state: {name: 'visit-search'},
                    params: {id: '123', criteria: 'name'}
                };

                //when cancelling edition
                ctrlScope.cancel();

                //then user is redirected to previous page
                expect(mockState.go).toHaveBeenCalledWith('visit-search', {id: '123', criteria: 'name'});
            });

            it('should save changes from editor', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                //and previous page
                mockState.previous = {
                    state: {name: 'visit-search'},
                    params: {id: '123', criteria: 'name'}
                };
                //and edited events data
                ctrlScope.editedEvent.start = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 8,
                    minute: 30,
                    second: 0
                });
                ctrlScope.editedEvent.end = null;
                ctrlScope.editedEvent.duration = 60;

                //when saving changes
                ctrlScope.save();

                //then before save proper end date is set
                expect(ctrlScope.editedEvent.end.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-15 09:30');
                //and changes are saved
                expect(mockCalendarService.save).toHaveBeenCalledWith(ctrlScope.editedEvent);
                calendarPromise.onSuccess('SAVED');
                //and user is redirected to previous page after save confirmation
                expect(mockState.go).toHaveBeenCalledWith('visit-search', {id: '123', criteria: 'name'}, {reload:true});
            });

            it('should inform user when changes couldn\'t be saved', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                //and previous page
                mockState.previous = {
                    state: {name: 'visit-search'},
                    params: {id: '123', criteria: 'name'}
                };
                //and edited events data
                ctrlScope.editedEvent.start = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 8,
                    minute: 30,
                    second: 0
                });
                ctrlScope.editedEvent.end = null;
                ctrlScope.editedEvent.duration = 60;

                //when saving changes
                ctrlScope.save();

                //then before save proper end date is set
                expect(ctrlScope.editedEvent.end.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-15 09:30');
                //and changes are saved
                expect(mockCalendarService.save).toHaveBeenCalledWith(ctrlScope.editedEvent);
                calendarPromise.onError('ERROR');
                //and user is informed properly when save has failed
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Event hasn\'t been saved');
            });

            it('should cancel event', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                //and previous page
                mockState.previous = {
                    state: {name: 'visit-search'},
                    params: {id: '123', criteria: 'name'}
                };
                //and edited events data
                ctrlScope.editedEvent.start = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 8,
                    minute: 30,
                    second: 0
                });
                ctrlScope.editedEvent.end = null;
                ctrlScope.editedEvent.duration = 60;
                //and even can be cancelled
                mockEventActionManager.canCancel.andReturn(true);

                //when cancelling event
                ctrlScope.cancelVisit();

                //then event is cancelled
                expect(mockCalendarService.cancel).toHaveBeenCalledWith(ctrlScope.editedEvent);
                calendarPromise.onSuccess('CANCELLED');
                //and user is redirected to previous page after cancel confirmation
                expect(mockState.go).toHaveBeenCalledWith('visit-search', {id: '123', criteria: 'name'}, {reload:true});
            });

            it('should inform user when event couldn\'t be cancelled', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                //and previous page
                mockState.previous = {
                    state: {name: 'visit-search'},
                    params: {id: '123', criteria: 'name'}
                };
                //and edited events data
                ctrlScope.editedEvent.start = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 8,
                    minute: 30,
                    second: 0
                });
                ctrlScope.editedEvent.end = null;
                ctrlScope.editedEvent.duration = 60;
                //and even can be cancelled
                mockEventActionManager.canCancel.andReturn(true);

                //when cancelling event
                ctrlScope.cancelVisit();

                //then event is cancelled
                expect(mockCalendarService.cancel).toHaveBeenCalledWith(ctrlScope.editedEvent);
                calendarPromise.onError('ERROR');
                //and user is informed properly when cancellation has failed
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Event hasn\'t been cancelled');
            });

            it('should inform user if cancellation of event is not allowed', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                //and previous page
                mockState.previous = {
                    state: {name: 'visit-search'},
                    params: {id: '123', criteria: 'name'}
                };
                //and edited events data
                ctrlScope.editedEvent.start = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 8,
                    minute: 30,
                    second: 0
                });
                ctrlScope.editedEvent.end = null;
                ctrlScope.editedEvent.duration = 60;
                //and even cannot be cancelled
                mockEventActionManager.canCancel.andReturn(false);

                //when cancelling event
                ctrlScope.cancelVisit();

                //then user is informed that operation is prohibited
                expect(mockUiNotification.error).toHaveBeenCalled();
                expect(mockUiNotification.title).toBe('Error');
                expect(mockUiNotification.msg).toBe('Event cannot be cancelled');
            });

        });

        describe('template translations-spec:', function () {

            var currentUserId, doctor;

            beforeEach(function () {
                currentUserId = 'doctor-123';
                mockStateParams.doctorId = currentUserId;
                mockSession.getUserId.andReturn(currentUserId);
                doctor = {
                    id: 'doctor-123',
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
                            ],
                            templates: [
                                {
                                    id: "546c1fd1ef660df8526005b1",
                                    name: "$$temp-1",
                                    description: "Details go here...",
                                    durations: [30, 60]
                                },
                                {
                                    id: "546c1fd1ef660df8526005b2",
                                    name: "Eye examination",
                                    description: "Details go here...",
                                    durations: [30]
                                }
                            ]
                        }
                    ]
                };
            });

            it('should translate templates', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                //and doctor templates

                //and existing event
                var event = {
                    id: 'event-123',
                    start: Date.today().set({
                        year: 2014,
                        month: 11,
                        day: 15,
                        hour: 8,
                        minute: 30,
                        second: 0
                    }),
                    end: Date.today().set({
                        year: 2014,
                        month: 11,
                        day: 15,
                        hour: 9,
                        minute: 0,
                        second: 0
                    }),
                    doctor: {
                        id: 'doctor-123',
                        first_name: 'Zbigniew',
                        last_name: 'Religa'
                    },
                    patient: {
                        id: 'patient-123',
                        first_name: 'Johnny',
                        last_name: 'Bravo'
                    }
                };
                mockStateParams.eventId = event.id;

                //when initializing editor
                ctrlScope.init();

                //then info about doctor is about to be loaded
                expect(ctrlScope.isOwner).toBe(true);
                expect(mockUsersService.get).toHaveBeenCalledWith(currentUserId);
                //and edited event is about to be loaded
                expect(mockCalendarService.event).toHaveBeenCalledWith(event.id);
                mockQ.onSuccess([{data: doctor}, {data: event}]);
                expect(ctrlScope.doctor).toEqual(doctor);
                expect(ctrlScope.editedEvent).toEqual(event);
                //and access rights are properly granted
                expect(mockEventActionManager.canCancel).toHaveBeenCalledWith(event);
                expect(mockEventActionManager.canEdit).toHaveBeenCalledWith(event);
                //and patient is properly formatted
                expect(ctrlScope.editedEvent.patient.toString()).toBe('Bravo, Johnny');
                //and location and templates are set properly
                expect(ctrlScope.location.name).toBe('Pulsantis');
                //and templates are translated
                var viewTempl = angular.copy(doctor.locations[0].templates);
                viewTempl[0].srcName = viewTempl[0].name;
                viewTempl[0].name = 'templates.' + viewTempl[0].name;
                viewTempl[1].srcName = viewTempl[1].name;
                expect(ctrlScope.templates).toEqual(viewTempl);
            });

            it('should save translated template with its key as title', function () {
                //given controller is defined
                expect(ctrlScope).toBeDefined();
                ctrlScope.doctor = doctor;
                //and doctor's templates
                var viewTempl = angular.copy(doctor.locations[0].templates);
                viewTempl[0].srcName = viewTempl[0].name;
                viewTempl[0].name = 'templates.' + viewTempl[0].name;
                viewTempl[1].srcName = viewTempl[1].name;
                ctrlScope.templates = viewTempl;
                //and previous page
                mockState.previous = {
                    state: {name: 'visit-search'},
                    params: {id: '123', criteria: 'name'}
                };
                //and edited events data
                ctrlScope.editedEvent.start = Date.today().set({
                    year: 2014,
                    month: 11,
                    day: 15,
                    hour: 8,
                    minute: 30,
                    second: 0
                });
                ctrlScope.editedEvent.end = null;
                ctrlScope.editedEvent.duration = 60;
                //event has title of one of translated templates
                ctrlScope.templates[0].name = 'translated template';
                ctrlScope.editedEvent.title = ctrlScope.templates[0].name;

                //when saving changes
                ctrlScope.save();

                //then before save proper end date is set
                expect(ctrlScope.editedEvent.end.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-15 09:30');
                //and template key is set as title of saved event
                var event = angular.copy(ctrlScope.editedEvent);
                event.title = ctrlScope.templates[0].srcName;
                expect(mockCalendarService.save).toHaveBeenCalledWith(event);
                //and changes are saved
                calendarPromise.onSuccess('SAVED');
                //and user is redirected to previous page after save confirmation
                expect(mockState.go).toHaveBeenCalledWith('visit-search', {id: '123', criteria: 'name'}, {reload:true});
            });

        });

    });

    describe('DisplayEventCtrl-spec:', function () {

        var mockController, mockCtrlState;

        //prepare controller for testing
        beforeEach(inject(function ($controller, $injector, _$rootScope_) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            $rootScope = _$rootScope_;

            //mock calendar related stuff
            mockCalendarService = jasmine.createSpyObj('mockCalendarService', ['event']);
            calendarPromise = {};
            calendarPromise.error = function (f) {
                calendarPromise.onError = f;
                return calendarPromise;
            };
            calendarPromise.success = function (f) {
                calendarPromise.onSuccess = f;
                return calendarPromise;
            };
            mockCalendarService.event.andReturn(calendarPromise);

            //mock state related stuff
            mockStateParams = {};

            //mock others
            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            var mockLog = jasmine.createSpyObj('mockLog', ['debug', 'info', 'error']);
            mockCtrlState = {};
            mockController = function (name, state) {
                mockCtrlState.name = name;
                mockCtrlState.state = state;
            };

            //inject mocks
            $controller('DisplayEventCtrl', {
                $scope: ctrlScope,
                $log: mockLog,
                $stateParams: mockStateParams,
                CalendarService: mockCalendarService,
                uiNotification: mockUiNotification,
                $controller: mockController
            });

        }));

        it('should initialize controller', function () {
            //given controller is defined
            expect(ctrlScope).toBeDefined();

            //then controller is initialized properly
            expect(mockCtrlState.name).toBe('TimelineEventCtrl');
            expect(mockCtrlState.state).not.toBeNull();
        });

        it('should display event details', function () {
            //given controller is defined
            expect(ctrlScope).toBeDefined();
            //and event to be displayed
            mockStateParams.eventId = 'event-123';
            //and sample event
            var event = {
                id: 'event-123',
                start: '2014-12-16 10:30',
                end: '2014-12-16 11:30'
            };

            //when loading info about event
            ctrlScope.load(mockStateParams.eventId);

            //then info is loaded
            expect(mockCalendarService.event).toHaveBeenCalledWith(mockStateParams.eventId);
            calendarPromise.onSuccess(event);
            //and info is properly formatted
            expect(ctrlScope.event.id).toBe('event-123');
            expect(ctrlScope.event.start.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-16 10:30');
            expect(ctrlScope.event.end.toString('yyyy-MM-dd HH:mm')).toBe('2014-12-16 11:30');
        });

        it('should inform user when info about even cannot be displayed', function () {
            //given controller is defined
            expect(ctrlScope).toBeDefined();
            //and event to be displayed
            mockStateParams.eventId = 'event-123';
            //and sample event
            var event = {
                id: 'event-123',
                start: '2014-12-16 10:30',
                end: '2014-12-16 11:30'
            };

            //when loading info about event
            ctrlScope.load(mockStateParams.eventId);

            //then info is loaded
            expect(mockCalendarService.event).toHaveBeenCalledWith(mockStateParams.eventId);
            calendarPromise.onError('Error');
            //and user is informed if into cannot be displayed
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('Couldn\'t load event details');
        });

    });

});