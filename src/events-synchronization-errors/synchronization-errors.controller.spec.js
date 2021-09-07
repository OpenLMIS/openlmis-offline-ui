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

describe('SynchronizationErrorsController', function() {

    beforeEach(function() {
        module('events-synchronization-errors');

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
        spyOn(this.eventsService, 'removeEventSynchronizationError');
        spyOn(this.eventsService, 'retryFailedSynchronizationEvent');

        this.initController = initController;

    });

    describe('initialization', function() {

        beforeEach(function() {
            this.vm = this.$controller('SynchronizationErrorsController', {
                synchronizationErrors: this.synchronizationErrors,
                eventsService: this.eventsService,
                $scope: this.$scope,
                $stateParams: this.$stateParams
            });
        });

        it('should expose synchronization errors', function() {
            this.vm.$onInit();

            expect(this.vm.synchronizationErrors).toEqual(this.synchronizationErrors);
        });

        it('should expose event types', function() {
            this.vm.$onInit();

            expect(this.vm.eventTypes).toEqual(this.EVENT_TYPES.getEventTypes());
        });

    });

    describe('remove', function() {
        beforeEach(function() {
            this.initController();
        });

        it('should remove synchronization error from local storage', function() {
            var existingEvent = {
                id: 'existingEvent'
            };

            this.vm.remove(existingEvent);
            this.$rootScope.$apply();

            expect(this.eventsService.removeEventSynchronizationError).toHaveBeenCalledWith(existingEvent);
            expect(this.$state.go).toHaveBeenCalledWith(this.$state.current.name, {}, {
                reload: true
            });
        });
    });

    describe('retry', function() {
        beforeEach(function() {
            this.initController();
        });

        it('should retry the failed synchronization event', function() {
            var deferred = this.$q.defer();
            deferred.resolve();
            this.eventsService.retryFailedSynchronizationEvent.and.returnValue(deferred.promise);

            var existingEvent = {
                id: 'existingEvent'
            };

            this.vm.retry(existingEvent);
            this.$rootScope.$apply();

            expect(this.eventsService.retryFailedSynchronizationEvent).toHaveBeenCalledWith(existingEvent);
        });
    });

    function initController() {
        this.vm = this.$controller('SynchronizationErrorsController', {
            synchronizationErrors: this.synchronizationErrors,
            eventsService: this.eventsService,
            $scope: this.$scope,
            $stateParams: this.$stateParams
        });
        this.vm.$onInit();
        this.$rootScope.$apply();
    }

});
