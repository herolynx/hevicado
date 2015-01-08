'use strict';

describe('commons.maps.services-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('commons.maps.services'));

    describe('MapService-spec:', function () {

        var mapService;
        var mockHttp, mockLog, mockGeoCoder;

        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockHttp = jasmine.createSpyObj('$http', ['post']);
            $provide.value('$http', mockHttp);
            mockLog = jasmine.createSpyObj('$log', ['debug']);
            $provide.value('$log', mockLog);
            mockGeoCoder = function () {
                return {
                    geocode: function (address, callback) {
                        mockGeoCoder.address = address;
                        mockGeoCoder.callback = callback;
                    }
                };
            };
            google.maps.Geocoder = mockGeoCoder;
        }));

        beforeEach(inject(function ($injector) {
            mapService = $injector.get('MapService');
        }));

        it('should find geo location based on address', function () {
            //given map service is ready
            expect(mapService).toBeDefined();
            //and sample address
            var address = {
                street: 'ul. Grabiszynska 8',
                city: 'Wroclaw',
                country: 'Polska'
            };
            //when searching geo location
            var callback = function () {
                callback.called = true;
            };
            mapService.find(address, callback);
            //then proper location is searched
            expect(mockGeoCoder.address).toEqual({address: 'ul. Grabiszynska 8, Wroclaw, Polska'});
            //and callback is set
            expect(mockGeoCoder.callback).toBe(callback);
        });

    });

});