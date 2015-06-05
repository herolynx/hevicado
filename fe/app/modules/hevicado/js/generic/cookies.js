'use strict';

/**
 * Controller for showing info about cookies usage
 * @param $scope current scope of controller
 * @param $cookieStore cookie provider
 */
angular.module('hevicado.generic').
    controller('CookieCtrl',
    ['$scope', '$cookieStore',
        function ($scope, $cookieStore) {

            var cookieInfoKey = "cookiePolicy";

            /**
             * Check whether info about cookies should be shown
             * @returns {boolean}
             */
            $scope.show = function () {
                return $cookieStore.get(cookieInfoKey) === undefined;
            };

            /**
             * Accept cookies policy
             */
            $scope.accept = function () {
                $cookieStore.put(cookieInfoKey, {date: new Date()});
            };
        }
    ]);
