'use strict';

var uiMenu = angular.module('ui.menu', []);

/**
 * Directive responsible for displaying top-menu
 */
uiMenu.directive('topMenu', function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/ui/partials/top-menu.html',
        scope: false
    }
});

/**
 * Minimize menu when window is scrolled down
 */
$(document).ready(function () {
    $(window).scroll(function () {
        if ($(this).scrollTop() > 48) {
            $('header').animate({top: '-5px'}, 0);
            $('header').addClass('small');
        } else {
            $('header').animate({top: '0px'}, 0);
            $('header').removeClass('small');
        }
    });
});


/**
 * Show sub-options for menu items.
 * Note: function must be called directly when whole menu module is loaded.
 */
uiMenu.run(function ($rootScope) {
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
});

