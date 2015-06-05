'use strict';

describe('http-config-spec:', function () {

    beforeEach(angular.mock.module('hevicado.config.http'));

    describe('HTTP config spec:', function () {

        var mockLocation;

        beforeEach(angular.mock.module(function ($provide) {
            mockLocation = jasmine.createSpyObj('mockLocation', ['host', 'port', 'url']);
            $provide.value('$location', mockLocation);
        }));

        it('should provide back-end server address', inject(function ($injector) {
            //given current location
            mockLocation.host.andReturn('dev.kunishu.com');
            //and standard HTTP port
            mockLocation.port.andReturn(8080);
            //when config of HTTP is taken
            var config = $injector.get('HTTP_CONFIG');
            //then config contains proper back-end address
            expect(config.server).toBe('/be');
        }));

        it('should provide back-end server address for development environment', inject(function ($injector) {
            //given current location
            mockLocation.host.andReturn('localhost');
            //and dev port
            mockLocation.port.andReturn(8444);
            //when config of HTTP is taken
            var config = $injector.get('HTTP_CONFIG');
            //then config contains proper back-end address for development environment
            expect(config.server).toBe('http://localhost:8000');
        }));

    });

});
