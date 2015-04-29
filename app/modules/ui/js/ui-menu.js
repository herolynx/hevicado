'use strict';

angular.module('ui.menu', []);

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


