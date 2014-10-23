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

        /**
         * Check whether edited event is new
         * @return {boolean} true if editing new event, false for edition of existing one
         */
        isNew: function () {
            return event.id == undefined;
        },

        /**
         * Check whether current  user will be owner of an event
         * @return {boolean} true if user is owner, false otherwise
         */
        isOwner: function () {
            return true;
        },

        /**
         * Start edition of an event
         * @param startTime optional start time of edited event
         */
        startEdition: function (startTime) {
            if (startTime !== undefined) {
                event.start = startTime.clone();
            } else if (isNew()) {
                event.start = Date.today();
            }
            loadOptions();
            if (!onGoing) {
                $state.go('calendar-day.edit-visit');
                onGoing = true;
            }
        },

        /**
         * Load options available for edited event
         */
        loadOptions: function () {
            CalendarService.options(event.start)
                .success(function (result) {
                    options = result;
                    if (isNew()) {
                        //TODO set user and add overwritting
                        //overwrite if current values are not allowed
                        event.title = EventUtils.value(_.pluck(options.templates, 'title'), event.title, 0, isOwner());
                        event.description = EventUtils.value(_.pluck(options.templates, 'description'), event.description, 0, isOwner());
                        event.duration = EventUtils.value(options.durations, event.duration, 0, isOwner());
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
            //TODO go to previous state
        },

        /**
         * Cancel edition of an event
         */
        cancel: function () {
            //TODO go to previous state
        },

        /**
         * Clear state of editor
         */
        clear: function () {
            event = {};
            options = {};
            onGoing = false;
        },

        /**
         * Initialize editor
         * @param events all available events
         */
        init: function (eventsMap) {
            clear();
            this.eventsMap = eventsMap;
        }

    };

});

/**
 * Controller responsible for adding/editing events
 * @param $scope current scope
 * @param EventEditor editor that holds information about edited event
 * @param CalendarService service managing events
 * @param uiNotification notification manager
 * @param $log logger
 */
calendar.controller('EditEventCtrl', function ($scope, EventEditor, CalendarService, uiNotification, $log) {

    $scope.durations = [];
    //TODO load access rights
    $scope.isButtonDeleteVisible = false; //eventToEdit.id !== undefined;
    $scope.isButtonSaveVisible = true;
    $scope.editedEvent = {};

    /**
     * Initialize controller state
     */
    $scope.init = function () {
        $scope.editedEvent = EventEditor.event;
        $scope.durations = EventEditor.options.durations;
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