'use strict';

describe('http-interceptor-spec:', function () {

    beforeEach(angular.mock.module('hevicado'));

    describe('HttpInterceptor - spec:', function () {

        var mockHttpConfig;
        var httpInterceptor;

        beforeEach(angular.mock.module(function ($provide) {
            mockHttpConfig = {
                server: 'http://dev.kunishu.com/be'
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
                    url: 'http://dev.kunishu.com/be/some/path'
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
                    url: 'http://dev.kunishu.com/be/some/path'
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
                    url: 'http://dev.kunishu.com/be/some/path'
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
                    url: 'http://dev.kunishu.com/be/some/path'
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
