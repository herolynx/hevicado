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

    describe('HttpInterceptor - spec:', function () {

        var mockHttpConfig;
        var httpInterceptor;

        beforeEach(angular.mock.module(function ($provide) {
            mockHttpConfig = {
                server: 'http://dev.kunishu.com:8000'
            };
            $provide.value('HTTP_CONFIG', mockHttpConfig);
        }));

        beforeEach(inject(function ($injector) {
            httpInterceptor = $injector.get('HttpInterceptor');
        }));

        it('should redirect all POST methods to back-end server', function () {
            //given http interceptor is active
            expect(httpInterceptor).toBeDefined();
            //and config of out-going request
            var reqConfig = {
                method: 'POST',
                url: '/some/path'
            };
            //when request is sent
            httpInterceptor.request(reqConfig);
            //then request is redirected to back-end
            expect(reqConfig).toEqual(
                {
                    method: 'POST',
                    url: 'http://dev.kunishu.com:8000/some/path'
                }
            );
        });

        it('should redirect all PUT methods to back-end server', function () {
            //given http interceptor is active
            expect(httpInterceptor).toBeDefined();
            //and config of out-going request
            var reqConfig = {
                method: 'PUT',
                url: '/some/path'
            };
            //when request is sent
            httpInterceptor.request(reqConfig);
            //then request is redirected to back-end
            expect(reqConfig).toEqual(
                {
                    method: 'PUT',
                    url: 'http://dev.kunishu.com:8000/some/path'
                }
            );
        });

        it('should redirect all DELETE methods to back-end server', function () {
            //given http interceptor is active
            expect(httpInterceptor).toBeDefined();
            //and config of out-going request
            var reqConfig = {
                method: 'DELETE',
                url: '/some/path'
            };
            //when request is sent
            httpInterceptor.request(reqConfig);
            //then request is redirected to back-end
            expect(reqConfig).toEqual(
                {
                    method: 'DELETE',
                    url: 'http://dev.kunishu.com:8000/some/path'
                }
            );
        });

        it('should redirect GET data methods to back-end server', function () {
            //given http interceptor is active
            expect(httpInterceptor).toBeDefined();
            //and config of out-going request
            var reqConfig = {
                method: 'GET',
                url: '/some/path'
            };
            //when request is sent
            httpInterceptor.request(reqConfig);
            //then request is redirected to back-end
            expect(reqConfig).toEqual(
                {
                    method: 'GET',
                    url: 'http://dev.kunishu.com:8000/some/path'
                }
            );
        });

        it('should not redirect GET HTML files requests', function () {
            //given http interceptor is active
            expect(httpInterceptor).toBeDefined();
            //and config of out-going request
            var reqConfig = {
                method: 'GET',
                url: '/some/path/page.html'
            };
            //when request is sent
            httpInterceptor.request(reqConfig);
            //then request is not redirected to back-end
            expect(reqConfig).toEqual(
                {
                    method: 'GET',
                    url: '/some/path/page.html'
                }
            );
        });

        it('should not redirect GET JS files requests', function () {
            //given http interceptor is active
            expect(httpInterceptor).toBeDefined();
            //and config of out-going request
            var reqConfig = {
                method: 'GET',
                url: '/some/path/script.js'
            };
            //when request is sent
            httpInterceptor.request(reqConfig);
            //then request is not redirected to back-end
            expect(reqConfig).toEqual(
                {
                    method: 'GET',
                    url: '/some/path/script.js'
                }
            );
        });

        it('should not redirect GET CSS files requests', function () {
            //given http interceptor is active
            expect(httpInterceptor).toBeDefined();
            //and config of out-going request
            var reqConfig = {
                method: 'GET',
                url: '/some/path/style.css'
            };
            //when request is sent
            httpInterceptor.request(reqConfig);
            //then request is not redirected to back-end
            expect(reqConfig).toEqual(
                {
                    method: 'GET',
                    url: '/some/path/style.css'
                }
            );
        });

        it('should not redirect GET JSON files requests', function () {
            //given http interceptor is active
            expect(httpInterceptor).toBeDefined();
            //and config of out-going request
            var reqConfig = {
                method: 'GET',
                url: '/some/path/file.json'
            };
            //when request is sent
            httpInterceptor.request(reqConfig);
            //then request is not redirected to back-end
            expect(reqConfig).toEqual(
                {
                    method: 'GET',
                    url: '/some/path/file.json'
                }
            );
        });

    });

});
