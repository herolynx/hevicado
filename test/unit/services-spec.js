'use strict';


describe('service', function () {
    beforeEach(module('kunishu.services'));


    describe('version', function () {
        it('should return current version', inject(function (version) {
            expect(version).toEqual('0.1');
        }));
    });
});
