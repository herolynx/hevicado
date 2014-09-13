'use strict';

describe('bolt-directives-spec:', function () {

    beforeEach(angular.mock.module('bolt.directives'));

    describe('authorized-element-spec:', function () {

        var mockElement, mockChildren, mockReqRoles, mockAuthService;
        var mockEventBus, mockAuthEvents;

        beforeEach(function () {
            //mock dependencies
            mockElement = jasmine.createSpyObj('element', ['show', 'hide', 'empty', 'append']);
            mockChildren = ["1", "2"];
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
            var authElement = new AuthorizedElement(mockElement, mockChildren, ['userRole'], mockAuthService);
            //when user access rights are checked
            authElement.checkAccessRights();
            //then element is hidden
            expect(mockElement.empty).toHaveBeenCalled();
            expect(mockElement.hide).toHaveBeenCalled();
        });

        it('should show element to authorized user', function () {
            //given user is authorized
            mockAuthService.isAuthorized = function (reqRoles) {
                return true;
            };
            //and authorized element
            var authElement = new AuthorizedElement(mockElement, mockChildren, ['userRole'], mockAuthService);
            //when user access rights are checked
            authElement.checkAccessRights();
            //then element is shown
            expect(mockElement.append).toHaveBeenCalledWith('1');
            expect(mockElement.append).toHaveBeenCalledWith('2');
            expect(mockElement.show).toHaveBeenCalledWith('slow');
        });

        it('should attach to event bus and listen to proper events', function () {
            //given authorized element
            var authElement = new AuthorizedElement(mockElement, mockChildren, ['userRole'], mockAuthService);
            //when auth is attached to event bus
            authElement.attachToEventBus(mockEventBus, mockAuthEvents);
            //then auth is waiting for proper events to occur on event bus to change element's visibility
            expect(mockEventBus.handlers[mockAuthEvents.USER_LOGGED_IN]).not.toBeNull();
            expect(mockEventBus.handlers[mockAuthEvents.USER_LOGGED_OUT]).not.toBeNull();
            expect(mockEventBus.handlers[mockAuthEvents.SESSION_TIMEOUT]).not.toBeNull();
        });

        it('should authorize user when user is logged in', function () {
            //given authorized element
            var authElement = new AuthorizedElement(mockElement, mockChildren, ['userRole'], mockAuthService);
            //and  element is attached to event bus
            authElement.attachToEventBus(mockEventBus, mockAuthEvents);
            //when user is logged in
            mockEventBus.handlers[mockAuthEvents.USER_LOGGED_IN]();
            //then user access rights are checked
            expect(mockAuthService.isAuthorized).toHaveBeenCalledWith(['userRole']);
        });

        it('should authorize user when user is logging out', function () {
            //given authorized element
            var authElement = new AuthorizedElement(mockElement, mockChildren, ['userRole'], mockAuthService);
            //and  element is attached to event bus
            authElement.attachToEventBus(mockEventBus, mockAuthEvents);
            //when user is logged in
            mockEventBus.handlers[mockAuthEvents.USER_LOGGED_OUT]();
            //then user access rights are checked
            expect(mockAuthService.isAuthorized).toHaveBeenCalledWith(['userRole']);
        });

        it('should authorize user when session has expired', function () {
            //given authorized element
            var authElement = new AuthorizedElement(mockElement, mockChildren, ['userRole'], mockAuthService);
            //and  element is attached to event bus
            authElement.attachToEventBus(mockEventBus, mockAuthEvents);
            //when user is logged in
            mockEventBus.handlers[mockAuthEvents.SESSION_TIMEOUT]();
            //then user access rights are checked
            expect(mockAuthService.isAuthorized).toHaveBeenCalledWith(['userRole']);
        });

    });

    describe('permission-spec:', function () {

        var mockAuthService, mockAuthEvents;
        var $rootScope, $scope, $compile;

        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockAuthEvents = jasmine.createSpyObj('AUTH_EVENTS', ['USER_LOGGED_IN', 'USER_LOGGED_OUT', 'SESSION_TIMEOUT']);
            $provide.value('AUTH_EVENTS', mockAuthEvents);
            mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthorized']);
            $provide.value('AuthService', mockAuthService);
        }));

        beforeEach(inject(function ($injector, _$rootScope_, _$compile_) {
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $compile = _$compile_;
        }));

        it('should hide element for un-authorized user', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //and user is un-authorized
            mockAuthService.isAuthorized = function (reqRoles) {
                return false;
            };
            //when auth element is created
            var element = $compile('<div><permission roles="client"><div>1</div></permission></div>')($scope);
            //then element is not visible
            expect(element.text()).toEqual('');
        });

        it('should hide element context for un-authorized user', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //and user is un-authorized
            mockAuthService.isAuthorized = function (reqRoles) {
                return false;
            };
            //when auth element is created
            var element = $compile('<div><permission roles="client">1</permission></div>')($scope);
            //then element is not visible
            expect(element.text()).toEqual('');
        });

        it('should show element for authorized user', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //and user is authorized
            mockAuthService.isAuthorized = function (reqRoles) {
                return true;
            };
            //when auth element is created
            var element = $compile('<div><permission roles="client"><div>1</div></permission></div>')($scope);
            //then element is visible
            expect(element.text()).toEqual('1');
        });

        it('should show element context for authorized user', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //and user is authorized
            mockAuthService.isAuthorized = function (reqRoles) {
                return true;
            };
            //when auth element is created
            var element = $compile('<div><permission roles="client">1</permission></div>')($scope);
            //then element is visible
            expect(element.text()).toEqual('1');
        });

        it('should keep order inside of single authorized element', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //and user is authorized
            mockAuthService.isAuthorized = function (reqRoles) {
                return true;
            };
            //when auth element is created
            var element = $compile('<div><permission roles="client"><div>1</div><div>2</div></permission></div>')($scope);
            //then order of child elements is kept
            expect(element.text()).toEqual('12');
        });

        it('should keep order between authorized elements', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //and user is authorized
            mockAuthService.isAuthorized = function (reqRoles) {
                return true;
            };
            //when auth element is created
            var element = $compile('<div>' +
                '<permission roles="client"><div>1</div></permission>' +
                '<permission roles="client"><div>2</div></permission>' +
                '</div>')($scope);
            //then order of elements is kept
            expect(element.text()).toEqual('12');
        });

        it('should keep order after element becomes visible again', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //and user is un-authorized
            mockAuthService.isAuthorized = function (reqRoles) {
                return false;
            };
            //and auth element is created
            var element = $compile('<div>' +
                '<permission roles="client"><div>1</div></permission>' +
                '<div>2</div>' +
                '</div>')($scope);
            expect(element.text()).toEqual('2');
            //when user becomes authorized
            mockAuthService.isAuthorized = function (reqRoles) {
                return true;
            };
            $rootScope.$broadcast(mockAuthEvents.USER_LOGGED_IN);
            //then order of elements is kept
            expect(element.text()).toEqual('12');
        });

        it('should keep order of all after element becomes visible again', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //and user is un-authorized
            mockAuthService.isAuthorized = function (reqRoles) {
                return false;
            };
            //and auth element is created
            var element = $compile('<div>' +
                'text1-' +
                '<permission roles="client"><div>1-</div></permission>' +
                '<div>2-</div>' +
                'text2-' +
                '<permission roles="client"><div>3-</div></permission>' +
                '<div>4</div>' +
                '</div>')($scope);
            expect(element.text()).toEqual('text1-2-text2-4');
            //when user becomes authorized
            mockAuthService.isAuthorized = function (reqRoles) {
                return true;
            };
            $rootScope.$broadcast(mockAuthEvents.USER_LOGGED_IN);
            //then order of elements is kept
            expect(element.text()).toEqual('text1-1-2-text2-3-4');
        });

    });

});