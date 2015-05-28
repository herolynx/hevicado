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
                $log.debug('Windows width: ' + $(window).width());
                var mobileMaxWidth = 767;
                var tabletMaxWidth = 1024;
                if ($(window).width() <= mobileMaxWidth) {
                    $log.debug('Preparing menu for: mobile');
                    console.info('mobile menu')
                    $('.open-menu').click(function (e) {
                        e.stopPropagation();
                        if ($('.open-menu').hasClass('small-opened')) {
                            $('nav.nav').animate({right: 0}, "slow");
                            $('#page').animate({right: 140}, "slow").addClass('disable');
                            $('header').animate({right: 140}, "slow");
                            $(this).removeClass('small-opened');
                            $(this).addClass('close-menu');
                        }
                    });
                    $('html, body').click(function () {
                        if ($('.open-menu').hasClass('close-menu')) {
                            $('nav.nav').animate({right: -140}, "slow");
                            $('#page').animate({right: 0}, "slow").removeClass('disable');
                            $('header').animate({right: 0}, "slow");
                            $('.open-menu').addClass('small-opened');
                            $('.open-menu').removeClass('close-menu');
                        }
                    });
                } else if ($(window).width() > mobileMaxWidth && $(window).width() <= tabletMaxWidth) {
                    $log.debug('Preparing menu for: tablet');
                    console.info('tablet menu')
                    $timeout(function () {
                        $("nav li.parrent").each(function () {
                            $(this).find('a.url').filter(":first").removeAttr('href');
                        });
                    }, 2000);

                    $('nav li.parrent').on('click.a', function (e) {
                        e.preventDefault();
                        $(this).find('ul.subpage').slideToggle(200);
                        $(this).toggleClass('active');
                        $(this).siblings().find('ul.subpage').slideUp(200);
                        $(this).siblings('.active').toggleClass('active');
                    });
                } else if ($(window).width() > tabletMaxWidth) {
                    $log.debug('Preparing menu for: desktop');
                    console.info('desktop menu')
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



