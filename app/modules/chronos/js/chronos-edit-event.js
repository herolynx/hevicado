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
 * @param CALENDAR_EVENTS calendar defined events
 * @param UsersService service responsible for users
 * @param UserUtils user utils
 * @param uiNotification notification manager
 */
calendar.controller('EditEventCtrl', function ($scope, $log, $state, $stateParams, $q, Session, CalendarService, CALENDAR_EVENTS, UsersService, UserUtils, uiNotification) {

    $scope.isOwner = false;
    $scope.editedEvent = {};
    $scope.templates = [];
    $scope.durations = [];

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
        var loadEventPromise = $q.when($scope.editedEvent);
        if ($stateParams.eventId != undefined) {
            $log.debug("Editing existing event - id: " + $stateParams.eventId);
            loadEventPromise = CalendarService.
                event($stateParams.eventId).
                error(function (errResp, errStatus) {
                    $log.info('Couldn\'t load event details: status: ' + errStatus + ', resp: ' + errResp.data);
                });
        } else {
            $log.debug("Editing new event - start time: " + $stateParams.startTime);
            $scope.editedEvent.start = $stateParams.startTime;
        }

        //initialize controller
        $q.all(loadDoctorPromise, loadEventPromise).then(
            function (values) {
                $scope.doctor = values[0];
                $scope.editedEvent = values[1];
                if ($scope.editedEvent.id == undefined) {
                    $scope.initNewEvent();
                }
                $scope.formatPatient();
            }, function () {
                uiNotification.text('Error', 'Couldn\'t initialize editor').error();
            }
        );

        //listen for start time changes
        if (!$scope.isOwner) {
            $scope.$on(CALENDAR_EVENTS.CALENDAR_TIME_PICKED, function (newDate) {
                $log.debug("Start date of edited event changed - new start: " + newDate);
                $scope.refreshTemplates(newDate);
            });
        }
    };

    /**
     * Initialize new event
     */
    $scope.initNewEvent = function () {
        $scope.editedEvent.doctor = UserUtils.getContactInfo($scope.doctor);
        $scope.editedEvent.patient = $scope.isOwner ? {} : Session.getInfo();
        $scope.refreshTemplates($scope.editedEvent.start);
    };

    /**
     * Refresh available templates based on event start date
     * @param startTime date when event starts
     */
    $scope.refreshTemplates = function (startTime) {
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
        var day = startTime.toString('dddd');
        var hour = startTime.toString('HH:mm');
        var locations = $scope.doctor.locations;
        for (var i = 0; i < locations.length; i++) {
            var working_hours = locations[i].working_hours;
            for (var h = 0; h < working_hours.length; h++) {
                if (working_hours[h].day == day
                    && hour >= working_hours[h].start
                    && hour <= working_hours[h].end) {
                    return locations[i];
                }
            }
        }
        //return dummy location
        return {
            templates: [
                {durations: []}
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
    };

    /**
     * Save currently edited event
     */
    $scope.save = function () {
        $log.debug('Saving event - id: ' + $scope.editedEvent.id + ', start: ' + $scope.editedEvent.start + ', title: ' + $scope.editedEvent.title);
        $scope.editedEvent.start = new Date($scope.editedEvent.start);
        $scope.editedEvent.end = $scope.editedEvent.start.clone().add($scope.editedEvent.duration).minute();
        CalendarService.
            save($scope.editedEvent).
            success(function (resp) {
                $log.debug('Event saved successfully: event id: ' + resp.id);
                EventEditor.endEdition();
            }).
            error(function (errResp, errStatus) {
                $log.error('Event hasn\'t been saved: status: ' + errStatus + ', resp: ' + errResp);
                uiNotification.text('Error', 'Event hasn\'t been saved').error();
            });
    };

    /**
     * Delete currently edited event
     */
    $scope.delete = function () {
        $log.debug('Deleting event - id: ' + $scope.editedEvent.id);
        CalendarService.
            delete($scope.editedEvent.id).then(
            function (resp) {
                $log.info('Event deleted successfully: event id: ' + $scope.editedEvent.id);
                EventEditor.endEdition();
            },
            function (errResp, errStatus) {
                $log.info('Event hasn\'t been deleted: status: ' + errStatus + ', resp: ' + errResp.data);
                uiNotification.text('Error', 'Event hasn\'t been deleted').error();
            }
        );
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

    //TODO add tests
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