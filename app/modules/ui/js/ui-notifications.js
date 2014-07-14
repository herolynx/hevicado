'use strict';

/**
 * Configure module for ui utils
 */
var ui = angular.module('ui-notifications',
    [
        'ui.bootstrap',
        'pascalprecht.translate'
    ]
);

/**
 * Service manages UI notifications that can pop-up on the screen
 * @param $translate component manging translations
 */
ui.service('uiNotification', function ($translate) {

    var _title, _text;

    /**
     * Translate and prepare message to be displayed
     * @param title key of header of message to be translated
     * @param text key context of message to be translated
     * @returns {*} this instance
     */
    this.translate = function (title, msg) {
        _title = $translate.instant(title);
        _text = $translate.instant(msg);
        return this;
    };
    /**
     * Prepare message to be displayed
     * @param title header of message
     * @param text context of message
     * @returns {*} this instance
     */
    this.text = function (title, text) {
        _title = title;
        _text = text;
        return this;
    };
    /**
     * Show success message
     */
    this.success = function () {
        toastr.success(_text, _title);
    };
    /**
     * Show information message
     */
    this.info = function () {
        toastr.info(_text, _title);
    };
    /**
     * Show warning message
     */
    this.warning = function () {
        toastr.warning(_text, _title);
    };
    /**
     * Show error message
     */
    this.error = function () {
        toastr.error(_text, _title);
    };

    return this;

});

/**
 * Directive displays chosen message when proper event is dispatched.
 * Directive is configured using following attributes:
 * event: name of event that broadcasting should trigger displaying of notification
 * type: type of notification to be displayed defined by uiNotification component (default: info)
 * message: text to be displayed in notification
 * @param uiNotification component managing notifications on UI
 */
ui.directive('uiNotify', function (uiNotification) {

    return {
        restrict: 'E',
        template: '',
        scope: {
            event: '@',
            type: '@',
            message: '@'
        },
        link: function ($scope, elm, attrs) {
            $scope.$on($scope.event, function () {
                //check type of notification to be displayed
                var notificationType = $scope.type;
                if (notificationType === undefined) {
                    notificationType = 'info';
                }
                //show notification
                uiNotification.text('', $scope.message)[notificationType]();
            });
        }
    }
    
});
