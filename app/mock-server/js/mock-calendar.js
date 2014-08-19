'use strict';

var mockCalendar = angular.module('mock-calendar', []);

mockCalendar.run(function ($httpBackend, $log) {

    var id = 1;
    var events = [];
    var colors = ['red', 'yellow', 'blue'];

    var minutes = 0;
    for (var hour = 8; hour < 16; hour++) {
        var duration = 15 + minutes % 45;
        var event = {
            id: id,
            title: "Meeting " + id,
            description: "Details go here about meeting....",
            start: Date.today().set({hour: hour, minute: 0}),
            end: Date.today().set({hour: hour, minute: duration}),
            color: colors[hour % 3],
            duration: duration
        };
        events.push(event);
        minutes += 15;
        id++;
    }

    $httpBackend.whenGET(/calendar\/events\/search/).respond(200, events);


});