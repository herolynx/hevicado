'use strict';

var directives = angular.module('bolt.directives', []);

/**
 * Definition of authorized element which visibility is controlled based on user's access rights.
 *
 * @param element element which visibility should be controlled
 * @param children children of element
 * @param reqRoles user roles required to show element
 * @param AuthService service for authorizing user
 */
function AuthorizedElement(element, children, reqRoles, AuthService) {

    /**
     * Verify user's current access rights and
     * show/hide managed element based on results
     */
    AuthorizedElement.prototype.checkAccessRights = function () {
        if (!AuthService.isAuthorized(reqRoles)) {
            //hide element first
            element.hide();
            //remove all its children
            element.empty();
        } else {
            //add element's children
            for (var i = 0; i < children.length; i++) {
                element.append(children[i]);
            }
            //show element
            element.show('slow');
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
 * Directive to wrap chosen element into authorized element that contet visibility
 * will be controlled based on user's access rights.
 * Children of authorized element will be added/removed based on authorization results.
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
            var authElement = new AuthorizedElement(elm, elm.children(), reqRoles, AuthService);
            authElement.attachToEventBus($scope, AUTH_EVENTS);
            authElement.checkAccessRights();
        }
    }

});