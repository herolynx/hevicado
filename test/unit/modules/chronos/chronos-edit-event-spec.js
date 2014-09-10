'use strict';

describe('chronos-edit-event-spec:', function () {

    var mockModalInstance, mockEventToEdit, mockOptions, mockCalendarService, mockUiNotification, mockLog;
    var controller;

    //prepare module for testing
    beforeEach(angular.mock.module('chronos'));

    //prepare controller for testing
    beforeEach(function () {
        //mock dependencies
        mockModalInstance = jasmine.createSpyObj('mockModalInstance', ['close', 'dismiss']);
        mockCalendarService = jasmine.createSpyObj('mockCalendarService', ['save', 'delete']);
        mockLog = jasmine.createSpyObj('mockLog', ['debug', 'info']);
        mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text']);
        //preapre controller
        controller = {};
    });

    describe('initialization of editEventCtrl:', function () {

        it('should prepare event for editing', function () {
            //given event to be edited
            mockEventToEdit = {
                id: 'event-123'
            };
            //and options available for edited event
            mockOptions = {
                durations: [15, 30]
            };
            //and edit event controller is defined
            expect(editEventCtrl).toBeDefined();
            //when initializing controller
            editEventCtrl(controller, mockModalInstance, mockEventToEdit, mockOptions, mockCalendarService, mockUiNotification, mockLog);
            //then controller is prepared for editing event
            expect(controller.editedEvent).toBe(mockEventToEdit);
            //and event options are set
            expect(controller.durations).toBe(mockOptions.durations);
            //and controller rights are set
            expect(controller.isButtonDeleteVisible).toBe(true);
            expect(controller.isButtonSaveVisible).toBe(true);
        });

        it('should prepare event for creation', function () {
            //given event to be edited
            mockEventToEdit = {
                start: new Date().set({
                    year: 2014,
                    month: 7,
                    day: 12,
                    hour: 0,
                    minute: 0
                })
            };
            //and options available for edited event
            mockOptions = {
                durations: [15, 30],
                owner: 'owner-123',
                users: ['user-1', 'user-2'],
                location: {
                    address: {
                        street: "Grabiszynska 8/4",
                        city: "Wroclaw"
                    },
                    color: 'blue'
                },
                templates: [
                    {
                        id: "temp-123",
                        name: "Examination",
                        description: "Details go here...",
                        locationIds: ["loc-123"],
                        durations: [15, 30, 45]
                    }
                ]
            };
            //and edit event controller is defined
            expect(editEventCtrl).toBeDefined();
            //when initializing controller
            editEventCtrl(controller, mockModalInstance, mockEventToEdit, mockOptions, mockCalendarService, mockUiNotification, mockLog);
            //then controller is prepared for creating event
            expect(controller.editedEvent).not.toBe(mockEventToEdit);
            //and new event has proper fields initialized
            expect(controller.editedEvent.title).toBe(mockOptions.templates[0].name);
            expect(controller.editedEvent.description).toBe(mockOptions.templates[0].description);
            expect(controller.editedEvent.start).toBe(mockEventToEdit.start);
            expect(controller.editedEvent.duration).toBe(mockOptions.durations[0]);
            expect(controller.editedEvent.location).toBe(mockOptions.location.address);
            expect(controller.editedEvent.owner).toBe(mockOptions.owner);
            expect(controller.editedEvent.users).toBe(mockOptions.users);
            expect(controller.editedEvent.color).toBe(mockOptions.location.color);
            //and event options are set
            expect(controller.durations).toBe(mockOptions.durations);
            //and controller rights are set
            expect(controller.isButtonDeleteVisible).toBe(false);
            expect(controller.isButtonSaveVisible).toBe(true);
        });

    });

    describe('actions on editEventCtrl:', function () {

        var mockEventBus = {};

        //prepare controller for testing
        beforeEach(function () {
            //sample event to be edit
            mockEventToEdit = {
                id: 'event-123'
            };
            //sample options for edition
            mockOptions = {
                durations: [15, 30]
            };
            //initialize controller
            editEventCtrl(controller, mockModalInstance, mockEventToEdit, mockOptions, mockCalendarService, mockUiNotification, mockLog);
            //mock event bus
            controller.$emit = function (event, data) {
                mockEventBus.event = event;
                mockEventBus.data = data;
            };
        });

        it('should delete event', function () {
            //given controller is initialized
            expect(editEventCtrl).toBeDefined();
            expect(controller).toBeDefined();
            expect(controller.editedEvent).toBe(mockEventToEdit);
            //and delete option is available
            var promise = {
                then: function (f) {
                    promise.deffered = f;
                }
            };
            mockCalendarService.delete = function (event) {
                mockCalendarService.eventDeleted = true;
                return promise;
            };
            //when deleting event
            controller.delete();
            promise.deffered();
            //then event is deleted successfully
            expect(mockCalendarService.eventDeleted).toBe(true);
            //and proper event is sent broadcasted via event-bus
            expect(mockEventBus.event).toBe('EVENT_DELETED');
            expect(mockEventBus.data).toBe(mockEventToEdit);
            //and modal window is closed
            expect(mockModalInstance.close).toHaveBeenCalledWith('EVENT_DELETED');
        });
    });

});