'use strict';

var controllers = angular.module('users.controllers', []);

/**
 * Controllers manages registration process
 * @param $rootScope main scope of application
 * @param $scope scope of controllers
 * @param $state app state manager
 * @param UserSerice service managing users in app
 * @param AuthService authorization manager needed for logging in
 * @param USER_ROLES set of available user roles
 * @param AUTH_EVENTS set of available authorization events
 * @param uiNotification component for managing user's notifications
 * @param $log logger component
 */
controllers.controller('RegistrationCtrl', function ($rootScope, $scope, $state, UsersService, AuthService,
    USER_ROLES, AUTH_EVENTS, uiNotification, $log) {

    $scope.user = {
        mail: '',
        password: '',
        roles: [USER_ROLES.CLIENT],
        profile: {
            lang: 'en',
            time_zone: '',
            theme: ''
        },
    };

    $scope.userConf = {
        mail: '',
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
                $log.debug('User registered successfully: user id: ' + resp.data.id + ' - logging in new user');
                var credentials = {
                    login: $scope.user.mail,
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
    }

});


/**
 * Controller manages profile of user
 *
 * @param $scope controller scope
 * @param Session session of current user
 * @param UserService service managing user related data
 * @param uiNotification notification manager
 * @param $log logger
 */
controllers.controller('UserProfileCtrl', function ($scope, Session, UsersService, uiNotification, $log) {

    $scope.user = {
        first_name: '',
        last_name: '',
        mail: '',
        password: '',
        profile: {
            lang: 'en',
            time_zone: '',
            theme: ''
        },
    };

    $scope.userConf = {
        password: ''
    };

    /**
     * Load profile data of current user
     */
    $scope.loadProfile = function () {
        $log.debug('Loading profile data for user: ' + Session.getUserId());
        UsersService.get(Session.getUserId()).then(
            function (resp) {
                $log.debug('Profile data loaded successfully: user id: ' + resp.data.id);
                $scope.user = resp.data;
            },
            function (errResp, errStatus) {
                $log.error('Couldn\'t load profile data: status: ' + errStatus + ', resp: ' + errResp.data);
                uiNotification.text('Error', 'User profile wasn\'t loaded').error();
            }
        );
    };

    /**
     * Change credentials of given user
     * @param user user which credentials will be changed
     */
    $scope.changeCredentials = function (user) {
        $log.debug('Saving user profile: ' + user.mail);
        var credentials = {
            login: user.mail,
            password: user.password
        };
        UsersService.save(credentials).then(
            function (resp) {
                $log.debug('User credentials saved successfully: user id: ' + resp.data.id);
            },
            function (errResp, errStatus) {
                $log.error('User credentials hasn\'t been saved: status: ' + errStatus + ', resp: ' + errResp.data);
                uiNotification.text('Error', 'User credentials hasn\'t been saved').error();
            }
        );
    };

    /**
     * Change user's profile data.
     * Note: function doesn't allow changing mail and password.
     * @param user user to be updated
     */
    $scope.save = function (user) {
        $log.debug('Saving user profile: ' + user.mail);
        user.mail = null; //don't allow to change using this function
        user.password = null; //don't allow to change using this function
        UsersService.save(user).then(
            function (resp) {
                $log.debug('User profile saved successfully: user id: ' + resp.data.id);
            },
            function (errResp, errStatus) {
                $log.error('User profile hasn\'t been saved: status: ' + errStatus + ', resp: ' + errResp.data);
                uiNotification.text('Error', 'User profile hasn\'t been saved').error();
            }
        );
    };
});