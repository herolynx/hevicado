'use strict';

/**
 * Controller helps to regain control over account due to lost password.
 * @param $scope scope of controllers
 * @param UserService service managing users in app
 * @param uiNotification component for managing user's notifications
 * @param $log logger component
 * @param $state state manager
 */
angular.module('bolt.login').
    controller('LostPasswordCtrl',
    ['$scope', 'AuthService', 'uiNotification', '$log', '$state',
        function ($scope, AuthService, uiNotification, $log, $state) {

            /**
             * Initialize state
             */
            $scope.init = function () {
                $scope.user = {
                    email: ''
                };

                $scope.userConf = {
                    email: ''
                };
            };

            /**
             * Regain control over account
             * @param user user who's password should be retained
             */
            $scope.regain = function (user) {
                $log.debug('Regaining password for user: ' + user.email);
                AuthService.
                    regainPassword(user).
                    then(function (resp) {
                        $log.debug('Lost password info sent');
                        $scope.init();
                        $state.go('login');
                    }, function (errResp, errStatus) {
                        $log.error('Lost password info has\'t been sent: status: ' + errStatus + ', resp: ' + errResp.data);
                        uiNotification.text('Error', 'Lost password info has\'t been sent').error();
                    }
                );
            };

            $scope.init();

        }
    ]);