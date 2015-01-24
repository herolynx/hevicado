'use strict';

var commonsUsersDirectives = angular.module('commons.users.directives', [
    'commons.users.filters'
]);

/**
 * Directive for handling dates according to user's settings
 */
commonsUsersDirectives.directive('dateInput', ['$filter', function ($filter) {
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
                return $filter('dateFormat')(data);
            });
        }
    };
}]);

/**
 * Directive responsible for changing elements according to user's profile
 * @param AUTH_EVENTS events related with changing user's settings
 * @param Session current user's settings
 */
commonsUsersDirectives.directive('userTheme', ['AUTH_EVENTS', 'Session', function (AUTH_EVENTS, Session) {

    var oldProfile = null;

    /**
     * Change color of the element according to user's settings
     * @param elm elemnt to be changed
     */
    var changeColor = function (elm) {
        if (oldProfile !== null) {
            elm.removeClass(oldProfile.theme);
        }
        oldProfile = Session.getProfile();
        elm.addClass(Session.getProfile().theme);
    };

    return {
        restrict: 'A',
        link: function ($scope, element, attrs) {
            changeColor(element);
            $scope.$on(AUTH_EVENTS.SESSION_REFRESH, function () {
                changeColor(element);
            });
            $scope.$on(AUTH_EVENTS.USER_LOGGED_IN, function () {
                changeColor(element);
            });
            $scope.$on(AUTH_EVENTS.USER_LOGGED_OUT, function () {
                changeColor(element);
            });
        }
    };
}]);