'use strict';

describe('doctors-cabinet-spec:', function () {

    beforeEach(angular.mock.module('doctors.cabinet'));

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

    describe('EditCabinetCtrl-spec', function () {

        var ctrlScope;
        var mockUsersService, mockStateParams, mockSession, mockLabels;
        var mockUiNotification, mockLog;
        var userServicePromise;
        var doctorId = 'doctor-123';

        beforeEach(angular.mock.module(function ($provide) {
            mockStateParams = {};
            $provide.value('$stateParams', mockStateParams);
            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            $provide.value('uiNotification', mockUiNotification);
            //mock others
            mockLog = jasmine.createSpyObj('$log', ['debug', 'error']);
            $provide.value('$log', mockLog);
            //mock services
            mockUsersService = jasmine.createSpyObj('UsersService', ['get', 'save']);
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
            mockUsersService.save.andReturn(userServicePromise);
            $provide.value('UsersService', mockUsersService);
        }));

        //prepare controller for testing
        beforeEach(inject(function ($controller, _$rootScope_) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            //mock user session
            mockSession = jasmine.createSpyObj('mockSession', ['getUserId']);
            mockSession.getUserId.andReturn(doctorId);
            //mock others
            mockLabels = jasmine.createSpyObj('mockLabels', ['getSpecializations', 'getTemplates']);
            var labelPromise = {
                then: function (f) {
                    labelPromise.onSuccess = f;
                    return labelPromise;
                }
            };
            mockLabels.getSpecializations.andReturn(labelPromise);
            mockLabels.getTemplates.andReturn(labelPromise);
            //inject mocks
            $controller('EditCabinetCtrl', {
                $scope: ctrlScope,
                UsersService: mockUsersService,
                uiNotification: mockUiNotification,
                Session: mockSession,
                $log: mockLog,
                Labels: mockLabels,
                CABINET_COLORS: ['blue', 'yellow']
            });
        }));

        it('should de-normalize working hours after doctor\'s info is loaded', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //then info about doctor is loaded
            expect(ctrlScope.doctorId).toBe(doctorId);
            expect(mockUsersService.get).toHaveBeenCalledWith(doctorId);
            var mockDoctor = {
                email: 'doctor@kunishu.com',
                locations: [
                    {
                        id: "546b8fd1ef680df8426005c2",
                        name: "Pulsantis",
                        address: {
                            street: "Grabiszynska 8/4",
                            city: "Wroclaw",
                            country: "Poland"
                        },
                        color: "red",
                        working_hours: [
                            {
                                day: "Monday",
                                start: "08:00",
                                end: "10:00"
                            },
                            {
                                day: "Monday",
                                start: "12:00",
                                end: "14:00"
                            },
                            {
                                day: "Tuesday",
                                start: "08:00",
                                end: "16:00"
                            }
                        ],
                        templates: [
                            {
                                _id: "546c1fd1ef660df8526005b1",
                                name: "Ass examination",
                                description: "Details go here...",
                                durations: [30, 60]
                            },
                            {
                                _id: "546c1fd1ef660df8526005b2",
                                name: "Eye examination",
                                description: "Details go here...",
                                durations: [30]
                            }
                        ]
                    }
                ]
            };
            userServicePromise.onSuccess(mockDoctor);
            expect(ctrlScope.doctor).toBe(mockDoctor);
            //and working hours are de-normalized
            expect(ctrlScope.doctor.locations[0].working_hours[0].startDate.toString('HH:mm')).toBe('08:00');
            expect(ctrlScope.doctor.locations[0].working_hours[0].endDate.toString('HH:mm')).toBe('10:00');
        });

        it('should add default location', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //when adding location
            var array = [];
            ctrlScope.addLocation(array);
            //then default location is stored
            expect(array).toEqual([
                {
                    name: "",
                    address: {
                        street: "",
                        city: "",
                        country: ""
                    },
                    color: "turquoise",
                    working_hours: [],
                    templates: [],
                    specializations: []
                }
            ]);
        });

        it('should add default template', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //when adding location
            var array = [];
            ctrlScope.addTemplate(array);
            //then default template is stored
            expect(array).toEqual([
                {
                    name: "",
                    durations: []
                }
            ]);
        });

        it('should add new value', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and allowed values
            var allowedValue = ['1', '2', '3'];
            //when adding new allowed value
            var array = [];
            ctrlScope.addValue(array, '1', allowedValue);
            //then value is added
            expect(array).toEqual(['1']);
        });

        it('should not add un-allowed value', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and allowed values
            var allowedValue = ['1', '2', '3'];
            //when adding new not allowed value
            var array = [];
            ctrlScope.addValue(array, '4', allowedValue);
            //then value is not added
            expect(array).toEqual([]);
        });

        it('should not add duplicated value', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and allowed values
            var allowedValue = ['1', '2', '3'];
            //when adding duplicated value
            var array = ['1'];
            ctrlScope.addValue(array, '1', allowedValue);
            //then new value is not added
            expect(array).toEqual(['1']);
        });

        it('should delete value', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //when deleting value
            var array = ['1', '2', '3'];
            ctrlScope.deleteValue(array, '1');
            //then value is deleted
            expect(array).toEqual(['2', '3']);
        });

        it('should validate template', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and templates
            var templates = [
                {name: 'tem-1'},
                {name: 'tem-2'}
            ];
            //and changed template
            var currTemplate = {name: 'tem-3'};
            //and template field
            var field = {
                $setValidity: function (name, valid) {
                    field.msg = name;
                    field.valid = valid;
                }
            };
            //when validating template
            ctrlScope.onTemplateChange(field, templates, currTemplate);
            //then field is valid
            expect(field.msg).toBe('duplicate');
            expect(field.valid).toBe(true);
        });

        it('should invalidate duplicated templates', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and templates
            var templates = [
                {name: 'tem-1'},
                {name: 'tem-1'},
                {name: 'tem-2'}
            ];
            //and changed template
            var currTemplate = {name: 'tem-1'};
            //and template field
            var field = {
                $setValidity: function (name, valid) {
                    field.msg = name;
                    field.valid = valid;
                }
            };
            //when validating template
            ctrlScope.onTemplateChange(field, templates, currTemplate);
            //then field is valid
            expect(field.msg).toBe('duplicate');
            expect(field.valid).toBe(false);
        });

        it('should validate template duration times', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and changed template
            var currTemplate = {name: 'tem-3', durations: [30]};
            //and template field
            var field = {
                $setValidity: function (name, valid) {
                    field.msg = name;
                    field.valid = valid;
                }
            };
            //when validating template duration times
            ctrlScope.isTemplateDurationValid(field, currTemplate);
            //then field is valid
            expect(field.msg).toBe('durations');
            expect(field.valid).toBe(true);
        });

        it('should validate working hours', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and doctor
            ctrlScope.doctor = {
                email: 'doctor@kunishu.com',
                locations: [
                    {
                        id: "546b8fd1ef680df8426005c2",
                        name: "Pulsantis",
                        address: {
                            street: "Grabiszynska 8/4",
                            city: "Wroclaw",
                            country: "Poland"
                        },
                        color: "red",
                        working_hours: [
                            {
                                day: "Monday",
                                start: "08:00",
                                startDate: Date.today().set({
                                    hour: 8, minute: 0, second: 0
                                }),
                                end: "10:00",
                                endDate: Date.today().set({
                                    hour: 10, minute: 0, second: 0
                                })
                            },
                            {
                                day: "Monday",
                                start: "12:00",
                                startDate: Date.today().set({
                                    hour: 12, minute: 0, second: 0
                                }),
                                end: "14:00",
                                endDate: Date.today().set({
                                    hour: 14, minute: 0, second: 0
                                })
                            },
                            {
                                day: "Tuesday",
                                start: "08:00",
                                startDate: Date.today().set({
                                    hour: 8, minute: 0, second: 0
                                }),
                                end: "16:00",
                                endDate: Date.today().set({
                                    hour: 16, minute: 0, second: 0
                                })
                            }
                        ],
                        templates: [
                            {
                                _id: "546c1fd1ef660df8526005b1",
                                name: "Ass examination",
                                description: "Details go here...",
                                durations: [30, 60]
                            },
                            {
                                _id: "546c1fd1ef660df8526005b2",
                                name: "Eye examination",
                                description: "Details go here...",
                                durations: [30]
                            }
                        ]
                    }
                ]
            };
            //and working hours
            var workingHours = {
                day: "Monday",
                startDate: Date.today().set({
                    hour: 8, minute: 0, second: 0
                }),
                endDate: Date.today().set({
                    hour: 10, minute: 0, second: 0
                })
            };
            //and working hours field
            var field = {
                msg: [],
                valid: [],
                $setValidity: function (name, valid) {
                    field.msg.push(name);
                    field.valid.push(valid);
                }
            };
            //when validating working hours
            ctrlScope.onWorkingHoursChange(field, workingHours);
            //then field order is valid
            expect(field.msg[0]).toBe('order');
            expect(field.valid[0]).toBe(true);
            //and working hours are not overlapped
            expect(field.msg[1]).toBe('duplicate');
            expect(field.valid[1]).toBe(true);
        });

        it('should invalidate overlapped working hours', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and doctor
            ctrlScope.doctor = {
                email: 'doctor@kunishu.com',
                locations: [
                    {
                        id: "546b8fd1ef680df8426005c2",
                        name: "Pulsantis",
                        address: {
                            street: "Grabiszynska 8/4",
                            city: "Wroclaw",
                            country: "Poland"
                        },
                        color: "red",
                        working_hours: [
                            {
                                day: "Monday",
                                start: "08:00",
                                startDate: Date.today().set({
                                    hour: 8, minute: 0, second: 0
                                }),
                                end: "10:00",
                                endDate: Date.today().set({
                                    hour: 10, minute: 0, second: 0
                                })
                            },
                            {
                                day: "Monday",
                                start: "12:00",
                                startDate: Date.today().set({
                                    hour: 12, minute: 0, second: 0
                                }),
                                end: "14:00",
                                endDate: Date.today().set({
                                    hour: 14, minute: 0, second: 0
                                })
                            },
                            {
                                day: "Tuesday",
                                start: "08:00",
                                startDate: Date.today().set({
                                    hour: 8, minute: 0, second: 0
                                }),
                                end: "16:00",
                                endDate: Date.today().set({
                                    hour: 16, minute: 0, second: 0
                                })
                            }
                        ],
                        templates: [
                            {
                                _id: "546c1fd1ef660df8526005b1",
                                name: "Ass examination",
                                description: "Details go here...",
                                durations: [30, 60]
                            },
                            {
                                _id: "546c1fd1ef660df8526005b2",
                                name: "Eye examination",
                                description: "Details go here...",
                                durations: [30]
                            }
                        ]
                    }
                ]
            };
            //and working hours
            var workingHours = {
                day: "Monday",
                startDate: Date.today().set({
                    hour: 8, minute: 0, second: 0
                }),
                endDate: Date.today().set({
                    hour: 15, minute: 0, second: 0
                })
            };
            //and working hours field
            var field = {
                msg: [],
                valid: [],
                $setValidity: function (name, valid) {
                    field.msg.push(name);
                    field.valid.push(valid);
                }
            };
            //when validating working hours
            ctrlScope.onWorkingHoursChange(field, workingHours);
            //then field order is valid
            expect(field.msg[0]).toBe('order');
            expect(field.valid[0]).toBe(true);
            //and working hours are overlapped
            expect(field.msg[1]).toBe('duplicate');
            expect(field.valid[1]).toBe(false);
        });

        it('should invalidate working hours in wrong order', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and doctor
            ctrlScope.doctor = {
                email: 'doctor@kunishu.com',
                locations: [
                    {
                        id: "546b8fd1ef680df8426005c2",
                        name: "Pulsantis",
                        address: {
                            street: "Grabiszynska 8/4",
                            city: "Wroclaw",
                            country: "Poland"
                        },
                        color: "red",
                        working_hours: [
                            {
                                day: "Monday",
                                start: "08:00",
                                startDate: Date.today().set({
                                    hour: 8, minute: 0, second: 0
                                }),
                                end: "10:00",
                                endDate: Date.today().set({
                                    hour: 10, minute: 0, second: 0
                                })
                            },
                            {
                                day: "Monday",
                                start: "12:00",
                                startDate: Date.today().set({
                                    hour: 12, minute: 0, second: 0
                                }),
                                end: "14:00",
                                endDate: Date.today().set({
                                    hour: 14, minute: 0, second: 0
                                })
                            },
                            {
                                day: "Tuesday",
                                start: "08:00",
                                startDate: Date.today().set({
                                    hour: 8, minute: 0, second: 0
                                }),
                                end: "16:00",
                                endDate: Date.today().set({
                                    hour: 16, minute: 0, second: 0
                                })
                            }
                        ],
                        templates: [
                            {
                                _id: "546c1fd1ef660df8526005b1",
                                name: "Ass examination",
                                description: "Details go here...",
                                durations: [30, 60]
                            },
                            {
                                _id: "546c1fd1ef660df8526005b2",
                                name: "Eye examination",
                                description: "Details go here...",
                                durations: [30]
                            }
                        ]
                    }
                ]
            };
            //and working hours
            var workingHours = {
                day: "Monday",
                startDate: Date.today().set({
                    hour: 10, minute: 0, second: 0
                }),
                endDate: Date.today().set({
                    hour: 8, minute: 0, second: 0
                })
            };
            //and working hours field
            var field = {
                msg: [],
                valid: [],
                $setValidity: function (name, valid) {
                    field.msg.push(name);
                    field.valid.push(valid);
                }
            };
            //when validating working hours
            ctrlScope.onWorkingHoursChange(field, workingHours);
            //then field order is invalid
            expect(field.msg[0]).toBe('order');
            expect(field.valid[0]).toBe(false);
            //and working hours are not overlapped
            expect(field.msg[1]).toBe('duplicate');
            expect(field.valid[1]).toBe(true);
        });

        it('should change office info', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and doctor
            var doctor = {
                email: 'doctor@kunishu.com',
                locations: [
                    {
                        id: "546b8fd1ef680df8426005c2",
                        name: "Pulsantis",
                        address: {
                            street: "Grabiszynska 8/4",
                            city: "Wroclaw",
                            country: "Poland"
                        },
                        color: "red",
                        working_hours: [
                            {
                                day: "Monday",
                                startDate: Date.today().set({
                                    hour: 8, minute: 0, second: 0
                                }),
                                endDate: Date.today().set({
                                    hour: 10, minute: 0, second: 0
                                })
                            },
                            {
                                day: "Monday",
                                startDate: Date.today().set({
                                    hour: 12, minute: 0, second: 0
                                }),
                                endDate: Date.today().set({
                                    hour: 14, minute: 0, second: 0
                                })
                            }
                        ]
                    }
                ]
            };
            //when saving changes
            ctrlScope.save(doctor);
            //then working hours are normalized
            //info is saved
            expect(mockUsersService.save).toHaveBeenCalledWith(
                {
                    email: 'doctor@kunishu.com',
                    locations: [{
                        id: '546b8fd1ef680df8426005c2',
                        name: 'Pulsantis',
                        address: {street: 'Grabiszynska 8/4', city: 'Wroclaw', country: 'Poland'},
                        color: 'red',
                        working_hours: [
                            {day: 'Monday', start: '08:00', end: '10:00'},
                            {day: 'Monday', start: '12:00', end: '14:00'}
                        ]
                    }]
                }
            );
            userServicePromise.onSuccess('OK');
        });

        it('should inform user when office info couldn\'t be saved', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and doctor
            var doctor = {
                email: 'doctor@kunishu.com',
                locations: [
                    {
                        id: "546b8fd1ef680df8426005c2",
                        name: "Pulsantis",
                        address: {
                            street: "Grabiszynska 8/4",
                            city: "Wroclaw",
                            country: "Poland"
                        },
                        color: "red",
                        working_hours: [
                            {
                                day: "Monday",
                                startDate: Date.today().set({
                                    hour: 8, minute: 0, second: 0
                                }),
                                endDate: Date.today().set({
                                    hour: 10, minute: 0, second: 0
                                })
                            },
                            {
                                day: "Monday",
                                startDate: Date.today().set({
                                    hour: 12, minute: 0, second: 0
                                }),
                                endDate: Date.today().set({
                                    hour: 14, minute: 0, second: 0
                                })
                            }
                        ]
                    }
                ]
            };
            //when saving changes
            ctrlScope.save(doctor);
            //then working hours are normalized
            //info is saved
            expect(mockUsersService.save).toHaveBeenCalledWith(
                {
                    email: 'doctor@kunishu.com',
                    locations: [{
                        id: '546b8fd1ef680df8426005c2',
                        name: 'Pulsantis',
                        address: {street: 'Grabiszynska 8/4', city: 'Wroclaw', country: 'Poland'},
                        color: 'red',
                        working_hours: [
                            {day: 'Monday', start: '08:00', end: '10:00'},
                            {day: 'Monday', start: '12:00', end: '14:00'}
                        ]
                    }]
                }
            );
            //and user is informed about failure
            userServicePromise.onError('ERROR');
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('Changes hasn\'t been saved');
        });


    });

})
;