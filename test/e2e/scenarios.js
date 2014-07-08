'use strict';

describe('routes-spec:', function () {

    it('should automatically redirect to default page', function () {
        //given user is entering app
        //when using generic address of the application
        browser.get('/app');
        //then user is redirected to login page
        expect(browser.getLocationAbsUrl()).toMatch("/#/login");
    });

    describe('checking user\'s access rights-spec:', function () {

        it('should redirect guest to login page while entering calendar page', function () {
            //given user is not logged in
            //and user has not sufficient rights
            //when accessing private resource
            browser.get('/app/#calendar');
            //then user is redirected to login page
            expect(browser.getLocationAbsUrl()).toMatch("/#/login");
        });

    });

});
