'use strict';

angular.module('commons.labels.directives', []);

/**
 * Directive coverts model value into label view value
 * @param $filter filters for translations
 */
angular.module('commons.labels.directives')
    .directive('labelInput',
    ['$filter',
        function ($filter) {
            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    prefix: '@'
                },
                link: function (scope, element, attr, ngModel) {

                    ngModel.$parsers.push(function (viewValue) {
                        return viewValue;
                    });

                    ngModel.$formatters.push(function (modelValue) {
                        if (modelValue === undefined || modelValue === null || modelValue == '') {
                            return '';
                        }
                        return modelValue.indexOf("$$") == 0 ? $filter('translate')(scope.prefix + '.' + modelValue) : modelValue;
                    });

                }
            };
        }
    ]);