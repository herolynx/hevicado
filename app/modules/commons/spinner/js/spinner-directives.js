'use strict';

/**
 * Directive for showing spinner when HTTP communication is on-going
 */
angular.module('commons.spinner').
    directive('spinner',
    ['SpinnerCounter', 'SPINNER_EVENTS',
        function (SpinnerCounter, SPINNER_EVENTS) {

            var spinnerClass = 'spinner';

            var update = function (elm) {
                if (SpinnerCounter.inProgress()) {
                    elm.addClass(spinnerClass)
                } else {
                    elm.removeClass(spinnerClass)
                }
            };

            return {
                restrict: 'E',
                template: '<div />',
                scope: {},
                link: function ($scope, elm, attrs) {
                    update(elm);
                    $scope.$on(SPINNER_EVENTS.COUNTER_CHANGED, function () {
                        update(elm);
                    });
                }
            };

        }
    ]);

