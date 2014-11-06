'use strict';

var directives = angular.module('ui.menu', []);

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
 * Show sub-options for menu items
 */
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
