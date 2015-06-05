'use strict';

/**
 * Manager checks whether chosen actions can be performed on event
 *
 * @param EventUtils generic event related functionality
 * @param Session session of current user
 * @param EVENT_STATE possible states of event
 */
angular.module('chronos.commons').
    service('EventActionManager', ['EventUtils', 'Session', 'EVENT_STATE', function (EventUtils, Session, EVENT_STATE) {

        return {

            /**
             * Check whether event can be cancelled
             *
             * @param event event to be checked
             * @return {boolean} true is event can be cancelled, false otherwise
             */
            canCancel: function (event) {
                try {
                    if (event == undefined || event.id == undefined) {
                        return false;
                    }
                    var participantsIds = [event.doctor.id, event.patient.id];
                    if (!_.contains(participantsIds, Session.getUserId())) {
                        return false;
                    }
                    var eventState = EventUtils.state(event);
                    return eventState.key < EVENT_STATE.CLOSED.key;
                } catch (e) {
                    return false;
                }
            },

            /**
             * Check whether event can be edited
             *
             * @param event event to be checked
             * @return {boolean} true is event can be editer, false otherwise
             */
            canEdit: function (event) {
                try {
                    if (event == undefined || event.id == undefined) {
                        return true;
                    }
                    if (event.doctor.id != Session.getUserId()) {
                        return false;
                    }
                    var eventState = EventUtils.state(event);
                    return eventState.key < EVENT_STATE.CLOSED.key;
                } catch (e) {
                    return false;
                }
            }

        };
    }]);
