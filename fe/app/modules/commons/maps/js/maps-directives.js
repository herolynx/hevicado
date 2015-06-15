'use strict';

angular.module('commons.maps.directives', [
    'ngMap',
    'commons.maps.services'
]);

/**
 * Controller shows chosen location on google map
 * @param $scope ctrl scope
 * @param $log logger
 * @param MapService service for finding location on map
 * @constructor
 */
function GoogleMapCtrl($scope, $log, MapService) {
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
                    $scope.position.center.latitude = response[0].geometry.location.A;
                    $scope.position.center.longitude = response[0].geometry.location.F;
                    $scope.$digest();
                }
                else {
                    $log.warn('Cannot show location for: ' + title);
                }
            });
    };

}
GoogleMapCtrl.$inject = ['$scope', '$log', 'MapService'];


/**
 * Directive for displaying chosen location on google map
 * @param title name of the location
 * @param address location to be displayed
 */
angular.module('commons.maps.directives').
    directive('googleMap',
    ['$log',
        function ($log) {

            return {

                restrict: 'E',
                scope: {
                    title: '=',
                    address: '='
                },
                templateUrl: "modules/commons/maps/partials/map.html",
                controller: GoogleMapCtrl,
                link: function ($scope, elm, attrs) {
                    $scope.$watch('address', function () {
                        $log.debug('Map address changed - refreshing');
                        $scope.show($scope.title, $scope.address);
                    });
                }

            };

        }
    ]);

