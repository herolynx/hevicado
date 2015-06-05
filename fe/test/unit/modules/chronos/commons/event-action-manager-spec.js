'use strict';

describe('event-action-manager-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos.commons'));

    beforeEach(function () {
        toUTCDate = function (value) {
            return typeof value != 'string' ? value : Date.parse(value);
        };
        toLocalDate = function (value) {
            return typeof value == 'string' ? Date.parse(value) : new Date(value);
        };
    });

    describe('EventActionManager-spec:', function () {

        var mockEventStates, mockSession;
        var eventActionManager, eventUtils;
        var currentUserId = "user-123";

        //prepare service for testing
        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockEventStates = jasmine.createSpyObj('EVENT_STATE', ['OPEN', 'CLOSED', 'CANCELLED']);
            mockEventStates.OPEN.key = 0;
            mockEventStates.CLOSED.key = 1;
            mockEventStates.CANCELLED.key = 2;
            $provide.value('EVENT_STATE', mockEventStates);
            mockSession = jasmine.createSpyObj('Session', ['getUserId']);
            $provide.value('Session', mockSession);
            mockSession.getUserId.andReturn(currentUserId);
        }));

        beforeEach(inject(function ($injector) {
            eventActionManager = $injector.get('EventActionManager');
            eventUtils = $injector.get('EventUtils');
        }));

        describe('event cancellation-spec:', function () {

            it('should allow doctor to cancel event in OPEN state', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in open state
                var event = {
                    id: 'event-123',
                    start: Date.today().add(1).days(),
                    doctor: {id: currentUserId},
                    patient: {id: 'diff-user-123'}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether event can be cancelled
                var canCancel = eventActionManager.canCancel(event);
                //then action is allowed
                expect(canCancel).toBe(true);
            });

            it('should allow patient to cancel event in OPEN state', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in open state
                var event = {
                    id: 'event-123',
                    start: Date.today().add(1).days(),
                    doctor: {id: 'diff-user-123'},
                    patient: {id: currentUserId}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether event can be cancelled
                var canCancel = eventActionManager.canCancel(event);
                //then action is allowed
                expect(canCancel).toBe(true);
            });

            it('should prevent cancellation of events by non-participant users', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in open state
                var event = {
                    id: 'event-123',
                    start: Date.today().add(1).days(),
                    doctor: {id: 'diff-user-123'},
                    patient: {id: 'diff-user-456'}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether event can be cancelled
                var canCancel = eventActionManager.canCancel(event);
                //then action is prohibited
                expect(canCancel).toBe(false);
            });

            it('should not allow to cancel new event', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and new/not existing event in open state
                var event = {
                    id: undefined,
                    start: Date.today().add(1).days(),
                    doctor: {id: currentUserId},
                    patient: {id: currentUserId}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether event can be cancelled
                var canCancel = eventActionManager.canCancel(event);
                //then action is prohibited
                expect(canCancel).toBe(false);
            });

            it('should not allow to cancel event in CLOSED state for event\'s participants', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in closed state
                var event = {
                    id: 'event-123',
                    start: new Date().set({
                        day: 1,
                        month: 1,
                        year: 2014
                    }),
                    doctor: {id: currentUserId},
                    patient: {id: currentUserId}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.CLOSED);
                //when checking whether event can be cancelled
                var canCancel = eventActionManager.canCancel(event);
                //then action is denied
                expect(canCancel).toBe(false);
            });

            it('should not allow to cancel event in CANCELLED state for event\'s participants', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event is cancelled already
                var event = {
                    id: 'event-123',
                    cancelled: Date.today(),
                    start: Date.today(),
                    doctor: {id: currentUserId},
                    patient: {id: currentUserId}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.CANCELLED);
                //when checking whether event can be cancelled
                var canCancel = eventActionManager.canCancel(event);
                //then action is denied
                expect(canCancel).toBe(false);
            });

            it('should prevent cancellation in case of errors', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in open state
                var event = {
                    id: 'event-123',
                    start: Date.today().add(1).days()
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether invalid event can be cancelled
                var canCancel = eventActionManager.canCancel(event);
                //then action is prohibited
                expect(canCancel).toBe(false);
            });

        });


        describe('event edition-spec:', function () {

            it('should allow doctor to edit event in OPEN state', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in open state
                var event = {
                    id: 'event-123',
                    start: Date.today().add(1).days(),
                    doctor: {id: currentUserId},
                    patient: {id: 'diff-user-123'}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether event can be edited
                var canEdit = eventActionManager.canEdit(event);
                //then action is allowed
                expect(canEdit).toBe(true);
            });

            it('should not allow patient to edit existing event in OPEN state', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in open state
                var event = {
                    id: 'event-123',
                    start: Date.today().add(1).days(),
                    doctor: {id: 'diff-user-123'},
                    patient: {id: currentUserId}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether event can be edited
                var canEdited = eventActionManager.canEdit(event);
                //then action is prohibited
                expect(canEdited).toBe(false);
            });

            it('should allow everybody to edit new event', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in open state
                var event = {
                    start: Date.today().add(1).days(),
                    doctor: {id: 'diff-user-123'},
                    patient: {id: 'diff-user-123'}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.OPEN);
                //when checking whether event can be edited
                var canEdited = eventActionManager.canEdit(event);
                //then action is allowed
                expect(canEdited).toBe(true);
            });

            it('should not allow doctor to edit event in CLOSED state', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in closed state
                var event = {
                    id: 'event-123',
                    start: Date.today(),
                    doctor: {id: currentUserId},
                    patient: {id: 'diff-user-123'}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.CLOSED);
                //when checking whether event can be edited
                var canEdit = eventActionManager.canEdit(event);
                //then action is prohibited
                expect(canEdit).toBe(false);
            });

            it('should not allow doctor to edit event in CANCELLED state', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in cancelled state
                var event = {
                    id: 'event-123',
                    start: Date.today(),
                    cancelled: Date.today(),
                    doctor: {id: currentUserId},
                    patient: {id: 'diff-user-123'}
                };
                expect(eventUtils.state(event)).toBe(mockEventStates.CANCELLED);
                //when checking whether event can be edited
                var canEdit = eventActionManager.canEdit(event);
                //then action is prohibited
                expect(canEdit).toBe(false);
            });

            it('should prevent edition in case of errors', function () {
                //given action manager is initialized
                expect(eventActionManager).toBeDefined();
                //and event in cancelled state
                var event = {
                    id: 'event-123',
                    start: Date.today()
                };
                //when checking whether invalid event can be edited
                var canEdit = eventActionManager.canEdit(event);
                //then action is prohibited
                expect(canEdit).toBe(false);
            });

        });

    });


});