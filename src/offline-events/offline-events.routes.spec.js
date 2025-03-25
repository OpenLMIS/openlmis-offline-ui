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

describe('openlmis.pendingOfflineEvents state', function() {

    'use strict';

    beforeEach(function() {
        module('offline-events');

        var MinimalFacilityDataBuilder, UserDataBuilder, ProgramDataBuilder;

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.$location = $injector.get('$location');
            this.$rootScope = $injector.get('$rootScope');
            this.paginationService = $injector.get('paginationService');
            this.eventsService = $injector.get('eventsService');
            MinimalFacilityDataBuilder = $injector.get('MinimalFacilityDataBuilder');
            UserDataBuilder = $injector.get('UserDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.facilityFactory = $injector.get('facilityFactory');
            this.authorizationService =  $injector.get('authorizationService');
            this.stockProgramUtilService =  $injector.get('stockProgramUtilService');
            this.STOCKMANAGEMENT_RIGHTS = $injector.get('STOCKMANAGEMENT_RIGHTS');
        });

        this.events = [{
            id: 'existing-event'
        }];

        this.homeFacility = new MinimalFacilityDataBuilder()
            .build();
        this.user = new UserDataBuilder()
            .withHomeFacilityId(this.homeFacility.id)
            .build();
        this.programs = [
            new ProgramDataBuilder().build(),
            new ProgramDataBuilder().build()
        ];

        this.$state.go('openlmis.pendingOfflineEvents');
        this.$rootScope.$apply();

        this.goToUrl = function(url) {
            this.$location.url(url);
            this.$rootScope.$apply();
        };

        this.getResolvedValue = function(name) {
            return this.$state.$current.locals.globals[name];
        };

        spyOn(this.eventsService, 'search');
        spyOn(this.facilityFactory, 'getUserHomeFacility').andReturn(this.$q.resolve(this.homeFacility));
        spyOn(this.authorizationService, 'getUser').andReturn(this.$q.resolve(this.user));
        spyOn(this.stockProgramUtilService, 'getPrograms').andReturn(this.$q.resolve(this.programs));
    });

    it('should resolve offline events', function() {
        this.eventsService.search.andReturn(this.$q.when(this.events));

        this.goToUrl('/offlineEvents');

        expect(this.getResolvedValue('offlineEvents')).toEqual(this.events);
        expect(this.eventsService.search).toHaveBeenCalledWith({
            page: 0,
            size: 10,
            eventType: undefined,
            startDate: undefined,
            endDate: undefined
        }, this.programs);
    });

    it('should resolve user', function() {
        this.eventsService.search.andReturn(this.$q.when(this.events));

        this.goToUrl('/offlineEvents');

        expect(this.getResolvedValue('user')).toEqual(this.user);
    });

    it('should resolve programs', function() {
        this.eventsService.search.andReturn(this.$q.when(this.events));

        this.goToUrl('/offlineEvents');

        expect(this.getResolvedValue('programs')).toEqual(this.programs);
    });

});
