'use strict';

describe('commons.labels.directives-spec:', function () {

    var $rootScope, $scope, $compile;
    var mockFilter, mockCalled;

    //prepare module for testing
    beforeEach(angular.mock.module('commons.labels.directives'));

    beforeEach(angular.mock.module(function ($provide) {
        //mock dependencies
        mockCalled = {};
        mockFilter = function (name) {
            mockCalled.filterName = name;
            return function (value) {
                mockCalled.value = value;
                return value;
            }
        };
        $provide.value('$filter', mockFilter);
    }));

    beforeEach(inject(function ($injector, _$rootScope_, _$compile_) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $compile = _$compile_;
    }));

    describe('labelInput-spec:', function () {

        it('should convert model key to view label', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //when input key is set
            $scope.modelValue = '$$key1';
            var element = angular.element(
                '<form name="form">' +
                '<input name="label" label-input prefix="area" ng-model="modelValue">' +
                '</form>'
            );
            var compiled = $compile(element)($scope);
            $scope.$digest();
            //then label is created
            expect($scope.form.label.$viewValue).toBe('area.$$key1');
            expect(mockCalled.filterName).toBe('translate');
            expect(mockCalled.value).toBe('area.$$key1');
        });

        it('should convert model text to view text', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //when input key is set
            $scope.modelValue = 'text';
            var element = angular.element(
                '<form name="form">' +
                '<input name="label" label-input prefix="area" ng-model="modelValue">' +
                '</form>'
            );
            var compiled = $compile(element)($scope);
            $scope.$digest();
            //then label is created
            expect($scope.form.label.$viewValue).toBe('text');
            expect(mockCalled.filterName).not.toBeDefined();
            expect(mockCalled.value).not.toBeDefined();
        });

    });

});