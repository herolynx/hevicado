'use strict';

describe('users-service-spec:', function () {

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

        it('should get details about user', function () {
            //given users service is initialized
            expect(usersService).toBeDefined();
            //and user 
            var userId = 'user-123';
            //when getting details about user
            usersService.get(userId);
            //then user's profile is downloaded
            expect(mockHttp.get).toHaveBeenCalledWith('/user/' + userId);
        });

        it('should search users', function () {
            //given users service is initialized
            expect(usersService).toBeDefined();
            //and search criteria 
            var criteria = '.*bravo.*';
            //when searching users
            usersService.search(criteria);
            //then search results are returned
            expect(mockHttp.get).toHaveBeenCalledWith('/user', { params: {text: criteria } });
        });

    });

});