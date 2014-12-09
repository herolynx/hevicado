'use strict';

var calendar = angular.module('chronos.events.edit', [
    'users.services',
    'bolt.services'
]);

/**
 * Editor responsible for holding information related with editing event
 */
calendar.service('EventEditor', function ($state, $log, CalendarService, UsersService, Session, EventUtils) {

    return {

        onGoing: false,

        eventsMap: null,

        event: {},

        doctor: {},

        patient: {},

        options: {},

        prevState: {},

        onChange: function () {

        },

        /**
         * Check whether edited event is new
         * @return {boolean} true if editing new event, false for edition of existing one
         */
        isNew: function () {
            return this.event.id == undefined;
        },

        /**
         * Check whether current  user will be owner of an event
         * @return {boolean} true if user is owner, false otherwise
         */
        isOwner: function () {
            return  this.doctor.id == Session.getUserId();
        },

        /**
         * Start edition of an event
         * @param doctorId doctor who will be the owner of the visit
         * @param startTime optional start time of edited event
         * @param event optional event to be edited
         */
        startEdition: function (doctorId, startTime, event) {
            //set edited event
            if (event !== undefined) {
                this.event = event;
            }
            //change page
            if (!this.onGoing) {
                console.info($state)
                this.prevState = $state.currentState
                $state.go('calendar-day.edit-visit', {doctorId: doctorId});
                this.onGoing = true;
            }
            this.loadDoctor(doctorId);
            this.refresh(startTime);
        },

        /**
         * Load doctor and his settings
         * @param doctorId doctor to be loaded
         */
        loadDoctor: function (doctorId) {
            if (doctorId == this.doctor.id) {
                return;
            }
            var self = this;
            UsersService
                .get(doctorId)
                .success(function (result) {
                    self.doctor = angular.copy(result);
                    delete self.doctor.locations;
                    self.options = result.locations;
                    $log.debug('Event edition - doctor loaded: ' + self.doctor.id + ", locations: " + self.options.length);
                    if (self.doctor.id != Session.getUserId()) {
                        self.patient = Session.getInfo();
                        $log.debug('Event edition - patient loaded: ' + self.patient.id);
                    }
                    self.refresh(self.event.start);
                })
                .error(function (error) {
                    $log.error('Couldn\'t load options - date: ' + event.start + ', error: ' + error);
                });
        },

        /**
         * Find option for given time
         * @param startTime start date of event
         * @returns {*} found option, null otherwise
         */
        option: function (startTime) {
            if (startTime != null) {
                var day = startTime.toString('dddd');
                var hour = startTime.toString('HH:mm');
                for (var i = 0; i < this.options.length; i++) {
                    var working_hours = this.options[i].working_hours;
                    for (var h = 0; h < working_hours.length; h++) {
                        if (working_hours[h].day == day
                            && hour >= working_hours[h].start
                            && hour <= working_hours[h].end) {
                            return this.options[i];
                        }
                    }
                }
            }
            return null;
        },

        location: {},

        /**
         * Refresh event data
         * @param startTime new proposed event start time
         */
        refresh: function (startTime) {
            if (startTime !== undefined) {
                this.event.start = startTime.clone();
            } else if (this.isNew()) {
                this.event.start = Date.today();
            }
            this.location = this.option(startTime);
            this.event.location = {};
            this.event.patient = this.patient;
            this.event.doctor = this.doctor;
            if (this.isNew() && this.location != null) {
                var event = this.event;
                event.title = EventUtils.value(_.pluck(this.location.templates, 'name'),
                    event.title, 0, false);
                event.duration = EventUtils.value(this.location.templates[0].durations,
                    event.duration, 0, false);
                event.location = angular.copy(this.location);
                delete event.location.templates;
            }
            this.onChange();
        },

        /**
         * Finalize edition of an event
         */
        endEdition: function () {
            $state.go(self.prevState);
        },

        /**
         * Cancel edition of an event
         */
        cancel: function () {
            this.clear();
            $state.go(self.prevState, {doctorId: this.doctor.id});
        },

        /**
         * Clear state of editor
         */
        clear: function () {
            this.event = {};
            this.options = {};
            this.patient = {};
            this.doctor = {};
            this.onGoing = false;
            this.prevState = {};
        },

        /**
         * Initialize editor
         * @param events all available events
         */
        init: function (eventsMap) {
            this.clear();
            this.eventsMap = eventsMap;
            this.prevState = $state.current;
        }

    };

});

/**
 * Controller responsible for adding/editing events
 * @param $scope current scope
 * @param $log logger
 * @param EventEditor editor that holds information about edited event
 * @param CalendarService service managing events
 * @param uiNotification notification manager
 */
calendar.controller('EditEventCtrl', function ($scope, $log, EventEditor, CalendarService, uiNotification) {

    $scope.editedEvent = {};
    $scope.durations = [];
    $scope.templates = [];
    //TODO load access rights
    $scope.isButtonDeleteVisible = false; //eventToEdit.id !== undefined;
    $scope.isButtonSaveVisible = true;

    /**
     * Initialize controller state
     */
    $scope.init = function () {
        EventEditor.onChange = function () {
            $scope.editedEvent = EventEditor.event;
            if (EventEditor.location != undefined && EventEditor.location.templates != undefined) {
                $scope.location = EventEditor.location;
                $scope.templates = EventEditor.location.templates;
                $scope.onTemplateChange();
            }
        };
        EventEditor.onChange();
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
        EventEditor.cancel();
    };

    /**
     * Save currently edited event
     */
    $scope.save = function () {
        $log.debug('Saving event - id: ' + $scope.editedEvent.id + ', start: ' + $scope.editedEvent.start + ', title: ' + $scope.editedEvent.title);
        $scope.editedEvent.start = new Date($scope.editedEvent.start);
        $scope.editedEvent.end = $scope.editedEvent.start.clone().add($scope.editedEvent.duration).minute();
        CalendarService.save($scope.editedEvent).then(
            function (resp) {
                $log.info('Event saved successfully: event id: ' + resp.data.id);
                EventEditor.endEdition();
            },
            function (errResp, errStatus) {
                $log.info('Event hasn\'t been saved: status: ' + errStatus + ', resp: ' + errResp.data);
                uiNotification.text('Error', 'Event hasn\'t been saved').error();
            }
        );
    };

    /**
     * Delete currently edited event
     */
    $scope.delete = function () {
        $log.debug('Deleting event - id: ' + $scope.editedEvent.id);
        CalendarService.delete($scope.editedEvent.id).then(
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
    $controller('TimelineEventCtrl', { $scope: $scope.options});

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