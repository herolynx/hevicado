'use strict';

describe('commons-filters-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('users.commons.filters'));
    beforeEach(angular.mock.module('commons.labels.filters'));
    beforeEach(angular.mock.module('pascalprecht.translate'));

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

        it('should get location info', inject(function ($filter) {
            //given sample address
            var address = {
                street: 'ul. Grabiszynska 8',
                city: 'Wroclaw',
                country: 'Polska'
            };
            //when getting info about location
            var info = $filter('addressInfo')(address);
            //then proper value is returned
            expect(info).toEqual('ul. Grabiszynska 8, Wroclaw, Polska');
        }));

    });

    describe('dateFormat-spec:', function () {

        it('should get default date', inject(function ($filter) {
            //given sample address
            var date = Date.today().set(
                {
                    year: 2015,
                    month: 0,
                    day: 5,
                    hour: 8,
                    minute: 30,
                    second: 0
                }
            );
            //when formatting date
            var dateString = $filter('dateFormat')(date);
            //then proper value is returned
            expect(dateString).toEqual('05-01-2015');
        }));

        it('should get date and time', inject(function ($filter) {
            //given sample address
            var date = Date.today().set(
                {
                    year: 2015,
                    month: 0,
                    day: 5,
                    hour: 8,
                    minute: 30,
                    second: 0
                }
            );
            //when formatting date
            var dateString = $filter('dateFormat')(date, 'DD-MM-YYYY HH:mm');
            //then proper value is returned
            expect(dateString).toEqual('05-01-2015 08:30');
        }));

        it('should get name of the week day', inject(function ($filter) {
            //given sample address
            var date = Date.today().set(
                {
                    year: 2015,
                    month: 0,
                    day: 5,
                    hour: 8,
                    minute: 30,
                    second: 0
                }
            );
            //when formatting date
            var dateString = $filter('dateFormat')(date, 'dddd');
            //then proper value is returned
            expect(dateString).not.toBe('');
        }));

    });

    describe('normalizeText-spec:', function () {

        it('should normalize string', inject(function ($filter) {
            //given sample text
            var text = 'master of the puppets';
            //when normalizing text
            var normalized = $filter('normalizeText')(text);
            //then proper value is returned
            expect(normalized).toBe('Master of the puppets');
        }));

    });

    describe('toLocalHours-spec:', function () {

        it('should normalize working hours', inject(function ($filter) {
            //given sample hours
            var text = '09:00';
            //when normalizing hours
            var normalized = $filter('toLocalHours')(text);
            //then proper value is returned
            expect(normalized).toBe('09:00');
        }));

    });

});