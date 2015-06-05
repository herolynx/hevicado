'use strict';

describe('commons.labels.filters-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('commons.labels.filters'));

    describe('label-spec:', function () {

        it('should create label for key', inject(function ($filter) {
            //given sample key
            var prefix = 'area';
            var text = '$$key-1';
            //when creating label
            var label = $filter('label')(text, prefix);
            //then label is created
            expect(label).toEqual(prefix + '.' + text);
        }));

        it('should not create label for text', inject(function ($filter) {
            //given sample text
            var prefix = 'area';
            var text = 'text';
            //when creating label
            var label = $filter('label')(text, prefix);
            //then label is not created
            expect(label).toEqual(text);
        }));

    });

});