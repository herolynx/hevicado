'use strict';

describe('chronos.events.edit-spec:', function () {

    var mockModalInstance, mockEventEditor, mockOptions, mockCalendarService, mockUiNotification, mockLog;
    var ctrlScope, calendarPromise;

    //prepare module for testing
    beforeEach(angular.mock.module('chronos.events.edit'));

    describe('EditEventCtrl-spec:', function () {

//        //prepare controller for testing
//        beforeEach(inject(function ($controller, $injector, _$rootScope_) {
//            //prepare controller for testing
//            ctrlScope = _$rootScope_.$new();
//            //mock dependencies
//            mockCalendarService = jasmine.createSpyObj('mockCalendarService', ['delete', 'save']);
//            calendarPromise = {
//                success: function (f) {
//                    calendarPromise.onSuccess = f;
//                    return calendarPromise;
//                },
//                error: function (f) {
//                    calendarPromise.onError = f;
//                    return calendarPromise;
//                }
//            };
//            mockCalendarService.delete.andReturn(calendarPromise);
//            mockCalendarService.save.andReturn(calendarPromise);
//            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
//            mockUiNotification.text = function (title, msg) {
//                mockUiNotification.title = title;
//                mockUiNotification.msg = msg;
//                return mockUiNotification;
//            };
//            mockEventEditor = jasmine.createSpyObj('EventEditor', ['cancel', 'endEdition', 'onChange']);
//            mockEventEditor.options = { durations: []};
//            var mockLog = jasmine.createSpyObj('mockLog', ['debug', 'info', 'error']);
//            //inject mocks
//            $controller('EditEventCtrl', {
//                $scope: ctrlScope,
//                $log: mockLog,
//                EventEditor: mockEventEditor,
//                CalendarService: mockCalendarService,
//                uiNotification: mockUiNotification
//            });
//        }));
//
//        it('should initialize controller', function () {
//            //given sample event to be edited
//            var mockEvent = {title: 'sampleEvent'};
//            mockEventEditor.event = mockEvent;
//            //and possible durations of edited event
//            var durations = [15, 30];
//            mockEventEditor.options = { durations: durations};
//            //when new controller is created
//            ctrlScope.init();
//            //then controller is prepared for editing event
//            expect(ctrlScope.editedEvent).toBe(mockEvent);
//            expect(ctrlScope.durations).toBe(durations);
//            //and controller is watching changed of edited event
//            expect(mockEventEditor.onChange).toBeDefined();
//        });
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