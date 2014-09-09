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

    });

});