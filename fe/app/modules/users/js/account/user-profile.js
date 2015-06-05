'use strict';

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
 * @param AUTH_EVENTS user's related events
 * @param Labels labels provider
 * @param USER_ROLES set of possible roles
 */
angular.module('users.account').
    controller('UserProfileCtrl',
    ['$rootScope', '$scope', 'Session', 'UsersService', 'AUTH_EVENTS', 'uiNotification', '$log', 'LANGS', 'THEMES', 'Labels', 'USER_ROLES',
        function ($rootScope, $scope, Session, UsersService, AUTH_EVENTS, uiNotification, $log, LANGS, THEMES, Labels, USER_ROLES) {


            $scope.degrees = [];
            Labels.getDegrees()
                .then(function (values) {
                    $scope.degrees = values;
                });

            $scope.user = {
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                phone: '',
                profile: {
                    lang: LANGS[0],
                    theme: THEMES[0]
                }
            };

            $scope.userConf = {
                password: ''
            };

            $scope.themes = THEMES;
            $scope.langs = LANGS;

            /**
             * Load profile data of current user
             */
            $scope.loadProfile = function () {
                $log.debug('Loading profile data for user: ' + Session.getUserId());
                UsersService.
                    get(Session.getUserId()).then(function (resp) {
                        $log.debug('Profile data loaded successfully: user id: ' + resp.data.id);
                        $scope.user = resp.data;
                        $scope.isDoctor = $scope.user.role == USER_ROLES.DOCTOR;
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
    ]);