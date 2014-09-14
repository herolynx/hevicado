'use strict';

describe('users-services-spec:', function () {

    //prepare module for testing
    beforeEach(angular.mock.module('users.services'));

    describe('UsersService-spec', function () {

        var mockHttp;
        var usersService;

        //prepare service for testing
        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockHttp = jasmine.createSpyObj('$http', ['get', 'post', 'put', 'delete']);
            $provide.value('$http', mockHttp);
            var mockLog = jasmine.createSpyObj('$log', ['debug', 'error']);
            $provide.value('$log', mockLog);
        }));

        beforeEach(inject(function ($injector, $q) {
            usersService = $injector.get('UsersService');
        }));

        it('should register new user', function () {
            //given users service is initialized
            expect(usersService).toBeDefined();
            //and user 
            var user = {
                mail: 'user@kunishu.com'
            };
            //when saving new new user
            usersService.save(user);
            //then user is registered 
            expect(mockHttp.post).toHaveBeenCalledWith('/user', user);
        });

        it('should update user\'s account', function () {
            //given users service is initialized
            expect(usersService).toBeDefined();
            //and user 
            var user = {
                id: 'user-123',
                mail: 'user@kunishu.com'
            };
            //when saving existing user
            usersService.save(user);
            //then user' account is updated
            expect(mockHttp.put).toHaveBeenCalledWith('/user', user);
        });

    });

});