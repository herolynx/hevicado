'use strict';

var commonsMapsServices = angular.module('commons.maps.services', [
    'commons.users.utils'
]);


commonsMapsServices.service('MapService',
    ['$http', '$log', 'UserUtils',
        function ($http, $log, UserUtils) {

            return {

                /**
                 * Find geo location
                 * @param address address with street, city and country
                 */
                find: function (address, callback) {
                    $log.debug('Searching geo-location for: ' + UserUtils.address(address));
                    var geoCoder = new google.maps.Geocoder();
                    geoCoder.geocode(
                        {'address': UserUtils.address(address)},
                        callback
                    );
                }

            };

        }
    ]
);