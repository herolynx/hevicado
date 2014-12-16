'use strict';

var calendar = angular.module('chronos.events.edit', [
    'commons.users.utils',
    'commons.users.filters',
    'users.services',
    'bolt.services'
]);

/**
 * Controller responsible for adding/editing events
 * @param $scope current scope
 * @param $log logger
 * @param $state state manager
 * @param $stateParams state parameters manager
 * @param $q promises
 * @param Session session of current user
 * @param CalendarService service managing events
 * @param EventActionManager event action validator
 * @param EventUtils generic event related functionality
 * @param CALENDAR_EVENTS calendar defined events
 * @param UsersService service responsible for users
 * @param UserUtils user utils
 * @param uiNotification notification manager
 */
calendar.controller('EditEventCtrl', function ($scope, $log, $state, $stateParams, $q, Session, CalendarService, EventActionManager, EventUtils, CALENDAR_EVENTS, UsersService, UserUtils, uiNotification) {

    $scope.isOwner = false;
    $scope.editedEvent = {};
    $scope.templates = [];
    $scope.durations = [15, 30, 45, 60, 90, 120];
    $scope.isDateValid = true;

    /**
     * Initialize controller state
     */
    $scope.init = function () {
        //load data
        $log.debug("Event editor - doctorId: " + $stateParams.doctorId);
        $scope.isOwner = Session.getUserId() == $stateParams.doctorId;
        $log.debug("Event editor - user is owner: " + $scope.isOwner);

        //load doctor
        var loadDoctorPromise = UsersService.
            get($stateParams.doctorId).
            error(function (errResp, errStatus) {
                $log.info('Couldn\'t load doctor: status: ' + errStatus + ', resp: ' + errResp.data);
            });

        //load event
        var loadEventPromise = null;
        if ($stateParams.eventId != undefined) {
            $log.debug("Editing existing event - id: " + $stateParams.eventId);
            loadEventPromise = CalendarService.
                event($stateParams.eventId).
                error(function (errResp, errStatus) {
                    $log.error('Couldn\'t load event details: status: ' + errStatus + ', resp: ' + errResp.data);
                });
        } else {
            $log.debug("Editing new event - start time: " + $stateParams.startTime);
            var startDate = $stateParams.startTime != '' ? new Date($stateParams.startTime) : new Date().add(2).hours().set({
                minute: 0,
                second: 0
            });
            $scope.editedEvent.start = startDate.clone();
            $scope.editedEvent.end = startDate.clone().add(30).minutes();
            loadEventPromise = $q.when({data: $scope.editedEvent});
        }

        //initialize controller
        $q.all([loadDoctorPromise, loadEventPromise]).
            then(function (values) {
                $scope.doctor = values[0].data;
                $scope.editedEvent = EventUtils.normalize(values[1].data);
                if ($scope.editedEvent.id == undefined) {
                    $scope.initNewEvent();
                }
                $scope.formatPatient();
                $scope.canCancel = EventActionManager.canCancel($scope.editedEvent);
                $scope.canEdit = EventActionManager.canEdit($scope.editedEvent);
                $scope.refreshTemplates($scope.editedEvent.start);
            }, function () {
                uiNotification.text('Error', 'Couldn\'t initialize editor').error();
            }
        );

        $scope.initCalendarChangeTimeListener();
    };

    /**
     * Listener for watching when new date is picked on calendar
     */
    $scope.initCalendarChangeTimeListener = function () {
        $scope.$on(CALENDAR_EVENTS.CALENDAR_TIME_PICKED, function (event, newDate) {
            if ($scope.canEdit) {
                $log.debug("Start date of edited event changed - new start: " + newDate);
                $scope.refreshTemplates(newDate);
            }
        });
    };

    /**
     * Validate date
     * @param date date to be validated
     * @returns {*} true if date is valid, false otherwise
     */
    $scope.validateDate = function (date) {
        var validNewDate = date.isAfter(new Date());
        $scope.isDateValid = $scope.isOwner || validNewDate;
        return validNewDate;
    };

    /**
     * Initialize new event
     */
    $scope.initNewEvent = function () {
        $scope.editedEvent.doctor = UserUtils.getContactInfo($scope.doctor);
        $scope.editedEvent.patient = $scope.isOwner ? {} : Session.getInfo();
        $scope.editedEvent.location = $scope.doctor.locations[0];
    };

    /**
     * Refresh available templates based on event start date
     * @param startTime date when event starts
     */
    $scope.refreshTemplates = function (startTime) {
        $scope.editedEvent.start = startTime;
        $scope.validateDate(startTime);
        $scope.location = this.findLocation(startTime);
        $scope.templates = $scope.location.templates;
        if (!$scope.isOwner) {
            var event = $scope.editedEvent;
            event.title = EventUtils.value(_.pluck(this.location.templates, 'name'),
                event.title, 0, false);
            event.duration = EventUtils.value(this.location.templates[0].durations,
                event.duration, 0, false);
            event.location = angular.copy(this.location);
            delete event.location.templates;
            $scope.onTemplateChange();
        }
    };

    /**
     * Find location according to event start date
     * @param startTime time when event will start
     * @returns {*} non-nullable location
     */
    $scope.findLocation = function (startTime) {
        var foundLocation = EventUtils.findLocation($scope.doctor.locations, startTime);
        return foundLocation || {
                name: '',
                templates: [
                    {name: '', durations: []}
                ]
            };
    };

    /**
     * Find users by free text criteria
     * @param text search criteria
     * @returns {*} HTTP promise
     */
    $scope.findUsers = function (text) {
        $log.info("Searching users: " + text);
        return UsersService.
            search(text).
            then(function (resp) {
                $log.debug("Searching users by " + text + " - result: " + resp.data.length);
                _.map(resp.data, function (user) {
                    user.toString = function () {
                        return UserUtils.info(user, undefined, 'withEmail');
                    }
                });
                return resp.data;
            }, function (code, msg) {
                $log.error("Couldn't find users - code: " + code + ", msg: " + msg);
                uiNotification.text('Error', 'Couldn\'t find users').error();
            });
    };

    /**
     * On patient selected action handler
     * @param $item selected item
     * @param $model model item
     * @param $label label
     */
    $scope.onPatientSelected = function ($item, $model, $label) {
        $log.debug('Patient selected: ' + $model.email);
        $scope.editedEvent.patient = $model;
        $scope.formatPatient();
    };

    /**
     * Attach proper formatter to patient
     */
    $scope.formatPatient = function () {
        $scope.editedEvent.patient.toString = function () {
            return UserUtils.info($scope.editedEvent.patient);
        };
    };

    /**
     * Execute all needed changes related with change of examination template
     */
    $scope.onTemplateChange = function () {
        var selectedTemplate = _.find($scope.templates, function (template) {
            return template.name == $scope.editedEvent.title;
        });
        $scope.durations = selectedTemplate.durations || [];
    };

    /**
     * Cancel edition of an event
     */
    $scope.cancel = function () {
        $log.debug('Event edition cancelled');
        $state.go($state.previous.state.name, $state.previous.params);
    };

    /**
     * Save currently edited event
     */
    $scope.save = function () {
        $log.debug('Saving event - id: ' + $scope.editedEvent.id + ', start: ' + $scope.editedEvent.start + ', title: ' + $scope.editedEvent.title);
        $scope.editedEvent.end = $scope.editedEvent.start.clone().add(Number($scope.editedEvent.duration)).minutes();
        CalendarService.
            save($scope.editedEvent).
            success(function (resp) {
                $log.debug('Event saved successfully: event id: ' + resp.id);
                $state.go($state.previous.state.name, $state.previous.params);
            }).
            error(function (errResp, errStatus) {
                $log.error('Event hasn\'t been saved: status: ' + errStatus + ', resp: ' + errResp);
                uiNotification.text('Error', 'Event hasn\'t been saved').error();
            });
    };

    /**
     * Delete currently edited event
     */
    $scope.cancelVisit = function () {
        $log.debug('Cancel event - id: ' + $scope.editedEvent.id);
        if (!EventActionManager.canCancel($scope.editedEvent)) {
            $log.error('Event cannot be cancelled');
            uiNotification.text('Error', 'Event cannot be cancelled').error();
            return;
        }
        CalendarService.
            cancel($scope.editedEvent).
            success(function (resp) {
                $log.debug('Event cancelled successfully: event id: ' + $scope.editedEvent.id);
                $state.go($state.previous.state.name, $state.previous.params);
            }).
            error(function (errResp, errStatus) {
                $log.error('Event hasn\'t been cancelled: status: ' + errStatus + ', resp: ' + errResp.data);
                uiNotification.text('Error', 'Event hasn\'t been cancelled').error();
            });
    };

    //initialize controller
    $scope.init();
});

/**
 * Controller responsible for displaying details about events.
 * It also provides basic options on events (i.e. cancellation).
 * @param $scope controller's scope
 * @param $stateParams state manager
 * @param $controller controller factory for injection event's options
 * @param $log logger
 * @param CalendarService service responsible for providing events
 * @param EventUtils generic functions related with events
 * @param uiNotification notification manager
 */
calendar.controller('DisplayEventCtrl', function ($scope, $stateParams, $controller, $log, CalendarService, EventUtils, uiNotification) {

    $scope.options = $scope.$new();
    $controller('TimelineEventCtrl', {$scope: $scope.options});

    /**
     * Load data about event
     * @param id event ID
     */
    $scope.load = function (id) {
        $log.debug('Loading details about event - id: ' + id);
        CalendarService.
            event(id).
            success(function (data) {
                $log.debug('Event details loaded - id: ' + id);
                EventUtils.normalize(data);
                $scope.event = data;
            }).
            error(function (errResp, errStatus) {
                $log.info('Couldn\'t load event details: status: ' + errStatus + ', resp: ' + errResp.data);
                uiNotification.text('Error', 'Couldn\'t load event details').error();
            });
    };

    $scope.load($stateParams.eventId);

});