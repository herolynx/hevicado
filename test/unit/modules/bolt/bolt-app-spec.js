'use strict';

describe('bolt-app-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('bolt'));

    describe('check user access rights:', function () {

        var spyRootScope;
        var mockAuthService, mockState, mockAuthEvents, mockLog;

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
                }
            };
            //when trying to reach private resource
            var nextResource = { url: 'http://bolt.com/private', data: { access: [ 'ADMIN' ] } };
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
                }
            };
            //when trying to reach private resource
            var nextResource = { url: 'http://bolt.com/private', data: { access: [ 'USER' ] } };
            var subScope = spyRootScope.$new();
            subScope.$emit('$stateChangeStart', nextResource);
            //then access to resource is prohibited
            expect(mockState.go).toHaveBeenCalledWith('login');
            //and proper broadcast message is dispatched
            expect(spyRootScope.$broadcast).toHaveBeenCalledWith('auth-not-authenticated');
            //and proper log info appears
            expect(mockLog.info).toHaveBeenCalledWith('User is not allowed to see resource http://bolt.com/private - required roles: USER');
            expect(mockLog.info).toHaveBeenCalledWith('User is not allowed to see resource http://bolt.com/private - user is not logged in');
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
                }
            };
            //when trying to reach private resource
            var nextResource = { url: 'http://bolt.com/private', data: { access: [ 'USER' ] } };
            var subScope = spyRootScope.$new();
            subScope.$emit('$stateChangeStart', nextResource);
            //then access to resource is granted
            expect(mockState.go).not.toHaveBeenCalledWith('login');
            expect(spyRootScope.$broadcast).not.toHaveBeenCalled();
        });

    });

});