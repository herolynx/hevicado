'use strict';

describe('chronos-search-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('chronos.search'));

    describe('SearchDoctorCtrl-spec:', function () {

        beforeEach(angular.mock.module('chronos'));

        var mockCalendarService, mockUiNotification;
        var searchPromise;
        var ctrlScope;

        //prepare controller for testing
        beforeEach(inject(function ($controller, $injector, _$rootScope_) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            //mock dependencies
            mockCalendarService = jasmine.createSpyObj('mockCalendarService', ['search']);
            searchPromise = {
                success: function (f) {
                    searchPromise.onSuccess = f;
                    return searchPromise;
                },
                error: function (f) {
                    searchPromise.onError = f;
                    return searchPromise;
                }
            };
            mockCalendarService.search.andReturn(searchPromise);
            mockUiNotification = jasmine.createSpyObj('mockUiNotification', ['text', 'error']);
            mockUiNotification.text = function (title, msg) {
                mockUiNotification.title = title;
                mockUiNotification.msg = msg;
                return mockUiNotification;
            };
            var mockLog = jasmine.createSpyObj('mockLog', ['debug', 'info', 'error']);
            //inject mocks
            $controller('SearchDoctorCtrl', {
                $scope: ctrlScope,
                $log: mockLog,
                CalendarService: mockCalendarService,
                EventUtils: $injector.get('EventUtils'),
                uiNotification: mockUiNotification
            });
        }));

        it('should initialize default state of controller', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //when controller is reached
            //then time table for search is set
            expect(ctrlScope.criteria.start).not.toBeNull();
            expect(ctrlScope.criteria.end).not.toBeNull();
        });

        it('should add specialization to search criteria', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and sample specialization
            var spec = {
                key: "spec-1",
                value: "spec.label"
            };
            //when specialization is added to search criteria
            ctrlScope.addSpecialization(spec);
            //then specialization is saved
            expect(ctrlScope.criteria.specializations.length).toBe(1);
            expect(ctrlScope.criteria.specializations).toEqual([spec]);
        });

        it('should remove specialization from search criteria', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and chosen specialization in search
            var spec = {
                key: "spec-1",
                value: "spec.label"
            };
            ctrlScope.addSpecialization(spec);
            expect(ctrlScope.criteria.specializations.length).toBe(1);
            //when specialization is deleted from search criteria
            ctrlScope.deleteSpecialization(spec);
            //then specialization is removed
            expect(ctrlScope.criteria.specializations.length).toBe(0);
        });

        it('should set search time table', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and new time table
            var start = new Date().set({
                day: 12,
                month: 6,
                year: 2014,
                hour: 0,
                minute: 0,
                second: 0
            });
            var daysCount = 6;
            //when new time table is set
            ctrlScope.initTimetable(start, daysCount);
            //then new time table is set in search criteria
            expect(ctrlScope.criteria.start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-07-07 00:00:00');
            expect(ctrlScope.criteria.end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-07-12 23:59:59');
        });

        it('should shift time table', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //current time table
            var start = new Date().set({
                day: 12,
                month: 6,
                year: 2014,
                hour: 0,
                minute: 0,
                second: 0
            });
            var daysCount = 7;
            ctrlScope.initTimetable(start, daysCount);
            expect(ctrlScope.criteria.start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-07-07 00:00:00');
            expect(ctrlScope.criteria.end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-07-13 23:59:59');
            //when time table is shifted
            ctrlScope.moveDays(daysCount);
            //then time table is updated in search criteria
            expect(ctrlScope.criteria.start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-07-14 00:00:00');
            expect(ctrlScope.criteria.end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-07-20 23:59:59');
        });


        it('should start searching doctors', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and search criteria
            ctrlScope.start = new Date().set({
                day: 12,
                month: 6,
                year: 2014,
                hour: 0,
                minute: 0,
                second: 0
            });
            //and current state of controller
            ctrlScope.doctors = [{
                id: 1,
                name: "sample doctor"
            }];
            ctrlScope.criteria.startIndex = 10;
            ctrlScope.loading = false;
            //when searching for new results
            ctrlScope.search();
            //then new time table is set according to search criteria
            expect(ctrlScope.criteria.start.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-07-07 00:00:00');
            expect(ctrlScope.criteria.end.toString('yyyy-MM-dd HH:mm:ss')).toBe('2014-07-13 23:59:59');
            //and state is cleared
            expect(ctrlScope.doctors.length).toBe(0);
            expect(ctrlScope.criteria.startIndex).toBe(0);
            //and load of data has begun
            expect(ctrlScope.loading).toBe(true);
            expect(mockCalendarService.search).toHaveBeenCalledWith(ctrlScope.criteria);
        });

        it('should find doctors according to search criteria', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and search criteria
            ctrlScope.start = new Date().set({
                day: 12,
                month: 6,
                year: 2014,
                hour: 0,
                minute: 0,
                second: 0
            });
            //and current state of controller
            ctrlScope.doctors = [];
            ctrlScope.criteria.startIndex = 10;
            ctrlScope.loading = false;
            //when searching for new results
            ctrlScope.search();
            //and back-end has responsed successfully
            expect(mockCalendarService.search).toHaveBeenCalledWith(ctrlScope.criteria);
            var doctors = [{
                id: 1,
                name: 'doctor'
            }];
            searchPromise.onSuccess(doctors);
            //then doctors data is loaded properly
            expect(ctrlScope.doctors).toEqual(doctors);
            //and load of data is finished
            expect(ctrlScope.loading).toBe(false);
        });

        it('should inform users when doctors cannot be found', function () {
            //given controller is initialized
            expect(ctrlScope).toBeDefined();
            //and search criteria
            ctrlScope.start = new Date().set({
                day: 12,
                month: 6,
                year: 2014,
                hour: 0,
                minute: 0,
                second: 0
            });
            //and current state of controller
            ctrlScope.doctors = [];
            ctrlScope.criteria.startIndex = 10;
            ctrlScope.loading = false;
            //when searching for new results
            ctrlScope.search();
            //and back-end has responded with failure
            expect(mockCalendarService.search).toHaveBeenCalledWith(ctrlScope.criteria);
            searchPromise.onError('ERROR');
            //then user is informed that search has failed
            expect(mockUiNotification.error).toHaveBeenCalled();
            expect(mockUiNotification.title).toBe('Error');
            expect(mockUiNotification.msg).toBe('Couldn\'t find doctors');
            //and load of data is finished
            expect(ctrlScope.loading).toBe(false);
        });

    });

});