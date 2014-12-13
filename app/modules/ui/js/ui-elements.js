'use strict';

var elements = angular.module("ui.elements", []);

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
elements.directive('fieldMatch', function () {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            fieldMatch: '='
        },
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch(function () {
                var modelValue = ctrl.$modelValue || ctrl.$$invalidModelValue;
                return (ctrl.$pristine && angular.isUndefined(modelValue)) || scope.fieldMatch === modelValue;
            }, function (currentValue) {
                ctrl.$setValidity('fieldMatch', currentValue);
            });
        }
    };
});

/**
 * Directive for showing its context as pop-up info.
 * First element of directive is treated as a open button.
 * Second element is treated as a info to be displayed as a pop-up.
 * Pop-up will be closed automatically after clicking on info.
 */
elements.directive('popupInfo', function () {
    return {
        restrict: 'E',
        link: function ($scope, elem, attrs) {
            var openButton = angular.element(elem.children()[0]);
            var info = angular.element(elem.children()[1]);
            openButton.click(function () {
                info.slideDown('fast');
            });
            info.click(function () {
                info.slideUp('fast');
            });
        }
    };
});