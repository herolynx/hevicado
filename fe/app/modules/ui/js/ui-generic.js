'use strict';

angular.module('ui.generic', []);

/**
 * Back to top option
 */
$(document).ready(function () {
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn(500);
        } else {
            $('.back-to-top').fadeOut(500);
        }
    });

    $('.back-to-top').click(function (event) {
        event.preventDefault();
        $('html, body').animate({scrollTop: 0}, 500);
        return false;
    });
});

/**
 * Filter normalizes string to lower case
 */
angular.module('ui.generic').
    filter('toLowerCase', function () {
        return function (text) {
            return text !== null ? text.toLowerCase() : '';
        };
    });


/**
 * Directive aligns height of elements of chosen type in single row
 */
angular.module('ui.generic')
    .directive('alignInRow', function () {

        /**
         * Find max height of children of given type
         * @param elm elm containing children
         * @param type type of element to be checked
         * @returns {*} positive max height found, negative value otherwise
         */
        var findMaxHeight = function (elm, type) {
            var max = -2000;
            var children = elm.children();
            for (var i = 0; i < children.length; i++) {
                var child = angular.element(children[i]);
                if (child.hasClass(type) && child.height() > max) {
                    max = child.height();
                }
            }
            return max;
        };

        return {
            restrict: 'A',
            link: function ($scope, elm, attrs) {
                var max = findMaxHeight(elm.parent(), 'box');
                if (max > 0) {
                    elm.height(max);
                }
            }
        };

    });



