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