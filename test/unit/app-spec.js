'use strict';

describe('app-spec', function () {

    beforeEach(angular.mock.module('angular-base'));

    it('should return current version of the app', inject(function (version) {
        expect(version).toEqual('0.0.3');
    }));

});