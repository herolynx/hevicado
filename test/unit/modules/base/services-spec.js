'use strict';


describe('services-spec:', function () {

    beforeEach(angular.mock.module('base.services'));

    describe('HTTP config spec:', function () {

        var mockLocation;

        beforeEach(angular.mock.module(function ($provide) {
            mockLocation = jasmine.createSpyObj('mockLocation', ['host']);
            $provide.value('$location', mockLocation);
        }));

        it('should provide back-end server address', inject(function ($injector) {
            //given current location
            mockLocation.host.andReturn('dev.kunishu.com');
            //when config of HTTP is taken
            var config = $injector.get('HTTP_CONFIG');
            //then config contains proper back-end address
            expect(config.server).toBe('http://dev.kunishu.com:8000');
        }));

    });

});
