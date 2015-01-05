'use strict';

describe('commons.users.utils-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('commons.users.utils'));

    describe('UserUtils-spec:', function () {

        var utils;

        beforeEach(inject(function ($injector) {
            utils = $injector.get('UserUtils');
        }));

        it('should get generic info about user', function () {
            //given utils are initialized
            expect(utils).toBeDefined();
            //and sample user
            var user = {
                id: 'user-123',
                first_name: 'Zbigniew',
                last_name: 'Religa',
                email: 'zbigniew.religa@kunishu.com',
                role: 'doctor',
                degree: 'prof'
            };
            //when getting info about user
            var info = utils.info(user);
            //then proper info is returned
            expect(info).toBe('Religa, Zbigniew');
        });

        it('should get generic info about user with e-mail', function () {
            //given utils are initialized
            expect(utils).toBeDefined();
            //and sample user
            var user = {
                id: 'user-123',
                first_name: 'Zbigniew',
                last_name: 'Religa',
                email: 'zbigniew.religa@kunishu.com',
                role: 'doctor',
                degree: 'prof'
            };
            //when getting info about user
            var info = utils.info(user, undefined, true);
            //then proper info is returned
            expect(info).toBe('Religa, Zbigniew (zbigniew.religa@kunishu.com)');
        });

        it('should get detail info about user', function () {
            //given utils are initialized
            expect(utils).toBeDefined();
            //and sample user
            var user = {
                id: 'user-123',
                first_name: 'Zbigniew',
                last_name: 'Religa',
                email: 'zbigniew.religa@kunishu.com',
                role: 'doctor',
                degree: 'prof'
            };
            //when getting info about user
            var info = utils.info(user, true);
            //then proper info is returned
            expect(info).toBe('prof Religa, Zbigniew');
        });

        it('should get contact info about user', function () {
            //given utils are initialized
            expect(utils).toBeDefined();
            //and sample user
            var user = {
                id: 'user-123',
                first_name: 'Zbigniew',
                last_name: 'Religa',
                email: 'zbigniew.religa@kunishu.com',
                phone: '+48 792-123-456',
                role: 'doctor',
                degree: 'prof',
                description: 'not important',
                password: 'secret'
            };
            //when getting contact info about user
            var info = utils.getContactInfo(user);
            //then proper info is returned
            expect(info).toEqual(
                {
                    id: 'user-123',
                    first_name: 'Zbigniew',
                    last_name: 'Religa',
                    degree: 'prof',
                    email: 'zbigniew.religa@kunishu.com',
                    phone: '+48 792-123-456',
                    role: 'doctor'
                }
            );
        });

        it('should get address info', function () {
            //given utils are initialized
            expect(utils).toBeDefined();
            //and sample address
            var address = {
                street: 'ul. Grabiszynska 8',
                city: 'Wroclaw',
                country: 'Polska'
            };
            //when getting info about location
            var info = utils.address(address);
            //then proper info is returned
            expect(info).toBe('ul. Grabiszynska 8, Wroclaw, Polska');
        });


    });

});