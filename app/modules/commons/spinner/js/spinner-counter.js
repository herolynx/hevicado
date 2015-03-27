'use strict';

/**
 * Counter for counting operations in-progress
 */
angular.module('commons.spinner').
    service('SpinnerCounter',
    ['$rootScope', 'SPINNER_EVENTS',
        function ($rootScope, SPINNER_EVENTS) {

            var self = this;
            self.counter = 0;

            return {

                increment: function () {
                    self.counter += 1;
                    $rootScope.$broadcast(SPINNER_EVENTS.COUNTER_CHANGED, self.counter);
	
                },

                decrement: function () {
                    self.counter -= 1;
                    $rootScope.$broadcast(SPINNER_EVENTS.COUNTER_CHANGED, self.counter);
                },

                inProgress: function () {
                    return self.counter > 0;
					$('.loader').addClass('test');
                }

            };

        }
    ]);