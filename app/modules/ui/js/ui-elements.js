'use strict';

var elements = angular.module("ui-elements", []);

/**
 * Directive for resizable element
 */
elements.directive('uiResizable', function ($parse) {
    return {
        restrict: 'A',

        link: function postLink(scope, elem, attrs) {
            elem.resizable({
//                containment: "parent",
                handles: 's'
            });
            elem.on('resizestop', function (event, ui) {
                var onResizeFunc = $parse(attrs.uiOnResize);
                scope.$apply(function () {
                    //apply default args + user's args if set
                    onResizeFunc(scope, {$event: event, $ui: ui});
                });
            });
        }
    };
});
