'use strict';

describe('spinner-directives-spec:', function () {

    beforeEach(angular.mock.module('commons.spinner'));

    describe('spinner-spec:', function () {

        var mockCounter, mockEvents;
        var $rootScope, $scope, $compile;

        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockCounter = jasmine.createSpyObj('SpinnerCounter', ['inProgress']);
            $provide.value('SpinnerCounter', mockCounter);
            mockEvents = {COUNTER_CHANGED: 'mock-counter-changed'};
            $provide.value('SPINNER_EVENTS', mockEvents);
        }));

        beforeEach(inject(function ($injector, _$rootScope_, _$compile_) {
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $compile = _$compile_;
        }));

        it('should show spinner when element is created', function () {
            //given any operation status
            mockCounter.inProgress.andReturn(true);
            //when spinner is created
            var spinner = $compile('<spinner/>')($scope);
            $scope.$digest();
            //then spinner status is changed
            expect(mockCounter.inProgress).toHaveBeenCalled();
        });

        it('should change spinner status when operation counter is changed', function () {
            //given any operation status
            mockCounter.inProgress.andReturn(true);
            //and created spinner
            var spinner = $compile('<spinner/>')($scope);
            //when spinner is created
            $rootScope.$broadcast(mockEvents.COUNTER_CHANGED);
            //then spinner status is changed
            expect(mockCounter.inProgress).toHaveBeenCalled();
        });


    });

});