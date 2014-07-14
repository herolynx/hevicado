'use strict';


describe('controllers-spec', function () {

    beforeEach(angular.mock.module('angular-base.controllers'));

    describe('LangCtrl-spec:', function () {

        var mockTranslate;
        var ctrlScope;

        //prepare controller for testing
        beforeEach(inject(function ($controller, _$rootScope_) {
            //prepare controller for testing
            ctrlScope = _$rootScope_.$new();
            //mock dependencies
            mockTranslate = jasmine.createSpyObj('$translate', ['use']);
            //inject mocks
            $controller('LangCtrl', {
                $scope: ctrlScope,
                $translate: mockTranslate
            });
        }));

        it('should change current language', function () {
            //given language module is configured
            expect(ctrlScope.changeLanguage).toBeDefined();
            //when user changes current language
            ctrlScope.changeLanguage('pl');
            //then language is changes
            //and all labels are re-translated automatically
            expect(mockTranslate.use).toHaveBeenCalledWith('pl');
        });

    });

});
