'use strict';

var calendar = angular.module('chronos.events.edit', []);

/**
 * Editor responsible for holding information related with editing event
 */
calendar.service('EventEditor', function ($state, $log, CalendarService, EventUtils) {

    return {

        onGoing: false,

        eventsMap: null,

        event: {},

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
            //TODO add user identity
            return true;
        },

        /**
         * Start edition of an event
         * @param startTime optional start time of edited event
         */
        startEdition: function (startTime, event) {
            //set edited event
            if (event !== undefined) {
                this.event = event;
            }
            //set start time
            if (startTime !== undefined) {
                this.event.start = startTime.clone();
            } else if (this.isNew()) {
                this.event.start = Date.today();
            }
            //change page
            if (!this.onGoing) {
                $state.go('calendar-day.edit-visit');
                this.onGoing = true;
            }
            //load options
            this.loadOptions();
            this.onChange();
        },

        /**
         * Load options available for edited event
         */
        loadOptions: function () {
            var self = this;
            CalendarService
                .options(event.start)
                .success(function (result) {
                    self.options = result;
                    if (self.isNew()) {
                        //TODO set user and add overwritting
                        //overwrite if current values are not allowed
                        var options = self.options;
                        var event = self.event;
                        var isOwner = self.isOwner;
                        event.title = EventUtils.value(_.pluck(options.templates, 'title'),
                            event.title, 0, isOwner());
                        event.description = EventUtils.value(_.pluck(options.templates, 'description'),
                            event.description, 0, isOwner());
                        event.duration = EventUtils.value(options.durations,
                            event.duration, 0, isOwner());
                        //overwrite if not set
                        event.owner = event.owner || options.owner;
                        event.users = event.users || options.users;
                        //overwrite
                        event.location = options.location.address;
                        event.color = options.location.color;
                    }
                })
                .error(function (error) {
                    $log.error('Couldn\'t load options - date: ' + event.start + ', error: ' + error);
                });
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
            $state.go(self.prevState);
        },

        /**
         * Clear state of editor
         */
        clear: function () {
            this.event = {};
            this.options = {};
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

    $scope.durations = [];
    //TODO load access rights
    $scope.isButtonDeleteVisible = false; //eventToEdit.id !== undefined;
    $scope.isButtonSaveVisible = true;
    $scope.editedEvent = {};

    /**
     * Initialize controller state
     */
    $scope.init = function () {
        EventEditor.onChange = function () {
            $scope.editedEvent = EventEditor.event;
            $scope.durations = EventEditor.options.durations;
        };
        EventEditor.onChange();
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

calendar.controller('DisplayEventCtrl', function ($scope, $log, $stateParams, CalendarService, uiNotification) {

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
                $scope.event = data;
            }).
            error(function (errResp, errStatus) {
                $log.info('Couldn\'t load event details: status: ' + errStatus + ', resp: ' + errResp.data);
                uiNotification.text('Error', 'Couldn\'t load event details').error();
            });
    };

    $scope.load($stateParams.eventId);

});