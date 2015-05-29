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
 * Menu configuration that decides what type of menu should be served for what type of resolutions
 */
angular.module('hevicado.ui')
    .service('MenuConfig', function () {

        return {

            mobileMaxWidth: 750,

            tabletMaxWidth: 1024,

            isMobile: function () {
                return $(window).width() <= this.mobileMaxWidth;
            },

            isTablet: function () {
                return $(window).width() > this.mobileMaxWidth && $(window).width() <= this.tabletMaxWidth;
            },

            isDesktop: function () {
                return $(window).width() > this.tabletMaxWidth;
            }

        };

    });

/**
 * Controller of mobile menu that will be activated/deactivated
 * based on provided menu configuration
 */
angular.module('hevicado.ui')
    .service('MobileMenu',
    ['MenuConfig', '$log',
        function (MenuConfig, $log) {

            return {

                active: false,

                init: function () {
                    if (MenuConfig.isMobile() && !this.active) {
                        $log.debug('Activating mobile menu');
                        $('.open-menu').on('click', this.openMenu);
                        $('html, body').on('click', this.closeMenu);
                        this.active = true;
                    }
                    if (!MenuConfig.isMobile() && this.active) {
                        $log.debug('Deactivating mobile menu');
                        $('.open-menu').off('click', this.openMenu);
                        $('html, body').off('click', this.closeMenu);
                        //close in case when mobile-menu is still opened
                        this.closeMenu();
                        this.active = false;
                    }
                },

                openMenu: function (e) {
                    e.stopPropagation();
                    if ($('.open-menu').hasClass('small-opened')) {
                        $('nav.nav').animate({right: 0}, "slow");
                        $('#page').animate({right: 140}, "slow").addClass('disable');
                        $('header').animate({right: 140}, "slow");
                        $(this).removeClass('small-opened');
                        $(this).addClass('close-menu');
                    }
                },

                closeMenu: function () {
                    if ($('.open-menu').hasClass('close-menu')) {
                        $('nav.nav').animate({right: -140}, "slow");
                        $('#page').animate({right: 0}, "slow").removeClass('disable');
                        $('header').animate({right: 0}, "slow");
                        $('.open-menu').addClass('small-opened');
                        $('.open-menu').removeClass('close-menu');
                    }
                }

            };

        }
    ]);

/**
 * Controller of tablet menu that will be activated/deactivated
 * based on provided menu configuration
 */
angular.module('hevicado.ui')
    .service('TabletMenu',
    ['MenuConfig', '$log', '$timeout',
        function (MenuConfig, $log, $timeout) {

            return {

                active: false,

                init: function () {
                    if (MenuConfig.isTablet() && !this.active) {
                        $log.debug('Activating tablet menu');
                        $('nav li.parrent').on('click', this.openSubMenu);
                        this.active = true;
                    }
                    if (!MenuConfig.isTablet() && this.active) {
                        $log.debug('Deactivating tablet menu');
                        $('nav li.parrent').off('click', this.openSubMenu);
                        this.active = false;
                    }
                },

                openSubMenu: function (e) {
                    e.preventDefault();
                    $(this).find('ul.subpage').slideToggle(200);
                    $(this).toggleClass('active');
                    $(this).siblings().find('ul.subpage').slideUp(200);
                    $(this).siblings('.active').toggleClass('active');
                }

            };

        }
    ]);

/**
 * Controller of desktop menu that will be activated/deactivated
 * based on provided menu configuration
 */
angular.module('hevicado.ui')
    .service('DesktopMenu',
    ['MenuConfig', '$log',
        function (MenuConfig, $log) {

            return {

                active: false,

                init: function () {
                    if (MenuConfig.isDesktop() && !this.active) {
                        $log.debug('Activating desktop menu');
                        $('nav li.parrent').on('click', this.openSubMenu);
                        this.active = true;
                    }
                    if (!MenuConfig.isDesktop() && this.active) {
                        $log.debug('Deactivating desktop menu');
                        $('nav li.parrent').off('click', this.openSubMenu);
                        this.active = false;
                    }
                },

                openSubMenu: function (e) {
                    e.preventDefault();
                    $(this).find('ul.subpage').slideToggle(200);
                    $(this).toggleClass('active');
                    $(this).siblings().find('ul.subpage').slideUp(200);
                    $(this).siblings('.active').toggleClass('active');
                }

            };

        }
    ]);


/**
 * Logic controls initialization of menu for proper device.
 * Note: function must be called directly when whole menu module is loaded.
 */
angular.module('hevicado.ui').
    run(
    ['$rootScope', '$timeout', '$log', 'MenuConfig', 'DesktopMenu', 'TabletMenu', 'MobileMenu',
        function ($rootScope, $timeout, $log, MenuConfig, DesktopMenu, TabletMenu, MobileMenu) {

            var devices = [MobileMenu, DesktopMenu, TabletMenu];

            // show menu
            $timeout(function () {
                _.map(devices, function (device) {
                    device.init();
                });
            }, 500);

            //refresh menu
            $(window).resize(function () {
                _.map(devices, function (device) {
                    device.init();
                });
            });
        }

    ]);



