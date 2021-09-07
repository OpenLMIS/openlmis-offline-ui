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

describe('Offline Events Service Decorator', function() {

    var eventsService;

    beforeEach(function() {
        module('referencedata-offline-events-indicator', function($provide) {
            eventsService = jasmine.createSpyObj('eventsService', ['getUserPendingEventsFromStorage',
                'getUserEventsSynchronizationErrors']);
            $provide.service('eventsService', function() {
                return eventsService;
            });
        });

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.offlineEventsService = $injector.get('offlineEventsService');
        });

        this.localStoragePendingEvents = [
            {
                facilityId: 'facility_1',
                programId: 'program_1',
                lineItems: [{
                    orderableId: 'orderable_1'
                }]
            },
            {
                facilityId: 'facility_1',
                programId: 'program_2',
                lineItems: [{
                    orderableId: 'orderable_3'
                }]
            }
        ];

        this.localStorageErrorEvents = [
            {
                facilityId: 'facility_1',
                programId: 'program_2',
                lineItems: [{
                    orderableId: 'orderable_3'
                }],
                sent: true,
                error: {
                    status: 'status_1',
                    data: 'message'
                }
            }
        ];
    });

    describe('getCountOfPendingOfflineEvents', function() {
        it('should get count of offline events', function() {
            eventsService.getUserPendingEventsFromStorage
                .and.returnValue(this.$q.resolve(this.localStoragePendingEvents));

            var eventsCount;
            this.offlineEventsService.getCountOfPendingOfflineEvents().then(function(result) {
                eventsCount = result;
            });
            this.$rootScope.$apply();

            expect(eventsCount).toEqual(this.localStoragePendingEvents.length);
        });

        it('should get 0 if there are no offline events', function() {
            eventsService.getUserPendingEventsFromStorage.and.returnValue(this.$q.resolve([]));

            var eventsCount;
            this.offlineEventsService.getCountOfPendingOfflineEvents().then(function(result) {
                eventsCount = result;
            });
            this.$rootScope.$apply();

            expect(eventsCount).toEqual(0);
        });
    });

    describe('getCountOfSyncErrorEvents', function() {
        it('should get count of offline events error', function() {
            eventsService.getUserEventsSynchronizationErrors
                .and.returnValue(this.$q.resolve(this.localStorageErrorEvents));

            var eventsCount;
            this.offlineEventsService.getCountOfSyncErrorEvents().then(function(result) {
                eventsCount = result;
            });
            this.$rootScope.$apply();

            expect(eventsCount).toEqual(this.localStorageErrorEvents.length);
        });

        it('should get 0 if there are no offline events error', function() {
            eventsService.getUserEventsSynchronizationErrors.and.returnValue(this.$q.resolve([]));

            var eventsCount;
            this.offlineEventsService.getCountOfSyncErrorEvents().then(function(result) {
                eventsCount = result;
            });
            this.$rootScope.$apply();

            expect(eventsCount).toEqual(0);
        });
    });
});
