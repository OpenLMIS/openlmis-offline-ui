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

            localStorageService = jasmine.createSpyObj('localStorageService', ['get']);
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
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.ProgramOrderableDataBuilder = $injector.get('ProgramOrderableDataBuilder');
            this.ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            this.sourceDestinationService = $injector.get('sourceDestinationService');
        });

        this.localStorageEvents = {};
        this.localStorageEvents['user_1'] = [
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
        this.localStorageEvents['user_2'] = [
            {
                facilityId: 'facility_1',
                programId: 'program_3',
                lineItems: [{
                    orderableId: 'orderable_5'
                }]
            }
        ];

        this.user1 = {
            id: 'user_1'
        };

        this.user3 = {
            id: 'user_3'
        };

        this.program1 = new this.ProgramDataBuilder().build();
        this.program2 = new this.ProgramDataBuilder().build();

        this.programs = [
            this.program1,
            this.program2
        ];

        this.homeFacility = new this.FacilityDataBuilder()
            .withSupportedPrograms(this.programs)
            .build();

        this.programs = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];

        this.orderable = new this.OrderableDataBuilder()
            .withPrograms([
                new this.ProgramOrderableDataBuilder()
                    .withProgramId(this.programs[0].id)
                    .buildJson(),
                new this.ProgramOrderableDataBuilder()
                    .withProgramId(this.programs[2].id)
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
                facilityTypeId: 'fac-type-id-1',
                id: 'source-id-1',
                name: 'source one',
                programId: 'program-id-1',
                facilityId: this.homeFacilityId
            }
        ];

        this.validDestinations = [
            {
                facilityTypeId: 'fac-type-id-1',
                id: 'dest-id-1',
                name: 'destination one',
                programId: 'program-id-1',
                facilityId: this.homeFacilityId
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
            expect(eventsCount).toEqual(this.localStorageEvents.user_1);
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
    });
});
