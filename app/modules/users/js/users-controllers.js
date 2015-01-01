'use strict';

var usersControllers = angular.module('users.controllers', [
    'commons.users.filters'
]);

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
usersControllers.controller('RegistrationCtrl',
    ['$rootScope', '$scope', '$state', 'UsersService', 'AuthService', 'USER_ROLES', 'AUTH_EVENTS', 'uiNotification', '$log',
        function ($rootScope, $scope, $state, UsersService, AuthService, USER_ROLES, AUTH_EVENTS, uiNotification, $log) {

            $scope.user = {
                email: '',
                password: '',
                profile: {
                    lang: 'pl',
                    time_zone: 'CET',
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
    ]
);


/**
 * Controller manages profile of user
 *
 * @param $rootScope main scope for broadcasting user related events
 * @param $scope controller scope
 * @param Session session of current user
 * @param UserService service managing user related data
 * @param uiNotification notification manager
 * @param $log logger
 * @param LANG all available languages in the app
 * @param THEMES apps themes
 * @param TIME_ZONES all available time zones
 * @param AUTH_EVENTS user's related events
 */
usersControllers.controller('UserProfileCtrl',
    ['$rootScope', '$scope', 'Session', 'UsersService', 'AUTH_EVENTS', 'uiNotification', '$log', 'LANGS', 'THEMES', 'TIME_ZONES',
        function ($rootScope, $scope, Session, UsersService, AUTH_EVENTS, uiNotification, $log, LANGS, THEMES, TIME_ZONES) {

            $scope.user = {
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                phone: '',
                profile: {
                    lang: LANGS[0],
                    time_zone: TIME_ZONES[0],
                    theme: THEMES[0]
                }
            };

            $scope.userConf = {
                password: ''
            };

            $scope.themes = THEMES;
            $scope.langs = LANGS;
            $scope.timeZones = TIME_ZONES;

            /**
             * Load profile data of current user
             */
            $scope.loadProfile = function () {
                $log.debug('Loading profile data for user: ' + Session.getUserId());
                UsersService.
                    get(Session.getUserId()).then(function (resp) {
                        $log.debug('Profile data loaded successfully: user id: ' + resp.data.id);
                        $scope.user = resp.data;
                    }, function (errResp, errStatus) {
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
                $log.debug('Changing credentials: ' + user.email);
                var credentials = {
                    id: user.id,
                    email: user.email,
                    password: user.password
                };
                UsersService.
                    save(credentials).
                    then(function () {
                        $log.debug('User credentials saved successfully');
                    }, function (errResp, errStatus) {
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
                $log.debug('Saving user profile: ' + user.email);
                var userToUpdate = angular.copy(user);
                delete userToUpdate.email; //don't allow to change using this function
                delete userToUpdate.password; //don't allow to change using this function
                UsersService.
                    save(userToUpdate).
                    then(function () {
                        $log.debug('User profile saved successfully');
                        Session.refresh(user);
                        $rootScope.$broadcast(AUTH_EVENTS.SESSION_REFRESH, user);
                    }, function (errResp, errStatus) {
                        $log.error('User profile hasn\'t been saved: status: ' + errStatus + ', resp: ' + errResp.data);
                        uiNotification.text('Error', 'User profile hasn\'t been saved').error();
                    }
                );
            };
        }
    ]
);

/**
 * Controller responsible for displaying generic info about currently logged in user
 * @param $scope ctrl's scope
 * @param Session current user's session
 * @param AUTH_EVENTS events related with user's current session
 * @param USER_EVENTS user related events
 * @param $log logger
 */
usersControllers.controller('UserInfoCtrl',
    ['$scope', 'Session', 'AUTH_EVENTS', '$log',
        function ($scope, Session, AUTH_EVENTS, $log) {

            $scope.info = {};

            /**
             * Initialize controller
             */
            $scope.init = function () {
                $log.debug("Getting info about current user from session");
                $scope.info = Session.getInfo();
            };

            /**
             * Register in event bus in order to
             */
            $scope.register = function () {
                $scope.$on(AUTH_EVENTS.USER_LOGGED_IN, function () {
                    $log.debug("User info changed after logging in - refreshing");
                    $scope.init();
                });
                $scope.$on(AUTH_EVENTS.SESSION_REFRESH, function (event, user) {
                    $log.debug("User info changed - refreshing");
                    $scope.init();
                });
            };

            $scope.init();
            $scope.register();

        }
    ]
);