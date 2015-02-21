'use strict';

describe('lost-password-spec:', function () {

    describe('LostPasswordCtrl-spec:', function () {

        var ctrlScope;
        var mockAuthService, mockLog, mockAuthEvents, mockState, mockUiNotification;
        /* Deferred response of authentication service */
        var deferredAuthService;

        //prepare module for testing
        beforeEach(angular.mock.module('bolt.login'));

        //prepare controller for testing
        beforeEach(inject(function ($controller, _$rootScope_, $q) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            //mock auth service
            mockAuthService = jasmine.createSpyObj('AuthService', ['regainPassword']);
            deferredAuthService = {
                then: function (f, e) {
                    deferredAuthService.success = f;
                    deferredAuthService.error = e;
                    return deferredAuthService;
                }
            };
            mockAuthService.regainPassword.andReturn(deferredAuthService);
            //mock others
            mockLog = jasmine.createSpyObj('$log', ['debug', 'error']);
            mockState = jasmine.createSpyObj('$state', ['go']);
            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            //inject mocks
            $controller('LostPasswordCtrl', {
                $scope: ctrlScope,
                $state: mockState,
                AuthService: mockAuthService,
                $log: mockLog,
                uiNotification: mockUiNotification
            });
        }));

        it('should start re-set password procedure', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            //and sample user
            var user = {
                email: "user@kunishu.com"
            };

            //when user wants regain control over account
            ctrlScope.regain(user);

            //then re-set password procedure is started
            expect(mockAuthService.regainPassword).toHaveBeenCalledWith(user);
            //and user is redirected to login page after back-end confirmation
            deferredAuthService.success('OK');
            expect(mockState.go).toHaveBeenCalledWith('login');
        });

        it('should inform user when re-set of password has failed', function () {
            //given ctrl is initialized
            expect(ctrlScope).toBeDefined();
            //and sample user
            var user = {
                email: "user@kunishu.com"
            };

            //when user wants regain control over account
            ctrlScope.regain(user);

            //then re-set password procedure is started
            expect(mockAuthService.regainPassword).toHaveBeenCalledWith(user);
            //and user is informed when back-end couldn't handle re-set request
            deferredAuthService.error('ERROR');
            expect(mockState.go).not.toHaveBeenCalled();
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('Lost password info has\'t been sent');
        });

    });

});