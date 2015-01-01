'use strict';

var commonsDirectives = angular.module('commons.users.directives', [
    'commons.users.utils'
]);

/**
 * Directive for handling dates according to user's settings
 */
commonsDirectives.directive('userDate', function () {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, element, attrs, ngModelController) {
            ngModelController.$parsers.push(function (data) {
                //convert data from view format to model format
                return new Date(data);
            });

            ngModelController.$formatters.push(function (data) {
                //convert data from model format to view format
                return data.toString('yyyy-MM-dd');
            });
        }
    };
});