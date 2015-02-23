'use strict';

/**
 * Controllers manages registration process
 * @param $rootScope main scope of application
 * @param $scope scope of controllers
 * @param $state app state manager
 * @param UserService service managing users in app
 * @param AuthService authorization manager needed for logging in
 * @param USER_ROLES set of available user roles
 * @param AUTH_EVENTS set of available authorization events
 * @param uiNotification component for managing user's notifications
 * @param $log logger component
 */
angular.module('users.account').
    controller('RegistrationCtrl',
    ['$rootScope', '$scope', '$state', 'UsersService', 'AuthService',
        'USER_ROLES', 'AUTH_EVENTS', 'uiNotification', '$log',
        function ($rootScope, $scope, $state, UsersService, AuthService,
                  USER_ROLES, AUTH_EVENTS, uiNotification, $log) {

            $scope.user = {
                email: '',
                password: '',
                profile: {
                    lang: 'pl',
                    theme: 'turquoise'
                }
            };

            $scope.userConf = {
                email: '',
                password: ''
            };

            /**
             * Register user
             * @param user new user to be created
             */
            $scope.save = function (user) {
                $log.debug('Registering user: ' + user.mail);
                UsersService.save(user).then(
                    function (resp) {
                        $log.debug('User registered successfully: user id: ' + resp.data + ' - logging in new user');
                        var credentials = {
                            login: $scope.user.email,
                            password: $scope.user.password
                        };
                        AuthService.login(credentials).then(
                            function () {
                                $rootScope.$broadcast(AUTH_EVENTS.USER_LOGGED_IN);
                                $state.go('default-user');
                            },
                            function () {
                                $log.error('User has been registered but logging in is not possible at the moment');
                                $rootScope.$broadcast(AUTH_EVENTS.LOGIN_FAILED);
                                uiNotification.text('Error', 'User has been registered but logging in is not possible at the moment').error();
                            });
                    },
                    function (errResp, errStatus) {
                        $log.error('User hasn\'t been registered: status: ' + errStatus + ', resp: ' + errResp.data);
                        uiNotification.text('Error', 'User hasn\'t been registered').error();
                    }
                );
            };

        }
    ]);