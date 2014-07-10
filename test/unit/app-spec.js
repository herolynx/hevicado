'use strict';

describe('app-spec', function () {

    beforeEach(angular.mock.module('kunishu'));

    it('should return current version of the app', inject(function (version) {
        expect(version).toEqual('0.01');
    }));

});