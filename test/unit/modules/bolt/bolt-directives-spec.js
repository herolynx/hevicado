'use strict';

describe('bolt-directives-spec:', function () {

    beforeEach(angular.mock.module('bolt.directives'));

    describe('authorized-element-spec:', function () {

        var mockParent, mockElement, mockReqRoles, mockAuthService;
        var mockEventBus, mockAuthEvents;

        beforeEach(function () {
            //mock dependencies
            mockParent = jasmine.createSpyObj('parent', ['append']);
            mockElement = jasmine.createSpyObj('element', ['remove']);
            mockAuthEvents = jasmine.createSpyObj('AUTH_EVENTS', ['USER_LOGGED_IN', 'USER_LOGGED_OUT', 'SESSION_TIMEOUT']);
            mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthorized']);
            //prepapre event-bus
            mockEventBus = {

                handlers: {},

                $on: function (event, callback) {
                    this.handlers[event] = callback;
                }
            };
        });

        it('should hide element for unauthorized user', function () {
            //given user is not authorized
            mockAuthService.isAuthorized = function (reqRoles) {
                return false;
            };
            //and authorized element
            var authElement = new AuthorizedElement(mockParent, mockElement, ['userRole'], mockAuthService);
            //when user access rights are checked
            authElement.checkAccessRights();
            //then element is hidden
            expect(mockElement.remove).toHaveBeenCalled();
        });

        it('should show element to authorized user', function () {
            //given user is authorized
            mockAuthService.isAuthorized = function (reqRoles) {
                return true;
            };
            //and authorized element
            var authElement = new AuthorizedElement(mockParent, mockElement, ['userRole'], mockAuthService);
            //when user access rights are checked
            authElement.checkAccessRights();
            //then element is shown
            expect(mockParent.append).toHaveBeenCalledWith(mockElement);
        });

        it('should attach to event bus and listen to proper events', function () {
            //given authorized element
            var authElement = new AuthorizedElement(mockParent, mockElement, ['userRole'], mockAuthService);
            //when auth is attached to event bus
            authElement.attachToEventBus(mockEventBus, mockAuthEvents);
            //then auth is waiting for proper events to occur on event bus to change element's visibility
            expect(mockEventBus.handlers[mockAuthEvents.USER_LOGGED_IN]).not.toBeNull();
            expect(mockEventBus.handlers[mockAuthEvents.USER_LOGGED_OUT]).not.toBeNull();
            expect(mockEventBus.handlers[mockAuthEvents.SESSION_TIMEOUT]).not.toBeNull();
        });

        it('should authorize user when user is logged in', function () {
            //given authorized element
            var authElement = new AuthorizedElement(mockParent, mockElement, ['userRole'], mockAuthService);
            //and  element is attached to event bus
            authElement.attachToEventBus(mockEventBus, mockAuthEvents);
            //when user is logged in
            mockEventBus.handlers[mockAuthEvents.USER_LOGGED_IN]();
            //then user access rights are checked
            expect(mockAuthService.isAuthorized).toHaveBeenCalledWith(['userRole']);
        });

        it('should authorize user when user is logging out', function () {
            //given authorized element
            var authElement = new AuthorizedElement(mockParent, mockElement, ['userRole'], mockAuthService);
            //and  element is attached to event bus
            authElement.attachToEventBus(mockEventBus, mockAuthEvents);
            //when user is logged in
            mockEventBus.handlers[mockAuthEvents.USER_LOGGED_OUT]();
            //then user access rights are checked
            expect(mockAuthService.isAuthorized).toHaveBeenCalledWith(['userRole']);
        });

        it('should authorize user when session has expired', function () {
            //given authorized element
            var authElement = new AuthorizedElement(mockParent, mockElement, ['userRole'], mockAuthService);
            //and  element is attached to event bus
            authElement.attachToEventBus(mockEventBus, mockAuthEvents);
            //when user is logged in
            mockEventBus.handlers[mockAuthEvents.SESSION_TIMEOUT]();
            //then user access rights are checked
            expect(mockAuthService.isAuthorized).toHaveBeenCalledWith(['userRole']);
        });

    });

    describe('permission-spec:', function () {

        // it('should print current version of the app', function () {
        //     angular.mock.module(function ($provide) {
        //         $provide.value('version', 'TEST_VER');
        //     });
        //     inject(function ($compile, $rootScope) {
        //         var element = $compile('<span app-version></span>')($rootScope);
        //         expect(element.text()).toEqual('TEST_VER');
        //     });
        // });

    });

});