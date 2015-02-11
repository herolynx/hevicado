'use strict';

describe('directives-spec:', function () {

    beforeEach(angular.mock.module('chronos.calendar.directives'));

    describe('calendarTableEvent-spec:', function () {

        var mockWindow, mockCalendarSettings, mockCalendarEvents;
        var $rootScope, $scope, $compile;

        beforeEach(angular.mock.module(function ($provide) {
            //mock dependencies
            mockCalendarSettings = {};
            mockCalendarSettings.EVENT_WIDTH_PERCENTAGE = 0.75;
            mockCalendarSettings.EVENT_WIDTH_MARGIN = 10;
            $provide.value('CALENDAR_SETTINGS', mockCalendarSettings);

            mockCalendarEvents = {};
            mockCalendarEvents.CALENDAR_RENDER = 'CALENDAR_RENDER';
            $provide.value('CALENDAR_EVENTS', mockCalendarEvents);

            mockWindow = jasmine.createSpyObj('$window', ['bind']);
            $provide.value('$window', mockWindow);
        }));

        beforeEach(inject(function ($injector, _$rootScope_, _$compile_) {
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $compile = _$compile_;
        }));

        it('should display event in the whole cell', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //and single event for cell
            var event = {
                timeline: 0,
                overlap: {
                    value: 1
                },
                quarter: 1,
                start: Date.today().set({minute: 15})
            };
            $scope.event = event;
            //when displaying event in calendar table
            var parent = angular.element(
                '<div">' +
                '<calendar-table-event event="event" quarter-length="15" quarter-amount="4" />' +
                '<div>'
            );
            $compile(parent)($scope);
            //and parent size
            parent.width(200);
            parent.height(100);
            $rootScope.$broadcast(mockCalendarEvents.CALENDAR_RENDER);
            //then event has proper size
            var eventElm = parent.find('calendar-table-event');
            expect(eventElm).not.toBeNull();
            expect(eventElm.width()).toBe(150);
            expect(eventElm.height()).toBe(99);
            //and event has proper position
            expect(eventElm.css('left')).toBe('0px');
            expect(eventElm.css('top')).toBe('');
        });

        it('should display event with height proper to event duration', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //and single event for cell
            var event = {
                timeline: 0,
                overlap: {
                    value: 1
                },
                quarter: 2,
                start: Date.today().set({minute: 30})
            };
            $scope.event = event;
            //when displaying event in calendar table
            var parent = angular.element(
                '<div">' +
                '<calendar-table-event event="event" quarter-length="15" quarter-amount="4" />' +
                '<div>'
            );
            $compile(parent)($scope);
            //and parent size
            parent.width(200);
            parent.height(100);
            $rootScope.$broadcast(mockCalendarEvents.CALENDAR_RENDER);
            //then event has proper size
            var eventElm = parent.find('calendar-table-event');
            expect(eventElm).not.toBeNull();
            expect(eventElm.width()).toBe(150);
            expect(eventElm.height()).toBe(199);
            //and event has proper position
            expect(eventElm.css('left')).toBe('0px');
            expect(eventElm.css('top')).toBe('');
        });

        it('should display event in the left side of the cell', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //and two events for cell
            //and event will be displayed in 1st timeline
            var event = {
                timeline: 0,
                overlap: {
                    value: 2
                },
                quarter: 2,
                start: Date.today().set({minute: 30})
            };
            $scope.event = event;
            //when displaying event in calendar table
            var parent = angular.element(
                '<div">' +
                '<calendar-table-event event="event" quarter-length="15" quarter-amount="4" />' +
                '<div>'
            );
            $compile(parent)($scope);
            //and parent size
            parent.width(200);
            parent.height(100);
            $scope.$digest();
            $rootScope.$broadcast(mockCalendarEvents.CALENDAR_RENDER);
            //then event has proper size
            var eventElm = parent.find('calendar-table-event');
            expect(eventElm.width()).toBe(65);
            expect(eventElm.height()).toBe(199);
            //and event has proper position
            expect(eventElm.css('left')).toBe('0px');
            expect(eventElm.css('top')).toBe('');
        });

        it('should display event in the right side of the cell', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //and two events for cell
            //and event will be displayed in 2nd timeline
            var event = {
                timeline: 1,
                overlap: {
                    value: 2
                },
                quarter: 2,
                start: Date.today().set({minute: 30})
            };
            $scope.event = event;
            //when displaying event in calendar table
            var parent = angular.element(
                '<div">' +
                '<calendar-table-event event="event" quarter-length="15" quarter-amount="4" />' +
                '<div>'
            );
            $compile(parent)($scope);
            //and parent size
            parent.width(200);
            parent.height(100);
            $scope.$digest();
            $rootScope.$broadcast(mockCalendarEvents.CALENDAR_RENDER);
            //then event has proper size
            var eventElm = parent.find('calendar-table-event');
            expect(eventElm.width()).toBe(65);
            expect(eventElm.height()).toBe(199);
            //and event has proper position
            expect(eventElm.css('left')).toBe('75px');
            expect(eventElm.css('top')).toBe('');
        });

        it('should shift top position of event that start is not equal to quarter time', function () {
            //given current scope is active
            expect($scope).toBeDefined();
            //and two events for cell
            //and event will be displayed in 2nd time line
            //and event doesn't start exactly when quarter does
            var event = {
                timeline: 1,
                overlap: {
                    value: 2
                },
                quarter: 2,
                start: Date.today().set({minute: 10})
            };
            $scope.event = event;
            //when displaying event in calendar table
            var parent = angular.element(
                '<div">' +
                '<calendar-table-event event="event" quarter-length="15" quarter-amount="4" />' +
                '<div>'
            );
            $compile(parent)($scope);
            //and parent size
            parent.width(200);
            parent.height(100);
            $scope.$digest();
            $rootScope.$broadcast(mockCalendarEvents.CALENDAR_RENDER);
            //then event has proper size
            var eventElm = parent.find('calendar-table-event');
            expect(eventElm.width()).toBe(65);
            expect(eventElm.height()).toBe(199);
            //and event has proper position
            expect(eventElm.css('left')).toBe('75px');
            expect(eventElm.css('top')).toBe('66px');
        });

    });

});