'use strict';

describe('commons.labels-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('commons.labels'));

    describe('Labels-spec:', function () {

        var labels, translated;
        var mockTranslate, mockQ;

        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            translated = [];
            mockTranslate = function (label) {
                translated.push(label);
                return {
                    then: function (value) {

                    }
                };
            };
            $provide.value('$translate', mockTranslate);
            mockQ = {
                all: function (promises) {
                    return {
                        then: function (value) {

                        }
                    };
                }
            };
            $provide.value('$q', mockQ);
        }));

        beforeEach(inject(function ($injector) {
            labels = $injector.get('Labels');
        }));

        it('should get specialization labels', function () {
            //given label service is initialized
            expect(labels).toBeDefined();
            //when getting specialization labels
            labels.getSpecializations();
            //then all labels are translated
            var expected = 77;
            expect(translated.length).toBe(expected);
            expect(translated[0]).toBe('specializations.$$spec-1');
            expect(translated[expected - 1]).toBe('specializations.$$spec-' + expected);
        });

        it('should get template labels', function () {
            //given label service is initialized
            expect(labels).toBeDefined();
            //when getting templates labels
            labels.getTemplates();
            //then all labels are translated
            var expected = 3;
            expect(translated.length).toBe(expected);
            expect(translated[0]).toBe('templates.$$temp-1');
            expect(translated[expected - 1]).toBe('templates.$$temp-' + expected);
        });

        it('should get degrees labels', function () {
            //given label service is initialized
            expect(labels).toBeDefined();
            //when getting templates labels
            labels.getDegrees();
            //then all labels are translated
            var expected = 6;
            expect(translated.length).toBe(expected);
            expect(translated[0]).toBe('degrees.$$degree-1');
            expect(translated[expected - 1]).toBe('degrees.$$degree-' + expected);
        });

    });

});