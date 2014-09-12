'use strict';

var directives = angular.module('bolt.directives', []);

/**
 * Definition of authorized element which visibility is controlled based on user's access rights.
 *
 * @param parent parent of managed element
 * @param element element which visibility should be controlled
 * @param reqRoles user roles required to show element
 * @param AuthService service for authorizing user
 */
function AuthorizedElement(parent, element, reqRoles, AuthService) {

    this.parent = parent;
    this.element = element;
    this.reqRoles = reqRoles;
    this.AuthService = AuthService;

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
     * @param eventBus event bus where listening will be made
     * @param AUTH_EVENTS set of events to be listened to in order to change element's visibility
     */
    AuthorizedElement.prototype.attachToEventBus = function (eventBus, AUTH_EVENTS) {
        var checkAccessRights = this.checkAccessRights;
        eventBus.$on(AUTH_EVENTS.USER_LOGGED_IN, function () {
            checkAccessRights();
        });
        eventBus.$on(AUTH_EVENTS.USER_LOGGED_OUT, function () {
            checkAccessRights();
        });
        eventBus.$on(AUTH_EVENTS.SESSION_TIMEOUT, function () {
            checkAccessRights();
        });
    }

}

/**
 * Directive to wrap chosen element into authorized element that visibility
 * will be controlled based on user's access rights
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
            var authElement = new AuthorizedElement(elm.parent(), elm, reqRoles, AuthService);
            authElement.attachToEventBus($scope, AUTH_EVENTS);
            authElement.checkAccessRights();
        }
    }

});