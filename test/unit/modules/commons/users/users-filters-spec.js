'use strict';

describe('commons.users.filters-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('commons.users.filters'));

    describe('userInfo-spec:', function () {

        it('should get generic info about user', inject(function ($filter) {
            //given sample user
            var user = {
                id: 'user-123',
                first_name: 'Zbigniew',
                last_name: 'Religa',
                email: 'zbigniew.religa@kunishu.com',
                role: 'doctor',
                degree: 'prof'
            };
            //when getting info
            var info = $filter('userInfo')(user);
            //then proper value is returned
            expect(info).toEqual('Religa, Zbigniew');
        }));

        it('should get generic info about user with e-mail', inject(function ($filter) {
            //given sample user
            var user = {
                id: 'user-123',
                first_name: 'Zbigniew',
                last_name: 'Religa',
                email: 'zbigniew.religa@kunishu.com',
                role: 'doctor',
                degree: 'prof'
            };
            //when getting info
            var info = $filter('userInfo')(user, undefined, true);
            //then proper value is returned
            expect(info).toEqual('Religa, Zbigniew (zbigniew.religa@kunishu.com)');
        }));

        it('should get detail info about user', inject(function ($filter) {
            //given sample user
            var user = {
                id: 'user-123',
                first_name: 'Zbigniew',
                last_name: 'Religa',
                email: 'zbigniew.religa@kunishu.com',
                role: 'doctor',
                degree: 'prof'
            };
            //when getting info
            var info = $filter('userInfo')(user, true);
            //then proper value is returned
            expect(info).toEqual('prof Religa, Zbigniew');
        }));

    });

    describe('addressInfo-spec:', function () {

    });

    describe('dateFormat-spec:', function () {

    });

    describe('normalizeText-spec:', function () {

    });

    describe('toLocalHours-spec:', function () {

    });

});