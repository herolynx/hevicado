'use strict';

var baseMenu = angular.module('angular-base.menu', [
    'users.controllers'
]);

/**
 * Directive responsible for displaying top-menu
 */
baseMenu.directive('topMenu', function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/base/partials/top-menu.html',
        scope: false
    };
});

/**
 * Show sub-options for menu items.
 * Note: function must be called directly when whole menu module is loaded.
 */
baseMenu.run(['$rootScope', function ($rootScope) {
    $rootScope.$watch(function () {
        $("nav li").hover(
            function () {
                $(this).find('ul.subpage').stop(true, true).animate({
                    left: '0px',
                    opacity: '1',
                    top: '0px'
                }, 500);
            }, function () {
                $(this).find('ul.subpage').stop(true, true).animate({
                    left: '0px',
                    opacity: '0',
                    top: '0px'
                }, 500);
            }
        );
    });
}]);