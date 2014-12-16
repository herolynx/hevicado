'use strict';

describe('chronos.events.edit-spec:', function () {

    var mockCalendarService, mockEventActionManager, mockCalendarEvents;
    var mockUsersService, mockSession;
    var mockUiNotification, mockLog;
    var mockState, mockStateParams;
    var $rootScope, ctrlScope, calendarPromise, userPromise, allPromise, mockQ;

    //prepare module for testing
    beforeEach(angular.mock.module('chronos'));

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
            mockUsersService = jasmine.createSpyObj('mockUsersService', ['get']);
            userPromise = {};
            userPromise.error = function (f) {
                userPromise.onError = f;
                return userPromise;
            };
            mockUsersService.get.andReturn(userPromise);
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
                                    end: "10:00"
                                },
                                {
                                    day: "Monday",
                                    start: "12:00",
                                    end: "14:00"
                                },
                                {
                                    day: "Tuesday",
                                    start: "08:00",
                                    end: "16:00"
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
                }
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
                //and location and template are set properly
                expect(ctrlScope.location.name).toBe('Pulsantis');
                expect(ctrlScope.templates).toEqual(doctor.locations[0].templates);
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
                //and location and template are set properly
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
                //and location and template are set properly
                expect(ctrlScope.location.name).toBe('Pulsantis');
                expect(ctrlScope.templates).toEqual(doctor.locations[0].templates);
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
                //and user can edit event
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
                                    end: "10:00"
                                },
                                {
                                    day: "Monday",
                                    start: "12:00",
                                    end: "14:00"
                                },
                                {
                                    day: "Tuesday",
                                    start: "08:00",
                                    end: "16:00"
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
                }
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
                //and location and template are set properly
                expect(ctrlScope.location.name).toBe('Pulsantis');
                expect(ctrlScope.templates).toEqual(doctor.locations[0].templates);
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
                //and location and template are set properly
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
                //and location and template are set properly
                expect(ctrlScope.location.name).toBe('Pulsantis');
                expect(ctrlScope.templates).toEqual(doctor.locations[0].templates);
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
                //and user can edit event
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

    });

});