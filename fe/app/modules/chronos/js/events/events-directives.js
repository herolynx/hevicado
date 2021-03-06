'use strict';

/**
 * Directive for keeping element visible on the screen all the time,
 * no matter of window scroll position.
 */
angular.module('chronos.events.directives',
    []).
    directive('keepVisible', ['$window', function ($window) {

        return {
            restrict: 'A',
            template: '',
            link: function ($scope, elm, attrs) {
                var winElm = angular.element($window);
                elm.css('position', 'relative');
                elm.css('top', 0);
                var shiftDelay = 250;
                angular.element($window).bind("scroll", function () {
                    var top = winElm.scrollTop();
                    var shiftTop = top - shiftDelay;
                    elm.css('top', shiftTop > 0 ? shiftTop : 0);
                });
            }
        };

    }]);