'use strict';

describe('directives-spec:', function () {

    beforeEach(angular.mock.module('angular-base.directives'));

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
