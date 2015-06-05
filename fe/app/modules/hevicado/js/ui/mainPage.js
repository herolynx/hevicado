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
                            autoScrolling: false,
                            fitToSection: false,
                            paddingTop: '4em'
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
                                elm.fullpage.destroy();
                            } catch (e) {
                                $log.warn('Cleaning after full main page ended with error: ' + e);
                            }
                        });
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

            /**
             * Show section selected by URL hash
             */
            var showSection = function () {
                var id = $location.hash();
                $log.debug('Animating scroll to section: ' + id);
                var sectionMap = {
                    'about-us': 2,
                    'offer': 3,
                    'benefits': 4,
                    'payment': 5,
                    'news': 6,
                    'contact': 7
                };
                if (sectionMap[id]) {
                    $.fn.fullpage.moveTo(sectionMap[id]);
                }
            };

            return {
                restrict: 'A',
                link: function (scope, elm, attrs) {
                    showSection();
                    //refresh section when URL changes
                    scope.$watch(function () {
                        return $location.hash();
                    }, function (value) {
                        $log.debug('Section changed - refreshing position');
                        showSection();
                    });
                }
            };
        }
    ]);

/**
 * Controller for wrapping send e-mail while HTTPS is used.
 * It prevents displaying of SSL warning due to 'mailto' that's not secured.
 */
angular.module('hevicado.ui')
    .controller('MailCtrl',
    ['$scope',
        function ($scope) {

            /**
             * Send e-mail
             */
            $scope.send = function () {
                window.location.href = 'mailto:hevicado@gmail.com' +
                '?subject=Issue' +
                '&body=Name: ' + ($scope.name || '') +
                '&body=E-mail: ' + ($scope.email || '') +
                '&body=Phone: ' + ($scope.phone || '') +
                '&body=Details: ' + ($scope.details || '');
            };

        }
    ]);

