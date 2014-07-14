'use strict';

var widgets = angular.module('dashboard-widgets', []);

/**
 * Define sample data model for widgets
 * @param $interval component for executing functions every n ms
 * @param WidgetDataModel prototype of data model
 */
widgets.factory('RandomDataModel', function ($interval, WidgetDataModel) {

    function RandomDataModel() {
        //empty
    }

    RandomDataModel.prototype = Object.create(WidgetDataModel.prototype);

    RandomDataModel.prototype.init = function () {
        this.updateScope('-');
        this.intervalPromise = $interval(function () {
            var value = Math.floor(Math.random() * 100);
            this.updateScope(value);
        }.bind(this), 500);
    };

    RandomDataModel.prototype.destroy = function () {
        WidgetDataModel.prototype.destroy.call(this);
        $interval.cancel(this.intervalPromise);
    };

    return RandomDataModel;
});

/*********************** widgets available to be placed on dashboard **************************/
widgets.factory('widgetDefinitions', function (RandomDataModel) {
    return [
        {
            name: 'random',
            directive: 'wt-scope-watch',
            attrs: {
                value: 'randomValue'
            }
        },
        {
            name: 'time',
            directive: 'wt-time'
        },
        {
            name: 'datamodel',
            directive: 'wt-scope-watch',
            dataAttrName: 'value',
            dataModelType: RandomDataModel
        }
    ];
});

widgets.
    directive('wtTime', function ($interval) {
        return {
            restrict: 'A',
            scope: true,
            replace: true,
            template: '<div>Time<div class="alert alert-success">{{time}}</div></div>',
            link: function (scope) {
                function update() {
                    scope.time = new Date().toLocaleTimeString();
                }

                update();

                var promise = $interval(update, 500);

                scope.$on('$destroy', function () {
                    $interval.cancel(promise);
                });
            }
        };
    }).
    directive('wtScopeWatch', function () {
        return {
            restrict: 'A',
            replace: true,
            template: '<div>Value<div class="alert alert-info">{{value}}</div></div>',
            scope: {
                value: '=value'
            }
        };
    });

