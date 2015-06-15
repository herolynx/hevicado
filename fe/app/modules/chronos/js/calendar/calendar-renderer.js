'use strict';

/**
 * Renderer manages displaying of events in the chosen day.
 * Renderer marks timeline where event should be displayed and number of overlaping events
 * that will be displayed at the same time.
 */
angular.module('chronos.calendar').
    service('CalendarRenderer', function () {

        var t = [];
        var overlap = {
            value: 0
        };

        /**
         * Check whether all timelines will be done at given point of time
         * @param date point of time to be checked
         */
        var areAfter = function (date) {
            for (var i = 0; i < t.length; i++) {
                if (date.isBefore(t[i].end)) {
                    return false;
                }
            }
            return true;
        };

        /**
         * Clear state of renderer
         */
        var clear = function () {
            t = [];
            overlap = {
                value: 0
            };
        };

        /**
         * Get timeline that is free at given point of time
         * @param date point of time
         * @return index of existing or newly created timeline
         */
        var timeline = function (date) {
            for (var i = 0; i < t.length; i++) {
                if (t[i].end.compareTo(date) <= 0) {
                    //ends before or at the same time
                    return i;
                }
            }
            //create new timeline
            overlap.value++;
            t.push(new Object());
            return t.length - 1;
        };

        return {

            /**
             * Attach event to next free timeline
             * @param event event that should be displayed
             * @param quarterLength length of quarter displayed on calendar
             */
            attach: function (event, quarterLength) {
                if (areAfter(event.start)) {
                    clear();
                }
                var index = timeline(event.start);
                t[index] = event;
                event.timeline = index;
                event.overlap = overlap;
                event.quarter = Math.floor(event.duration / quarterLength);
            },

            /**
             * Attach events to timelines
             * @param events events that should be displayed in the same day
             * @param quarterLength length of quarter displayed on calendar
             */
            attachAll: function (events, quarterLength) {
                clear();
                //sort events
                var order = _.chain(events).
                    sortBy('end').
                    reverse().
                    sortBy('start').
                    value();
                //attach events
                for (var i = 0; i < order.length; i++) {
                    this.attach(order[i], quarterLength);
                }
            }

        };
    });