'use strict';

/**
 * User's session definition. <br>
 * Note: don't use it externally. Use AuthService instead.
 * @param $cookieStore Angie's component for cookies management
 * @param USER_ROLES list of available user roles
 * @param UserUtils generic user related functions
 * @param $log Angie's logger
 */
angular.module('bolt.services').
    service('Session',
    ['$cookieStore', 'USER_ROLES', 'UserUtils', '$log',
        function ($cookieStore, USER_ROLES, UserUtils, $log) {

            var self = this;

            var _currentUser = {
                'token': null,
                'id': null,
                'role': USER_ROLES.GUEST,
                'profile': {
                    theme: 'turquoise'
                }
            };

            this.getToken = function () {
                return self.loadUser().token;
            };

            this.getUserId = function () {
                return self.loadUser().id;
            };

            this.getUserRole = function () {
                return self.loadUser().role;
            };

            /**
             * Get generic info about user
             * @returns {*} non-nullable object
             */
            this.getInfo = function () {
                return UserUtils.getContactInfo(angular.copy(self.loadUser()));
            };

            /**
             * Get user's profile with settings
             * @returns {*} non-nullable object
             */
            this.getProfile = function () {
                return self.loadUser().profile;
            };

            /**
             * Load data of current user from cookie
             */
            this.loadUser = function () {
                var sessionUser = $cookieStore.get('currentUser');
                if (sessionUser != null) {
                    _currentUser = sessionUser;
                }
                return _currentUser;
            };

            /**
             * Create new user's session
             * @param accessPass user access pass
             */
            this.create = function (accessPass) {
                $log.debug('Creating session - user id: ' + accessPass.user.id + ', role: ' + accessPass.user.role + ', token: ' + accessPass.token);
                _currentUser = UserUtils.getContactInfo(accessPass.user);
                _currentUser.token = accessPass.token;
                _currentUser.profile = accessPass.user.profile;
                $cookieStore.put('currentUser', _currentUser);
            };

            /**
             * Refresh info about user stored in session
             * @param user new user data
             */
            this.refresh = function (user) {
                $log.debug('Refreshing user session info - user id: ' + user.id + ', role: ' + user.role);
                var newUserData = {};
                newUserData.user = angular.copy(user);
                newUserData.token = self.loadUser().token;
                self.create(newUserData);
            };

            /**
             * Destroy user's current session
             */
            this.destroy = function () {
                $log.debug('Deleting session - user id: ' + _currentUser.id);
                $cookieStore.remove('currentUser');
                _currentUser = {
                    'token': null,
                    'id': null,
                    'role': USER_ROLES.GUEST,
                    'profile': {
                        theme: 'turquoise'
                    }
                };
            };

            return this;
        }
    ]);
