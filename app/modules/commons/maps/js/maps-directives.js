'use strict';

var commonsMapsDirectives = angular.module('commons.maps.directives', [
    'ngMap',
    'commons.maps.services'
]);

/**
 * Directive for displaying chosen location on google map
 * @param title name of the location
 * @param address location to be displayed
 */
commonsMapsDirectives.directive('googleMap',
    ['MapService', '$log',
        function (MapService, $log) {

            return {

                restrict: 'E',
                scope: {
                    title: '=',
                    address: '='
                },
                templateUrl: "modules/commons/maps/partials/map.html",
                controller: function ($scope) {
                    $scope.position = {
                        name: "",
                        center: {
                            latitude: '',
                            longitude: ''
                        },
                        zoom: 17
                    };

                    $scope.show = function (title, address) {
                        if (address === undefined) {
                            return;
                        }
                        $log.debug('Showing location on map - title: ' + title + ', address: ' + address);
                        $scope.position.name = title;
                        MapService.
                            find(address, function (response) {
                                if (response !== null && response.length > 0) {
                                    $scope.position.center.latitude = response[0].geometry.location.k;
                                    $scope.position.center.longitude = response[0].geometry.location.D;
                                    $scope.$digest();
                                }
                                else {
                                    $log.warn('Cannot show location for: ' + title);
                                }
                            });
                    };

                },
                link: function ($scope, elm, attrs) {
                    $scope.$watch('address', function () {
                        $log.debug('Map address changed - refreshing');
                        $scope.show($scope.title, $scope.address);
                    });
                }

            };

        }
    ]
);

