'use strict';

describe('commons.maps.directives-spec:', function () {

    var $rootScope, $scope, $compile, $httpBackend;
    var mockMapService;

    //prepare module for testing
    beforeEach(angular.mock.module('commons.maps.directives'));

    beforeEach(angular.mock.module(function ($provide) {
        //mock dependencies
        mockMapService = {
            find: function (address, callback) {
                mockMapService.address = address;
                mockMapService.callback = callback;
            }
        };
        $provide.value('MapService', mockMapService);
        var mockLog = jasmine.createSpyObj('$log', ['debug']);
        $provide.value('$log', mockLog);
    }));

    beforeEach(inject(function ($injector, _$rootScope_, _$compile_) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $compile = _$compile_;
        $httpBackend = $injector.get('$httpBackend');
        $httpBackend.expectGET('modules/commons/maps/partials/map.html').respond(200, '<div>map template</div>');
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('googleMap-spec:', function () {

        it('should display location on google map', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //and sample address
            var address = {
                street: 'ul. Grabiszynska 8',
                city: 'Wroclaw',
                country: 'Polska'
            };
            $scope.testAddress = address;
            $scope.testtTitle = "Grabiszynska street view";
            //when google map is created
            var element = angular.element(
                '<div>' +
                '<google-map address="testAddress" title="testTitle"/>' +
                '</div>'
            );
            var compiled = $compile(element)($scope);
            //$scope.$digest();
            $scope.$digest();
            //then proper location is searched
            expect($scope.title).toBe('Grabiszynska street view');
            expect($scope.address).toBe(address);
            expect(mockMapService.address).toBe(address);
            expect(mockMapService.callback).toBeDefined();
            console.info(compiled)
            //and proper location is set

        });


    });

});