'use strict';

describe('info-cabinet-spec:', function () {

    beforeEach(angular.mock.module('users.cabinet'));

    describe('CabinetInfoCtrl-spec', function () {

        var ctrlScope;
        var mockUsersService, mockStateParams;
        var mockUiNotification;
        var userServicePromise;

        //prepare controller for testing
        beforeEach(inject(function ($controller, _$rootScope_) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            //mock services
            mockUsersService = jasmine.createSpyObj('UsersService', ['get']);
            userServicePromise = {
                success: function (f) {
                    userServicePromise.onSuccess = f;
                    return userServicePromise;
                },
                error: function (f) {
                    userServicePromise.onError = f;
                    return userServicePromise;
                }
            };
            mockUsersService.get.andReturn(userServicePromise);
            //mock others
            mockStateParams = {};
            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            var mockLog = jasmine.createSpyObj('$log', ['debug', 'error']);
            //inject mocks
            $controller('CabinetInfoCtrl', {
                $scope: ctrlScope,
                $stateParams: mockStateParams,
                UsersService: mockUsersService,
                uiNotification: mockUiNotification,
                $log: mockLog
            });
        }));

        it('should load info about doctor\'s office', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and sample doctor
            var doctorId = 'doctor-123';
            //when controller is initialized
            ctrlScope.init(doctorId);
            //then info about doctor is loaded
            expect(ctrlScope.doctorId).toBe(doctorId);
            expect(mockUsersService.get).toHaveBeenCalledWith(doctorId);
            var mockDoctor = {email: 'doctor@kunishu.com'};
            userServicePromise.onSuccess(mockDoctor);
            expect(ctrlScope.doctor).toBe(mockDoctor);
        });

        it('should inform user when info about doctor\'s office couldn\'t be loaded', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and sample doctor
            var doctorId = 'doctor-123';
            //when controller is initialized
            ctrlScope.init(doctorId);
            //and back-end responded with failure
            expect(ctrlScope.doctorId).toBe(doctorId);
            expect(mockUsersService.get).toHaveBeenCalledWith(doctorId);
            userServicePromise.onError('ERROR');
            //then user is informed properly
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('Doctor\'s info not loaded - part of functionality may not workking properly');
        });

    });

})
;