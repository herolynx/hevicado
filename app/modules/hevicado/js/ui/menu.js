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
 * Prepare main menu of the application
 * Note: function must be called directly when whole menu module is loaded.
 */
angular.module('hevicado.ui').
    run(
    ['$rootScope', '$timeout', '$log',
        function ($rootScope, $timeout, $log) {
            var prepareMenu = function () {
                if ($(window).width() > 1025) {
                    $log.debug('Preparing menu for: desktop');
                    console.info('Preparing main menu')
                    $("nav li, footer li").hover(
                        function () {
                            $(this).find('ul.subpage').stop(true, true).animate({
                                left: '0px',
                                opacity: '1',
                                top: '0px'
                            }, 800);
                        }, function () {
                            $(this).find('ul.subpage').stop(true, true).animate({
                                left: '0px',
                                opacity: '0',
                                top: '0px'
                            }, 800);
                        }
                    );
                } else if ($(window).width() > 768 && $(window).width() < 1025) {
                    $log.debug('Preparing menu for: mobile');
                    console.info('mobile menu')
                    $("nav.product li.parrent").each(function () {
                        $(this).find('a.test').filter(":first").removeAttr('href');
                    });
                    $('nav.product li.parrent').on('click.a', function (e) {
                        e.preventDefault();
                        $(this).find('ul').slideToggle(200);
                        $(this).toggleClass('active');
                        $(this).siblings().find('ul').slideUp(200);
                        $(this).siblings('.active').toggleClass('active');
                    });
                }
            };
            //show menu once page is loaded
            var showMenuPromise = $timeout(function () {
                prepareMenu();
                if (showMenuPromise !== undefined) {
                    $timeout.cancel(showMenuPromise);
                    showMenuPromise == undefined;
                }
            }, 500);
            //refresh menu
            $(window).resize(function () {
                prepareMenu();

            });
        }
    ]);



