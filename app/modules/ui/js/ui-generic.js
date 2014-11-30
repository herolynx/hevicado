'use strict';

var uiGeneric = angular.module('ui.generic', []);

/**
 * Back to top option
 */
$(document).ready(function () {
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn(500);
        } else {
            $('.back-to-top').fadeOut(500);
        }
    });

    $('.back-to-top').click(function (event) {
        event.preventDefault();
        $('html, body').animate({scrollTop: 0}, 500);
        return false;
    });
});

/**
 * Decorate proper UI elements
 */
uiGeneric.run(function ($rootScope) {
    $rootScope.$watch(function () {
        // CHECKBOX
        if ($('input').length > 0) {
            $('input').ezMark();
        }

        // SELECT BOX
        if ($('select').length > 0) {
            var selectBox = $("select").selectBoxIt();
        }
    });
});
