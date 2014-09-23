$(function () {

    // LEGEND

    $('.widget-legend .open').click(function () {
        $('.widget-legend .place-list').slideDown('fast');
    });

    $('.widget-legend .place-list .close').click(function () {
        $('.widget-legend .place-list').slideUp('fast');
    });

    $('.widget-min-calendar .open').click(function () {
        $('.widget-min-calendar .calendar').slideDown('fast');
    });

    $('.widget-min-calendar .calendar .close').click(function () {
        $('.widget-min-calendar .calendar').slideUp('fast');
    });

    // NAV

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

    // CHECKBOX 

    $('input').ezMark();

    // SELECT BOX

    var selectBox = $("select").selectBoxIt();


    //SCROLL TO

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
            $('html, body').animate({
                scrollTop: 0
            }, 500);
            return false;
        })
    });

    $(document).ready(function () {
        $(window).scroll(function () {
            if ($(this).scrollTop() > 48) {
                $('header').animate({
                    top: '-5px'
                }, 0);
                $('header').addClass('small');
            } else {
                $('header').animate({
                    top: '0px'
                }, 0);
                $('header').removeClass('small');
            }
        });
    });

});