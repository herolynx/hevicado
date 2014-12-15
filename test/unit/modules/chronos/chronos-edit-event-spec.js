'use strict';

describe('chronos.events.edit-spec:', function () {

    var mockCalendarService, mockEventActionManager, mockCalendarEvents;
    var mockUsersService, mockSession;
    var mockUiNotification, mockLog;
    var mockState, mockStateParams;
    var ctrlScope, calendarPromise, userPromise, allPromise, mockQ;

    //prepare module for testing
    beforeEach(angular.mock.module('chronos'));

    describe('EditEventCtrl-spec:', function () {

        //prepare controller for testing
        beforeEach(inject(function ($controller, $injector, _$rootScope_) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
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
                return allPromise;
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

        });

//
//
//        it('should delete event', function () {
//            //given controller is initialized
//            expect(ctrlScope).toBeDefined();
//            //and sample event
//            var mockEventToEdit = {
//                id: 'event-123',
//                start: new Date().set({
//                    year: 2014,
//                    month: 7,
//                    day: 12,
//                    hour: 12,
//                    minute: 0,
//                    second: 0
//                }),
//                duration: 15
//            };
//            ctrlScope.editedEvent = mockEventToEdit;
//            //and delete option is available
//            var promise = {
//                then: function (f) {
//                    promise.deffered = f;
//                }
//            };
//            mockCalendarService.delete = function (event) {
//                mockCalendarService.eventDeleted = true;
//                return promise;
//            };
//            //when deleting event
//            ctrlScope.delete();
//            //and event is deleted successfully on back-end side
//            promise.deffered();
//            expect(mockCalendarService.eventDeleted).toBe(true);
//            //then deletion of event is completed
//            expect(mockEventEditor.endEdition).toHaveBeenCalled();
//        });
//
//        it('should notify user when event is not deleted', function () {
//            //given controller is initialized
//            expect(ctrlScope).toBeDefined();
//            //and sample event
//            var mockEventToEdit = {
//                id: 'event-123',
//                start: new Date().set({
//                    year: 2014,
//                    month: 7,
//                    day: 12,
//                    hour: 12,
//                    minute: 0,
//                    second: 0
//                }),
//                duration: 15
//            };
//            ctrlScope.editedEvent = mockEventToEdit;
//            //and delete option is available
//            var promise = {
//                then: function (f, e) {
//                    promise.success = f;
//                    promise.fail = e;
//                }
//            };
//            mockCalendarService.delete = function (event) {
//                return promise;
//            };
//            //when deleting event
//            ctrlScope.delete();
//            //and event is not deleted on back-end side
//            mockUiNotification.text = function (title, msg) {
//                mockUiNotification.title = title;
//                mockUiNotification.msg = msg;
//                return mockUiNotification;
//            };
//            promise.fail('Error code', {
//                data: 'Error message'
//            });
//            //then edition of event is not finished
//            expect(mockEventEditor.endEdition).not.toHaveBeenCalled();
//            //and user is informed about failure
//            expect(mockUiNotification.error).toHaveBeenCalled();
//            expect(mockUiNotification.title).toBe('Error');
//            expect(mockUiNotification.msg).toBe('Event hasn\'t been deleted');
//        });
//
//        it('should save event', function () {
//            //given controller is initialized
//            expect(ctrlScope).toBeDefined();
//            //and sample event
//            var mockEventToEdit = {
//                id: 'event-123',
//                start: new Date().set({
//                    year: 2014,
//                    month: 7,
//                    day: 12,
//                    hour: 12,
//                    minute: 0,
//                    second: 0
//                }),
//                duration: 15
//            };
//            ctrlScope.editedEvent = mockEventToEdit;
//            //and save option is available
//            var promise = {
//                then: function (f) {
//                    promise.deffered = f;
//                }
//            };
//            mockCalendarService.save = function (event) {
//                mockCalendarService.eventSaved = true;
//                return promise;
//            };
//            //when saving event
//            ctrlScope.save();
//            //and event is saved successfully on back-end side
//            promise.deffered({
//                data: {
//                    id: mockEventToEdit.id
//                }
//            });
//            expect(mockCalendarService.eventSaved).toBe(true);
//            expect(mockEventToEdit.end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-08-12 12:15:00');
//            //then event edition is completed
//            expect(mockEventEditor.endEdition).toHaveBeenCalled();
//        });
//
//        it('should notify user when event is not saved', function () {
//            //given controller is initialized
//            expect(ctrlScope).toBeDefined();
//            //and sample event
//            var mockEventToEdit = {
//                id: 'event-123',
//                start: new Date().set({
//                    year: 2014,
//                    month: 7,
//                    day: 12,
//                    hour: 12,
//                    minute: 0,
//                    second: 0
//                }),
//                duration: 15
//            };
//            ctrlScope.editedEvent = mockEventToEdit;
//            //and save option is available
//            var promise = {
//                then: function (f, e) {
//                    promise.success = f;
//                    promise.fail = e;
//                }
//            };
//            mockCalendarService.save = function (event) {
//                return promise;
//            };
//            //when saving event
//            ctrlScope.save();
//            //and event is not saved on back-end side
//            mockUiNotification.text = function (title, msg) {
//                mockUiNotification.title = title;
//                mockUiNotification.msg = msg;
//                return mockUiNotification;
//            };
//            promise.fail('Error code', {
//                data: 'Error message'
//            });
//            //then event edition is not finished
//            expect(mockEventEditor.endEdition).not.toHaveBeenCalled();
//            //and user is informed about failure
//            expect(mockUiNotification.error).toHaveBeenCalled();
//            expect(mockUiNotification.title).toBe('Error');
//            expect(mockUiNotification.msg).toBe('Event hasn\'t been saved');
//        });
//
    });

});