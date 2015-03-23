'use strict';

angular.module('hevicado.ui', [
    'ui.bootstrap'
]);

/**
 * Directive responsible for displaying top-menu
 */
angular.module('hevicado.ui').
    directive('topMenu', function () {
        return {
            restrict: 'E',
            templateUrl: 'modules/hevicado/partials/ui/top-menu.html',
            scope: false
        };
    });

/**
 * Directive responsible for displaying bottom-menu
 */
angular.module('hevicado.ui').
    directive('bottomMenu', function () {
        return {
            restrict: 'E',
            templateUrl: 'modules/hevicado/partials/ui/bottom-menu.html',
            scope: false
        };
    });

/**
 * Show sub-options for menu items.
 * Note: function must be called directly when whole menu module is loaded.
 */
angular.module('hevicado.ui').
    run(
    ['$rootScope',
        function ($rootScope) {
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
        }
    ]);