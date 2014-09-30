'use strict';

var mockCalendar = angular.module('mock-calendar', []);

mockCalendar.run(function ($httpBackend, $log) {

    var id = 1;
    var events = [];
    var colors = ['orange', 'blue'];

    var minutes = 0;
    for (var hour = 8; hour < 16; hour++) {
        var duration = 15 + minutes % 45;
        var event = {
            id: id,
            title: "Meeting " + id,
            description: "Details go here about meeting....",
            start: Date.today().set({
                hour: hour,
                minute: 0
            }),
            end: Date.today().set({
                hour: hour,
                minute: duration
            }),
            color: colors[hour % 2],
            duration: duration,
            cancelled: hour % 4 == 0 ? Date.today() : null,
            location: {
                id: "loc-123",
                name: "Pulsantis",
                address: {
                    street: "Grabiszynska 8/4",
                    city: "Wroclaw",
                    country: "Poland"
                },
                color: colors[hour % 2]
            },
            owner: {
                id: '1',
                first_name: 'Michal',
                last_name: 'Wronski',
                mail: 'michal@wronski.com'
            },
            users: [
                {
                    id: '2',
                    first_name: 'Tomasz',
                    last_name: 'Cimicki',
                    mail: 'tomasz@cimicki.com'
                },
                {
                    id: '3',
                    first_name: 'Lukasz',
                    last_name: 'Indykiewicz',
                    mail: 'lukasz@indykiewicz.com'
                }
            ]
        };
        events.push(event);
        minutes += 15;
        id++;
    }

    $httpBackend.whenGET(/calendar\/events\/search/).respond(200, events);
    $httpBackend.whenPOST(/calendar\/events\/save/).respond(200, {
        id: ++id
    });
    $httpBackend.whenPUT(/calendar\/events\/save/).respond(200, {
        id: ++id
    });
    $httpBackend.whenDELETE(/calendar\/events\/delete/).respond(200);

    var options = {
        location: {
            id: "loc-123",
            name: "Pulsantis",
            address: {
                street: "Grabiszynska 8/4",
                city: "Wroclaw",
                country: "Poland"
            },
            color: "red",
            working_hours: [
                {
                    day: "Monday",
                    start: "08:00",
                    end: "10:00"
                },
                {
                    day: "Monday",
                    start: "12:00",
                    end: "14:00"
                },
                {
                    day: "Tuesday",
                    start: "08:00",
                    end: "16:00"
                },
                {
                    day: "Wednesday",
                    start: "08:00",
                    end: "16:00"
                },
                {
                    day: "Thursday",
                    start: "08:00",
                    end: "16:00"
                },
                {
                    day: "Friday",
                    start: "08:00",
                    end: "16:00"
                }
            ]
        },
        templates: [
            {
                id: "temp-123",
                name: "Examination",
                description: "Details go here...",
                locationIds: ["loc-123"],
                durations: [15, 30, 45]
            }
        ],
        durations: [15, 30, 45],
        owner: 'wrona',
        users: ['cimek', 'indyk']
    };

    $httpBackend.whenGET(/calendar\/options/).respond(200, options);

});