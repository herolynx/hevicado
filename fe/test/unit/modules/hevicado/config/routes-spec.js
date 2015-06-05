'use strict';

describe('routes-spec:', function () {

    describe('go back listener-spec:', function () {

        var mockState;
        var $rootScope;

        beforeEach(angular.mock.module('hevicado'));

        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockState = {};
            $provide.value('$state', mockState);
            var mockLog = jasmine.createSpyObj('$log', ['debug']);
            $provide.value('$log', mockLog);

            $provide.value('ACCESS_LEVELS', {
                PUBLIC: 'mock-public', USERS: 'mock-users', DOCTORS: 'mock-doctors'
            });
            var mockUrlRouter = jasmine.createSpyObj('mockUrlRouter', ['otherwise']);
            $provide.value('$urlRouterProvider', mockUrlRouter);
            var mockStateProvider = jasmine.createSpyObj('mockStateProvider', ['state']);
            mockStateProvider.state.andReturn(mockStateProvider);
            $provide.value('$stateProvider', mockStateProvider);
        }));

        beforeEach(inject(function (_$rootScope_) {
            $rootScope = _$rootScope_;
        }));

        it('should save state of previous resource while going to new resource', function () {
            //given listener is active
            expect($rootScope).toBeDefined();
            //and state of current resource
            var fromState = 'resource-1';
            var fromParams = {
                key1: 'value1',
                key2: 'value2'
            };

            //when changing resource
            expect(mockState.previous).not.toBeDefined();
            $rootScope.$broadcast('$stateChangeSuccess', 'resource-2', {key3: 'value3'}, fromState, fromParams);

            //then state of previous resource is saved
            expect(mockState.previous).toEqual(
                {
                    state: fromState,
                    params: fromParams
                }
            );
        });

    });

});