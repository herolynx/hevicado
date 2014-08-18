'use strict';

var mockCalendar = angular.module('mock-calendar', []);

mockCalendar.run(function ($httpBackend, $log) {

    $httpBackend.whenGET(/calendar\/events\/search/).respond(200,
        [
            {
                title: "Meeting 8:00-8:15",
                description: "Details go here about meeting....",
                start: Date.today().set({hour: 8, minute: 0}),
                end: Date.today().set({hour: 8, minute: 15}),
                color: 'red',
                duration: 15
            },
            {
                title: "Meeting 9:00-10:00",
                description: "Details go here about meeting....",
                start: Date.today().set({hour: 9, minute: 0}),
                end: Date.today().set({hour: 10, minute: 0}),
                color: 'yellow',
                duration: 60
            }
        ]
    );
});