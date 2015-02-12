'use strict';

describe('version-spec', function () {

    beforeEach(angular.mock.module('hevicado'));

    it('should return current version of the app', inject(function (version) {
        expect(version).not.toBeNull();
    }));

    describe('interpolate-spec:', function () {

        beforeEach(angular.mock.module(function ($provide) {
            $provide.value('version', 'TEST_VER');
        }));

        it('should replace VERSION tag with current version of the app', inject(function (interpolateFilter) {
            expect(interpolateFilter('before %VERSION% after')).toEqual('before TEST_VER after');
        }));

    });

    describe('app-version-spec:', function () {

        it('should print current version of the app', function () {
            angular.mock.module(function ($provide) {
                $provide.value('version', 'TEST_VER');
            });
            inject(function ($compile, $rootScope) {
                var element = $compile('<span app-version></span>')($rootScope);
                expect(element.text()).toEqual('TEST_VER');
            });
        });

    });

});