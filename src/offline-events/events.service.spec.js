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

    var currentUserService, localStorageService;

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
            },
            {
                facilityId: this.homeFacility.id,
                programId: this.programs[0].id,
                lineItems: [{
                    orderableId: this.orderables[0],
                    occurredDate: '2017-01-01'
                }],
                sent: true,
                error: {
                    status: 'status_1',
                    data: 'message'
                }
            }
        ];

        this.filteredEvents = this.localStorageEvents.user_1.filter(function(event) {
            return !event.sent && !event.error;
        });

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
            localStorageService.get.andReturn(this.localStorageEvents);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user1));

            var eventsCount;
            this.eventsService.getOfflineEvents().then(function(result) {
                eventsCount = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(localStorageService.get).toHaveBeenCalled();
            expect(eventsCount).toEqual(this.filteredEvents);
        });

        it('should get empty list if stock events in local storage are empty', function() {
            localStorageService.get.andReturn(null);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user1));

            var eventsCount;
            this.eventsService.getOfflineEvents().then(function(result) {
                eventsCount = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(localStorageService.get).toHaveBeenCalled();
            expect(eventsCount).toEqual([]);
        });

        it('should get empty list if stock events in local storage are empty for specific user', function() {
            localStorageService.get.andReturn(this.localStorageEvents);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user3));

            var eventsCount;
            this.eventsService.getOfflineEvents().then(function(result) {
                eventsCount = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(localStorageService.get).toHaveBeenCalled();
            expect(eventsCount).toEqual([]);
        });

        it('should prepare proper event object to display', function() {
            localStorageService.get.andReturn(this.localStorageEvents);
            currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user1));

            var events;
            this.eventsService.getOfflineEvents().then(function(result) {
                events = result;
            });
            this.$rootScope.$apply();

            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(localStorageService.get).toHaveBeenCalled();
            expect(events).toEqual(this.filteredEvents);
            expect(events[2].facility).toEqual(this.homeFacility);
            expect(events[2].eventType).toEqual(this.EVENT_TYPES.ADJUSTMENT);
            expect(events[2].program).toEqual(this.programs[0]);
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
            expect(this.localStorageEvents.user_1.length).toEqual(3);
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
            localStorageService.get.andReturn(this.localStorageEvents);
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
            expect(localStorageService.get).toHaveBeenCalled();
            expect(filtered).toEqual([this.localStorageEvents.user_1[0]]);
        });

        it('should return events filtered by endDate param', function() {
            localStorageService.get.andReturn(this.localStorageEvents);
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
            expect(localStorageService.get).toHaveBeenCalled();
            expect(filtered).toEqual(this.filteredEvents);
        });

        it('should return events filtered by eventType param', function() {
            localStorageService.get.andReturn(this.localStorageEvents);
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
            expect(localStorageService.get).toHaveBeenCalled();
            expect(filtered).toEqual([this.localStorageEvents.user_1[1]]);
        });

        it('should return events filtered by all params', function() {
            localStorageService.get.andReturn(this.localStorageEvents);
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
            expect(localStorageService.get).toHaveBeenCalled();
            expect(filtered).toEqual([this.localStorageEvents.user_1[0]]);
        });

    });
});
