'use strict';

describe('bolt-app-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('bolt'));

    describe('check user access rights:', function () {

        var spyRootScope;
        var mockAuthService, mockState, mockAuthEvents, mockLog, mockSession;

        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockAuthEvents = jasmine.createSpyObj('AuthEvents', ['USER_NOT_AUTHENTICATED', 'USER_NOT_AUTHORIZED']);
            $provide.value('AUTH_EVENTS', mockAuthEvents);
            mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'isAuthorized', 'getCurrentSession']);
            $provide.value('AuthService', mockAuthService);
            mockLog = jasmine.createSpyObj('$log', ['info']);
            $provide.value('$log', mockLog);
            mockState = jasmine.createSpyObj('$state', ['go']);
            $provide.value('$state', mockState);
            mockSession = jasmine.createSpyObj('Session', ['getUserId']);
            $provide.value('Session', mockSession);
        }));

        beforeEach(inject(function (_$rootScope_) {
            //prepare root scope for testing
            spyRootScope = _$rootScope_;
            spyOn(spyRootScope, '$broadcast');
        }));

        it('should deny unauthorized user to see private resource', function () {
            //given user has insufficient role
            mockAuthService.isAuthenticated = function () {
                return true;
            };
            mockAuthService.isAuthorized = function (reqRoles) {
                return false;
            };
            mockAuthService.getCurrentSession = function () {
                return {
                    getUserRole: function () {
                        return 'USER';
                    }
                };
            };
            //when trying to reach private resource
            var nextResource = {url: 'http://bolt.com/private', data: {access: ['ADMIN']}};
            var subScope = spyRootScope.$new();
            subScope.$emit('$stateChangeStart', nextResource);
            //then access to resource is prohibited
            expect(mockState.go).toHaveBeenCalledWith('login');
            //and proper broadcast message is dispatched
            expect(spyRootScope.$broadcast).toHaveBeenCalledWith('auth-not-authorized');
            //and proper log info appears
            expect(mockLog.info).toHaveBeenCalledWith('User is not allowed to see resource http://bolt.com/private - required roles: ADMIN');
            expect(mockLog.info).toHaveBeenCalledWith('User is not allowed to see resource http://bolt.com/private - no sufficient privileges of: USER');
        });

        it('should deny unauthenticated user to see private resource', function () {
            //given user is not logged in
            mockAuthService.isAuthenticated = function () {
                return false;
            };
            mockAuthService.isAuthorized = function (reqRoles) {
                return false;
            };
            mockAuthService.getCurrentSession = function () {
                return {
                    getUserRole: function () {
                        return 'GUEST';
                    }
                };
            };
            //when trying to reach private resource
            var nextResource = {url: 'http://bolt.com/private', data: {access: ['USER']}};
            var subScope = spyRootScope.$new();
            subScope.$emit('$stateChangeStart', nextResource);
            //then access to resource is prohibited
            expect(mockState.go).toHaveBeenCalledWith('login');
            //and proper broadcast message is dispatched
            expect(spyRootScope.$broadcast).toHaveBeenCalledWith('auth-not-authorized');
            //and proper log info appears
            expect(mockLog.info).toHaveBeenCalledWith('User is not allowed to see resource http://bolt.com/private - required roles: USER');
            expect(mockLog.info).toHaveBeenCalledWith('User is not allowed to see resource http://bolt.com/private - no sufficient privileges of: GUEST');
        });

        it('should allow authorized user to see private resource', function () {
            //given user is logged in
            //and user has sufficient access rights
            mockAuthService.isAuthenticated = function () {
                return true;
            };
            mockAuthService.isAuthorized = function (reqRoles) {
                return true;
            };
            mockAuthService.getCurrentSession = function () {
                return {
                    getUserRole: function () {
                        return 'USER';
                    }
                };
            };
            //when trying to reach private resource
            var nextResource = {url: 'http://bolt.com/private', data: {access: ['USER']}};
            var subScope = spyRootScope.$new();
            subScope.$emit('$stateChangeStart', nextResource);
            //then access to resource is granted
            expect(mockState.go).not.toHaveBeenCalledWith('login');
            expect(spyRootScope.$broadcast).not.toHaveBeenCalled();
        });

    });

    describe('check user ownership rights:', function () {

        var spyRootScope;
        var mockStateParams, mockState, mockAuthEvents, mockLog, mockSession;

        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockAuthEvents = {
                'USER_NOT_AUTHORIZED': 'auth-not-authorized'
            };
            $provide.value('AUTH_EVENTS', mockAuthEvents);
            mockLog = jasmine.createSpyObj('$log', ['info']);
            $provide.value('$log', mockLog);
            mockState = jasmine.createSpyObj('$state', ['go']);
            $provide.value('$state', mockState);
            mockStateParams = {};
            $provide.value('$stateParams', mockStateParams);
            mockSession = jasmine.createSpyObj('Session', ['getUserId']);
            $provide.value('Session', mockSession);
        }));

        beforeEach(inject(function (_$rootScope_) {
            //prepare root scope for testing
            spyRootScope = _$rootScope_;
            spyOn(spyRootScope, '$broadcast');
        }));

        it('should grant access to resource if no ownership required', function () {
            //given user is logged in

            //when trying to access resource without ownership rights
            var nextResource = {url: 'http://bolt.com/resource', data: {access: ['USER']}};
            var subScope = spyRootScope.$new();
            subScope.$emit('$stateChangeSuccess', nextResource);

            //then access to resource is granted
            expect(mockState.go).not.toHaveBeenCalledWith('default');
            expect(spyRootScope.$broadcast).not.toHaveBeenCalled();
        });

        it('should grant access to resource to the users with ownership rights', function () {
            //given user is logged in
            var userId = "user-123";
            mockSession.getUserId.andReturn(userId);
            //and resource is allowed only for user-123
            mockState.current = {
                data: {
                    showToParam: 'ownerId'
                }
            };
            mockStateParams.ownerId = userId;

            //when owner is trying to reach his resource
            var nextResource = {url: 'http://bolt.com/resource', data: {access: ['USER']}};
            var subScope = spyRootScope.$new();
            subScope.$emit('$stateChangeSuccess', nextResource);

            //then access to resource is granted
            expect(mockState.go).not.toHaveBeenCalledWith('default');
            expect(spyRootScope.$broadcast).not.toHaveBeenCalled();
        });

        it('should not grant access to resource to the users without ownership rights', function () {
            //given user is logged in
            var userId = "user-123";
            mockSession.getUserId.andReturn(userId);
            //and resource is allowed only for user-123
            mockState.current = {
                data: {
                    showToParam: 'ownerId'
                }
            };
            mockStateParams.ownerId = "diff-user-123";

            //when owner is trying to reach his resource
            var nextResource = {url: 'http://bolt.com/resource', data: {access: ['USER']}};
            var subScope = spyRootScope.$new();
            subScope.$emit('$stateChangeSuccess', nextResource);

            //then access to resource is not granted
            expect(mockState.go).toHaveBeenCalledWith('default');
            expect(spyRootScope.$broadcast).toHaveBeenCalledWith(mockAuthEvents.USER_NOT_AUTHORIZED);
        });

    });

});