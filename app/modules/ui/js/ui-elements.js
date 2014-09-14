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
                    onResizeFunc(scope, {
                        $event: event,
                        $ui: ui
                    });
                });
            });
        }
    };
});

/**
 * Directive for matching field values.
 * It can be used to confirm values of chosen fields.
 */
elements.directive('match', function () {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            match: '='
        },
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch(function () {
                var modelValue = ctrl.$modelValue || ctrl.$$invalidModelValue;
                return (ctrl.$pristine && angular.isUndefined(modelValue)) || scope.match === modelValue;
            }, function (currentValue) {
                ctrl.$setValidity('match', currentValue);
            });
        }
    };
});