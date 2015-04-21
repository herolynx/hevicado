'use strict';

/**
 * Directive for adding to main page proper UI effects
 */
angular.module('hevicado.ui')
    .directive('mainPage',
    ['$rootScope', '$log',
        function ($rootScope, $log) {
            return {
                restrict: 'A',
                link: function (scope, elm, attrs) {
                    //initialize full page view
                    elm.ready(function () {
                        elm.fullpage({
                            verticalCentered: false,
                            scrollBar: false,
                            autoScrolling: false
                        });
                    });
                    //attach slider to main section
                    $('.bxslider').bxSlider({
                        mode: 'fade',
                        captions: true,
                        auto: true
                    });
                    //restore old global settings before leaving full page view
                    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                        try {
                            elm.fullpage.destroy('all');
                        } catch (e) {
                            $log.warn('Cleaning after full main page ended with error: ' + e);
                        }
                    });
                }
            };
        }
    ]);

/**
 * Directive animates scrolling between sections.
 * It reads hash from given location and tries to find proper section with '-' ID prefix.
 * If found proper animation takes place.
 */
angular.module('hevicado.ui')
    .directive('animateScroll',
    ['$log', '$location',
        function ($log, $location) {
            return {
                restrict: 'A',
                link: function (scope, elm, attrs) {
                    var id = $location.hash();
                    try {
                        var section = $("#-" + id);
                        $log.debug('Animating scroll to section: ' + id);
                        $('html,body').animate({scrollTop: section.offset().top}, 300);
                    } catch (e) {
                        $log.warn('Animating scroll - section not found: ' + section + ', error: ' + e);
                    }
                }
            };
        }
    ]);