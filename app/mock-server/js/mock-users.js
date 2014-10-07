'use strict';

var mockUsers = angular.module('mock-users', []);

mockUsers.run(function ($httpBackend, Session, $log) {

    var currentUser = {
        token: 'token-123',
        id: 1,
        userRole: 'admin',
        firstName: 'Michal',
        lastName: 'Wronski',
        mail: 'wrona@kunishu.com'
    };

    $httpBackend.whenGET(/user\/1/).respond(200, currentUser);
    $httpBackend.whenPOST(/users\/login/).respond(200, currentUser);

    $httpBackend.whenPOST('/user').respond(200, currentUser);
    $httpBackend.whenPUT(/user/).respond(200, currentUser);

    var doctors = [];

    for (var i = 0; i < 10; i++) {
        var doctor = {
            id: i,
            first_name: 'fistname-' + i,
            last_name: 'lastname-' + i,
            mail: 'user-' + i + '@kunishu.com',
            phone: '+48 792 123 456'
        };
        var location = {
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
                }
            ]
        };
        location.calendar = [];
        var today = Date.today().moveToDayOfWeek(1, -1);
        for (var j = 0; j < 7; j++) {
            location.calendar.push({
                date: today.clone().add(j).days(),
                free: j % 2 == 0
            });
        }
        doctor.locations = [location];
        doctors.push(doctor);
    }

    $httpBackend.whenGET(/user$/).respond(200, doctors);
});