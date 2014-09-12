'use strict';

var directives = angular.module('bolt.directives', []);

/**
 * Definition of authorized element which visibility is controlled based on user's access rights.
 *
 * @param $scope current scope where element is attached to
 * @param parent parent of managed element
 * @param element element which visibility should be controlled
 * @param reqRoles user roles required to shod element
 * @param AuthService service for authorizing user
 * @param AUTH_EVENTS events that will be listened in order to change element's visibility
 */
function AuthorizedElement($scope, parent, element, reqRoles, AuthService, AUTH_EVENTS) {

    /**
     * Verify user's current access rights and
     * show/hide managed element based on results
     */
    AuthorizedElement.prototype.checkAccessRights = function () {
        if (!AuthService.isAuthorized(reqRoles)) {
            element.remove();
        } else {
            parent.append(element);
        }
    }

    /**
     * Attach managed element to event-bus so its visibility
     * can be changed when proper events occur
     */
    AuthorizedElement.prototype.attachToEventBus = function () {
        var checkAccessRights = this.checkAccessRights;
        $scope.$on(AUTH_EVENTS.USER_LOGGED_IN, function () {
            checkAccessRights();
        });
        $scope.$on(AUTH_EVENTS.USER_LOGGED_OUT, function () {
            checkAccessRights();
        });
        $scope.$on(AUTH_EVENTS.SESSION_TIMEOUT, function () {
            checkAccessRights();
        });
    }

    this.checkAccessRights();
    this.attachToEventBus();
}

/**
 * Directive manages visibility of chosen element based on requried access rights
 * and user's current access rights.
 * @param AuthService service for authorizing user
 * @param AUTH_EVENTS events that will be listened in order to change element's visibility
 */
directives.directive('permission', function (AuthService, AUTH_EVENTS) {

    return {
        restrict: 'E',
        template: '',
        scope: {
            roles: '@'
        },
        link: function ($scope, elm, attrs) {
            var reqRoles = $scope.roles.split(',');
            new AuthorizedElement($scope, elm.parent(), elm, reqRoles, AuthService, AUTH_EVENTS);
        }
    }

});