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

describe('eventsService', function() {

    var currentUserService, localStorageService, stockEventCacheService;

    beforeEach(function() {
        module('offline-events', function($provide) {
            currentUserService = jasmine.createSpyObj('currentUserService', ['getUserInfo']);
            $provide.service('currentUserService', function() {
                return currentUserService;
            });

            localStorageService = jasmine.createSpyObj('localStorageService', ['get', 'add']);
            $provide.service('localStorageService', function() {
                return localStorageService;
            });
            stockEventCacheService = jasmine.createSpyObj('stockEventCacheService', [
                'getStockEvents', 'getStockEventsSynchronizationErrors',
                'cacheStockEvents', 'cacheStockEventSynchronizationError'
            ]);
            $provide.service('stockEventCacheService', function() {
                return stockEventCacheService;
            });
        });

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.eventsService = $injector.get('eventsService');
            this.lotService = $injector.get('lotService');
            this.stockReasonsFactory = $injector.get('stockReasonsFactory');
            this.programService = $injector.get('programService');
            this.facilityFactory = $injector.get('facilityFactory');
            this.OrderableResource = $injector.get('OrderableResource');
            this.LotResource = $injector.get('LotResource');
            this.LotDataBuilder = $injector.get('LotDataBuilder');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.FacilityTypeDataBuilder = $injector.get('FacilityTypeDataBuilder');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.ProgramOrderableDataBuilder = $injector.get('ProgramOrderableDataBuilder');
            this.ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            this.sourceDestinationService = $injector.get('sourceDestinationService');
            this.EVENT_TYPES = $injector.get('EVENT_TYPES');
        });

        this.user1 = {
            id: 'user_1'
        };

        this.user3 = {
            id: 'user_3'
        };

        this.programs = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];

        this.facilityType = new this.FacilityTypeDataBuilder().build();

        this.homeFacility = new this.FacilityDataBuilder()
            .withSupportedPrograms(this.programs)
            .withFacilityType(this.facilityType)
            .build();

        this.orderable = new this.OrderableDataBuilder()
            .withPrograms([
                new this.ProgramOrderableDataBuilder()
                    .withProgramId(this.programs[0].id)
                    .buildJson(),
                new this.ProgramOrderableDataBuilder()
                    .withProgramId(this.programs[1].id)
                    .buildJson()
            ])
            .withChildren(this.orderableChildren)
            .build();

        this.orderables = [
            this.orderable,
            new this.OrderableDataBuilder().build(),
            new this.OrderableDataBuilder().build()
        ];

        this.orderablesPage = new this.PageDataBuilder()
            .withContent(this.orderables)
            .build();

        this.reason1 =  new this.ReasonDataBuilder()
            .build();
        this.reason2 =  new this.ReasonDataBuilder()
            .build();
        this.reason3 =  new this.ReasonDataBuilder()
            .build();

        this.reasons = [
            this.reason1,
            this.reason2,
            this.reason3
        ];

        this.validSources = [
            {
                facilityTypeId: this.facilityType.id,
                id: 'source-id-1',
                name: 'source one',
                programId: this.programs[0].id,
                facilityId: this.homeFacilityId,
                node: {
                    id: 'node-id-1'
                }
            }
        ];

        this.validDestinations = [
            {
                facilityTypeId: this.facilityType.id,
                id: 'dest-id-1',
                name: 'destination one',
                programId: this.programs[0].id,
                facilityId: this.homeFacilityId,
                node: {
                    id: 'node-id-2'
                }
            }
        ];

        this.localStorageEvents = {};
        this.localStorageEvents['user_1'] = [
            {
                facilityId: this.homeFacility.id,
                programId: this.programs[1].id,
                lineItems: [{
                    orderableId: this.orderables[0],
                    occurredDate: '2018-02-01',
                    destinationId: 'node-id-1'
                }]
            },
            {
                facilityId: this.homeFacility.id,
                programId: this.programs[0].id,
                lineItems: [{
                    orderableId: this.orderables[1],
                    occurredDate: '2017-01-01',
                    sourceId: 'node-id-1'
                }]
            },
            {
                facilityId: this.homeFacility.id,
                programId: this.programs[0].id,
                lineItems: [{
                    orderableId: this.orderables[0],
                    occurredDate: '2017-01-01'
                }]
            }
        ];

        this.localStorageEvents['user_2'] = [
            {
                facilityId: this.homeFacility.id,
                programId: this.programs[0].id,
                lineItems: [{
                    orderableId: this.orderables[0],
                    occurredDate: '2017-01-01'
                }]
            }
        ];

        this.localStorageSyncEventErrors = {};
        this.localStorageSyncEventErrors['user_1'] = [
            {
                event: 'event_1',
                error: 'error_1'
            }
        ];

        spyOn(this.OrderableResource.prototype, 'query').andReturn(this.$q.resolve(this.orderablesPage));
        spyOn(this.facilityFactory, 'getUserHomeFacility').andReturn(this.$q.resolve(this.homeFacility));
        spyOn(this.stockReasonsFactory, 'getReasons').andReturn(this.$q.resolve(this.reasons));
        spyOn(this.sourceDestinationService, 'getSourceAssignments').andReturn(this.$q.resolve(this.validSources));
        spyOn(this.sourceDestinationService, 'getDestinationAssignments')
            .andReturn(this.$q.resolve(this.validDestinations));

        spyOn(this.lotService, 'query').andReturn(this.$q.when(
            new this.PageDataBuilder()
                .withContent([
                    new this.LotDataBuilder().withId('lot-1')
                        .withTradeItemId('trade-item-2')
                        .build(),
                    new this.LotDataBuilder().withId('lot-2')
                        .withTradeItemId('trade-item-2')
                        .build(),
                    new this.LotDataBuilder().withId('lot-3')
                        .withTradeItemId('trade-item-2')
                        .build(),
                    new this.LotDataBuilder().withId('lot-4')
                        .withTradeItemId('trade-item-3')
                        .build(),
                    new this.LotDataBuilder().withId('lot-5')
                        .withTradeItemId('trade-item-3')
                        .build(),
                    new this.LotDataBuilder().withId('lot-6')
                        .withTradeItemId('trade-item-4')
                        .build(),
                    new this.LotDataBuilder().withId('lot-7')
                        .withTradeItemId('trade-item-6')
                        .build(),
                    new this.LotDataBuilder().withId('lot-8')
                        .withTradeItemId('trade-item-6')
                        .build()
                ])
                .build()
        ));
    });

    describe('getOfflineEvents', function() {

        it('should get a list of offline events', function() {
            stockEventCacheService.getStockEvents.andReturn(this.localStorageEvents);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user1));

            var events;
            this.eventsService.getOfflineEvents().then(function(result) {
                events = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.getStockEvents).toHaveBeenCalled();
            expect(events).toEqual(this.localStorageEvents[this.user1.id]);
        });

        it('should get empty list if stock events in local storage are empty', function() {
            stockEventCacheService.getStockEvents.andReturn(null);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user1));

            var events;
            this.eventsService.getOfflineEvents().then(function(result) {
                events = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.getStockEvents).toHaveBeenCalled();
            expect(events).toEqual([]);
        });

        it('should get empty list if stock events in local storage are empty for specific user', function() {
            stockEventCacheService.getStockEvents.andReturn(this.localStorageEvents);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user3));

            var events;
            this.eventsService.getOfflineEvents().then(function(result) {
                events = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.getStockEvents).toHaveBeenCalled();
            expect(events).toEqual([]);
        });

        it('should prepare proper event object to display', function() {
            stockEventCacheService.getStockEvents.andReturn(this.localStorageEvents);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user1));

            var events;
            this.eventsService.getOfflineEvents().then(function(result) {
                events = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.getStockEvents).toHaveBeenCalled();
            expect(events).toEqual(this.localStorageEvents[this.user1.id]);
            expect(events[2].facility).toEqual(this.homeFacility);
            expect(events[2].eventType).toEqual(this.EVENT_TYPES.ADJUSTMENT);
            expect(events[2].program).toEqual(this.programs[0]);
        });

    });

    describe('getUserEventsSynchronizationErrors', function() {

        it('should get a list of offline events errors', function() {
            stockEventCacheService.getStockEventsSynchronizationErrors.andReturn(this.localStorageSyncEventErrors);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user1));

            var syncEventErrors;
            this.eventsService.getUserEventsSynchronizationErrors().then(function(result) {
                syncEventErrors = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.getStockEventsSynchronizationErrors).toHaveBeenCalled();
            expect(syncEventErrors).toEqual(this.localStorageSyncEventErrors[this.user1.id]);
        });

        it('should get empty list if stock events error in local storage are empty', function() {
            stockEventCacheService.getStockEventsSynchronizationErrors.andReturn(null);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user1));

            var syncEventErrors;
            this.eventsService.getUserEventsSynchronizationErrors().then(function(result) {
                syncEventErrors = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.getStockEventsSynchronizationErrors).toHaveBeenCalled();
            expect(syncEventErrors).toEqual([]);
        });

        it('should get empty list if stock events error in local storage are empty for specific user', function() {
            stockEventCacheService.getStockEventsSynchronizationErrors.andReturn(this.localStorageSyncEventErrors);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user3));

            var syncEventErrors;
            this.eventsService.getUserEventsSynchronizationErrors().then(function(result) {
                syncEventErrors = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.getStockEventsSynchronizationErrors).toHaveBeenCalled();
            expect(syncEventErrors).toEqual([]);
        });
    });

    describe('removeOfflineEvent', function() {

        it('should remove given event from the local storage', function() {
            localStorageService.get.andReturn(this.localStorageEvents);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user1));

            this.eventsService.removeOfflineEvent(this.localStorageEvents.user_1[0]);
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(localStorageService.get).toHaveBeenCalled();
            expect(this.localStorageEvents.user_1.length).toEqual(2);
        });

        it('should do nothing when no offline events', function() {
            localStorageService.get.andReturn(null);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user1));

            this.eventsService.removeOfflineEvent(this.localStorageEvents.user_1[0]);
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(localStorageService.get).toHaveBeenCalled();
            expect(localStorageService.add).not.toHaveBeenCalled();
        });

        it('should do nothing when no offline events for a given user', function() {
            localStorageService.get.andReturn(this.localStorageEvents);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user3));

            this.eventsService.removeOfflineEvent(this.localStorageEvents.user_1[0]);
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(localStorageService.get).toHaveBeenCalled();
            expect(localStorageService.add).not.toHaveBeenCalled();
        });

    });

    describe('search', function() {

        it('should return events filtered by startDate param', function() {
            stockEventCacheService.getStockEvents.andReturn(this.localStorageEvents);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user1));

            var params = {
                startDate: '2017-02-01'
            };

            var filtered;
            this.eventsService.search(params).then(function(result) {
                filtered = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.getStockEvents).toHaveBeenCalled();
            expect(filtered).toEqual([this.localStorageEvents.user_1[0]]);
        });

        it('should return events filtered by endDate param', function() {
            stockEventCacheService.getStockEvents.andReturn(this.localStorageEvents);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user1));

            var params = {
                endDate: '2020-02-01'
            };

            var filtered;
            this.eventsService.search(params).then(function(result) {
                filtered = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.getStockEvents).toHaveBeenCalled();
            expect(filtered).toEqual(this.localStorageEvents[this.user1.id]);
        });

        it('should return events filtered by eventType param', function() {
            stockEventCacheService.getStockEvents.andReturn(this.localStorageEvents);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user1));

            var params = {
                eventType: this.EVENT_TYPES.RECEIVE
            };

            var filtered;
            this.eventsService.search(params).then(function(result) {
                filtered = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.getStockEvents).toHaveBeenCalled();
            expect(filtered).toEqual([this.localStorageEvents.user_1[1]]);
        });

        it('should return events filtered by all params', function() {
            stockEventCacheService.getStockEvents.andReturn(this.localStorageEvents);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user1));

            var params = {
                startDate: '2017-02-01',
                endDate: '2020-02-01',
                eventType: this.EVENT_TYPES.ISSUE
            };

            var filtered;
            this.eventsService.search(params).then(function(result) {
                filtered = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.getStockEvents).toHaveBeenCalled();
            expect(filtered).toEqual([this.localStorageEvents.user_1[0]]);
        });

    });
});
