/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

describe('OfflineEventsController', function() {

    beforeEach(function() {
        module('offline-events', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$stateParams = $injector.get('$stateParams');
            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.$rootScope = $injector.get('$rootScope');
            this.$scope = $injector.get('$rootScope').$new();
            this.eventsService = $injector.get('eventsService');
            this.EVENT_TYPES = $injector.get('EVENT_TYPES');
        });

        spyOn(this.$state, 'go');
        spyOn(this.eventsService, 'removeOfflineEvent');

        this.initController = initController;

    });

    describe('initialization', function() {

        beforeEach(function() {
            this.vm = this.$controller('OfflineEventsController', {
                offlineEvents: this.offlineEvents,
                eventType: this.eventType,
                startDate: this.startDate,
                endDate: this.endDate,
                eventsService: this.eventsService,
                $scope: this.$scope,
                $stateParams: this.$stateParams
            });
        });

        it('should expose offline events', function() {
            this.vm.$onInit();

            expect(this.vm.offlineEvents).toEqual(this.offlineEvents);
        });

        it('should expose selected event type', function() {
            this.$stateParams.eventType = this.EVENT_TYPES.ISSUE;

            this.vm.$onInit();

            expect(this.vm.eventType).toEqual(this.EVENT_TYPES.ISSUE);
        });

        it('should expose event types', function() {
            this.vm.$onInit();

            expect(this.vm.eventTypes).toEqual(this.EVENT_TYPES.getEventTypes());
        });

        it('should set startDate if it is passed through the URL', function() {
            this.$stateParams.startDate = '2017-01-31';

            this.vm.$onInit();

            expect(this.vm.startDate).toEqual('2017-01-31');
        });

        it('should not set startDate if not passed through the URL', function() {
            this.$stateParams.startDate = undefined;

            this.vm.$onInit();

            expect(this.vm.startDate).toBeUndefined();
        });

        it('should set endDate if it is passed through the URL', function() {
            this.$stateParams.endDate = '2017-01-31';

            this.vm.$onInit();

            expect(this.vm.endDate).toEqual('2017-01-31');
        });

        it('should not set endDate if not passed through the URL', function() {
            this.$stateParams.endDate = undefined;

            this.vm.$onInit();

            expect(this.vm.endDate).toBeUndefined();
        });

    });

    describe('search', function() {
        beforeEach(function() {
            this.initController();
        });

        it('should search for pending offline events by startDate param', function() {
            this.$stateParams.startDate = '2017-01-31';

            this.vm.$onInit();

            this.vm.search();
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith(this.$state.current.name, {
                eventType: undefined,
                startDate: this.$stateParams.startDate,
                endDate: undefined
            }, {
                reload: true
            });
        });

        it('should search for pending offline events by endDate param', function() {
            this.$stateParams.endDate = '2021-01-31';

            this.vm.$onInit();

            this.vm.search();
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith(this.$state.current.name, {
                eventType: undefined,
                startDate: undefined,
                endDate: this.$stateParams.endDate
            }, {
                reload: true
            });
        });

        it('should search for pending offline events by eventType param', function() {
            this.$stateParams.eventType = this.EVENT_TYPES.RECEIVE;

            this.vm.$onInit();

            this.vm.search();
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith(this.$state.current.name, {
                eventType: this.$stateParams.eventType,
                startDate: undefined,
                endDate: undefined
            }, {
                reload: true
            });
        });

        it('should search for pending offline events by all params', function() {
            this.$stateParams.startDate = '2017-01-31';
            this.$stateParams.endDate = '2021-01-31';
            this.$stateParams.eventType = this.EVENT_TYPES.RECEIVE;

            this.vm.$onInit();

            this.vm.search();
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith(this.$state.current.name, {
                eventType: this.$stateParams.eventType,
                startDate: this.$stateParams.startDate,
                endDate: this.$stateParams.endDate
            }, {
                reload: true
            });
        });

    });

    describe('remove', function() {
        beforeEach(function() {
            this.initController();
        });

        it('should remove pending offline event from local storage', function() {
            var existingEvent = {
                id: 'existingEvent'
            };

            this.vm.remove(existingEvent);
            this.$rootScope.$apply();

            expect(this.eventsService.removeOfflineEvent).toHaveBeenCalledWith(existingEvent);
            expect(this.$state.go).toHaveBeenCalledWith(this.$state.current.name, {
                eventType: undefined,
                startDate: undefined,
                endDate: undefined
            }, {
                reload: true
            });
        });
    });

    function initController() {
        this.vm = this.$controller('OfflineEventsController', {
            offlineEvents: this.offlineEvents,
            eventType: this.eventType,
            startDate: this.startDate,
            endDate: this.endDate,
            eventsService: this.eventsService,
            $scope: this.$scope,
            $stateParams: this.$stateParams
        });
        this.vm.$onInit();
        this.$rootScope.$apply();
    }

});
