'use strict';

describe('commons.maps.directives-spec:', function () {

    var $rootScope, $scope, $compile;
    var mockMapService;

    //prepare module for testing
    beforeEach(angular.mock.module('commons.maps.directives'));
    beforeEach(angular.mock.module('app/modules/commons/maps/partials/map.html'));

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

    beforeEach(inject(function ($templateCache, _$rootScope_, _$compile_) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $compile = _$compile_;
        var mapTemplate = $templateCache.get('app/modules/commons/maps/partials/map.html');
        $templateCache.put('modules/commons/maps/partials/map.html', mapTemplate);

    }));

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
                '<google-map address="testAddress" title="testTitle"/>'
            );
            var compiled = $compile(element)($scope);
            expect(compiled.find('map').attr('center')).not.toBeDefined();
            $scope.$digest();
            //then proper location is searched
            expect(mockMapService.address).toBe(address);
            expect(mockMapService.callback).toBeDefined();
            //and proper location is set on map when location is found
            mockMapService.callback([
                {
                    geometry: {
                        location: {
                            k: 666.66,
                            D: 69.69
                        }
                    }
                }
            ]);
            expect(compiled.find('map').attr('center')).toEqual('[666.66, 69.69]');
        });

    });

});