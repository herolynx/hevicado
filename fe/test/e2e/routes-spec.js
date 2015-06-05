'use strict';

describe('routes-spec:', function () {

    //clean-up
    beforeEach(function () {
        browser.addMockModule('angular-base', function () {
            angular.module('angular-base').run(function (Session) {
                Session.destroy();
            });
        });
    });

    it('should automatically redirect to default page', function () {
        //given user is entering app
        //when using generic address of the application
        browser.get('/app');
        //then user is redirected to login page
        expect(browser.getLocationAbsUrl()).toMatch("/#/login");
    });

    it('should allow entering login page', function () {
        //given any user
        //when accessing login page
        browser.get('/app/#login');
        //then access to resource is granted
        expect(browser.getLocationAbsUrl()).toMatch("/#/login");
    });

    describe('checking access rights to private page:', function () {

        it('should deny guest to enter private page', function () {
            //given user is not logged in
            //when accessing private resource
            browser.get('/app/#private');
            //then user is redirected to login page
            expect(browser.getLocationAbsUrl()).toMatch("/#/login");
        });

        it('should allow client user to enter private page', function () {
            //given user is logged in
            browser.addMockModule('angular-base', function () {
                angular.module('angular-base').run(function (Session, USER_ROLES) {
                    Session.create('token-123', 'user-456', USER_ROLES.CLIENT);
                });
            });
            //when accessing private resource
            browser.get('/app/#private');
            //then access to resource is granted
            expect(browser.getLocationAbsUrl()).toMatch("/#/private");
        });

        it('should allow admin user to enter private page', function () {
            //given user is logged in
            browser.addMockModule('angular-base', function () {
                angular.module('angular-base').run(function (Session, USER_ROLES) {
                    Session.create('token-123', 'user-456', USER_ROLES.ADMIN);
                });
            });
            //when accessing private resource
            browser.get('/app/#private');
            //then access to resource is granted
            expect(browser.getLocationAbsUrl()).toMatch("/#/private");
        });

    });

    describe('checking access rights to admin page:', function () {

        it('should deny guest to enter admin page', function () {
            //given user is not logged in
            //when accessing admin resource
            browser.get('/app/#admin');
            //then user is redirected to login page
            expect(browser.getLocationAbsUrl()).toMatch("/#/login");
        });

        it('should deny client user to enter admin page', function () {
            //given user is logged in but has no admin rights
            browser.addMockModule('angular-base', function () {
                angular.module('angular-base').run(function (Session, USER_ROLES) {
                    Session.create('token-123', 'user-456', USER_ROLES.CLIENT);
                });
            });
            //when accessing admin resource
            browser.get('/app/#admin');
            //then user is redirected to login page
            expect(browser.getLocationAbsUrl()).toMatch("/#/login");
        });

        it('should allow admin user to enter admin page', function () {
            //given user is logged in and has admin rights
            browser.addMockModule('angular-base', function () {
                angular.module('angular-base').run(function (Session, USER_ROLES) {
                    Session.create('token-123', 'user-456', USER_ROLES.ADMIN);
                });
            });
            //when accessing admin resource
            browser.get('/app/#admin');
            //then access to resource is granted
            expect(browser.getLocationAbsUrl()).toMatch("/#/admin");
        });

    });

});
