'use strict';

describe('filters-spec:', function () {

    beforeEach(angular.mock.module('angular-base.filters'));

    describe('interpolate-spec:', function () {

        beforeEach(angular.mock.module(function ($provide) {
            $provide.value('version', 'TEST_VER');
        }));

        it('should replace VERSION tag with current version of the app', inject(function (interpolateFilter) {
            expect(interpolateFilter('before %VERSION% after')).toEqual('before TEST_VER after');
        }));

    });

});
