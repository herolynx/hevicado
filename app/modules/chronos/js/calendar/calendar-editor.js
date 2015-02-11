'use strict';

/**
 * Controller responsible for editing events on calendar.
 * @param $rootScope root scope for broadcasting calendar related events
 * @param $scope current scope of controller
 * @param @state state manager
 * @param $log logger
 * @param CalendarService service managing calendar data
 * @param CALENDAR_EVENTS events used for calendar notifications
 * @param EventActionManager event action validator
 * @param EventUtils generic functionality related with events
 * @param uiNotifications component managing notifications
 */
angular.module('chronos.calendar').
    controller('CalendarEditorCtrl',
    ['$rootScope', '$scope', '$state', '$log', 'CalendarService', 'CALENDAR_EVENTS', 'EventActionManager', 'EventUtils', 'uiNotification',
        function ($rootScope, $scope, $state, $log, CalendarService, CALENDAR_EVENTS, EventActionManager, EventUtils, uiNotification) {

            /**
             * Add new event to calendar
             * @param day day of new event
             * @param hour optional starting hour of event
             * @param minute optional minutes of starting time
             */
            $scope.addEvent = function (day, hour, minute) {
                //prepare start date
                var date = day.clone();
                date = date.set({
                    hour: hour || 0,
                    minute: minute || 0,
                    second: 0
                });
                var visitEditionStates = [$state.current.data.addVisitState, $state.current.data.editVisitState];
                if (!_.contains(visitEditionStates, $state.current.name)) {
                    $log.debug('Add new event - start: ' + date);
                    $state.go($state.current.data.addVisitState, {
                        doctorId: $scope.doctorId,
                        startTime: date.toString('yyyy-MM-dd HH:mm'),
                        currentDate: date.toString('yyyy-MM-dd')
                    });
                } else {
                    $log.debug('Event date clicked - start: ' + date);
                    $rootScope.$broadcast(CALENDAR_EVENTS.CALENDAR_TIME_PICKED, date);
                }
            };

            /**
             * Edit event
             * @param event event to be edited
             */
            $scope.editEvent = function (event) {
                $log.debug('Editing event - id: ' + event.id);
                $state.go($state.current.data.editVisitState, {
                    doctorId: $scope.doctorId,
                    eventId: event.id,
                    currentDate: event.start.toString('yyyy-MM-dd')
                });
            };

            /**
             * Save new time period of an event
             * @param event event to be saved/modified
             * @param newStartDate new begin date to be saved
             * @param newEndDate new end date to be saved
             * @param oldStartDate old begin date for fallback
             * @param oldEndDate old end date for fallback
             */
            $scope.saveEvent = function (event, newStartDate, newEndDate, oldStartDate, oldEndDate) {
                $scope.detachEvent(event);
                $scope.buildTimelineFor(oldStartDate, oldEndDate);
                event.start = newStartDate;
                event.end = newEndDate;
                EventUtils.normalize(event);
                CalendarService.save(event).
                    success(function (response) {
                        $scope.attachEvent(event);
                        $scope.buildTimelineFor(event.start, event.end);
                        $scope.$broadcast(CALENDAR_EVENTS.CALENDAR_RENDER);
                    }).
                    error(function (error) {
                        $log.error('Couldn\'t save event - id: ' + event.id + ', start: ' + event.start + ', error: ' + error);
                        uiNotification.text('Error', 'Couldn\'t save event').error();
                        //fallback
                        event.start = oldStartDate;
                        event.end = oldEndDate;
                        EventUtils.normalize(event);
                        $scope.attachEvent(event);
                        $scope.buildTimelineFor(event.start, event.end);
                        $scope.$broadcast(CALENDAR_EVENTS.CALENDAR_RENDER);
                    });
            };

            /**
             * Cancel event
             * @param event event to be cancelled
             */
            $scope.cancelEvent = function (event) {
                $log.debug('Cancelling event - id: ' + event.id + ', start: ' + event.start);
                if (!EventActionManager.canCancel(event)) {
                    $log.error('Event cannot be cancelled');
                    uiNotification.text('Error', 'Event cannot be cancelled').error();
                    return;
                }
                CalendarService.
                    cancel(event).
                    success(function () {
                        $log.debug('Event cancelled successfully');
                        $scope.detachEvent(event);
                        event.cancelled = new Date();
                        $scope.buildTimelineFor(event.start, event.end);
                        $scope.$broadcast(CALENDAR_EVENTS.CALENDAR_RENDER);
                    }).
                    error(function (error) {
                        $log.error('Couldn\'t cancel event - id: ' + event.id + ', start: ' + event.start + ', error: ' + error);
                        uiNotification.text('Error', 'Couldn\'t cancel event').error();
                    });
            };

            /**
             * Handle on drop event
             * @param dndEvent DnD event
             * @param calendarEvent moved event
             * @param day new day of event
             * @param hour new hour of event
             * @param minute new minute of event
             */
            $scope.dndDrop = function (dndEvent, calendarEvent, day, hour, minute) {
                $log.debug('DnD stop on - day: ' + day + ', hour: ' + hour + ', minutes: ' + minute);
                $log.debug('DnD event moved - title: ' + calendarEvent.title + ', start: ' + calendarEvent.start + ', duration: ' + calendarEvent.duration);
                EventUtils.normalize(calendarEvent);
                if (!EventActionManager.canEdit(calendarEvent)) {
                    $log.error('Event cannot be changed as not editable');
                    return;
                }
                var newStartDate = day.clone().set({
                    hour: hour,
                    minute: minute
                });
                var newEndDate = newStartDate.clone().add(calendarEvent.duration).minute();
                $scope.saveEvent(calendarEvent, newStartDate, newEndDate, calendarEvent.start.clone(), calendarEvent.end.clone());
            };

            /**
             * Change event time period based on given UI event
             * @param event resizable event
             * @param ui ui element details
             * @param calendarEvent event to be changed
             */
            $scope.dndChangeTime = function (event, ui, calendarEvent) {
                $log.debug('Changing event time changed - title: ' + calendarEvent.title + ', start: ' + calendarEvent.start + ', duration: ' + calendarEvent.duration);
                EventUtils.normalize(calendarEvent);
                if (!EventActionManager.canEdit(calendarEvent)) {
                    $log.error('Event cannot be changed as not editable');
                    return;
                }
                var deltaHeight = ui.size.height - ui.originalSize.height;
                var addMinutes = 15 * Math.round(deltaHeight / 15);
                if (calendarEvent.duration + addMinutes < 15) {
                    //don't re-size too much
                    return;
                }
                var newEndDate = calendarEvent.end.clone().add(addMinutes).minute();
                calendarEvent.duration += addMinutes;
                $scope.saveEvent(calendarEvent, calendarEvent.start.clone(), newEndDate, calendarEvent.start.clone(), calendarEvent.end.clone());
            };

            /**
             * Get controller's action manager
             * @return non-nullable instance
             */
            $scope.actions = function () {
                return EventActionManager;
            };

        }
    ]
);

