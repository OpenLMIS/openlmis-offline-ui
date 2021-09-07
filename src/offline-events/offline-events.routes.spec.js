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

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.$location = $injector.get('$location');
            this.$rootScope = $injector.get('$rootScope');
            this.paginationService = $injector.get('paginationService');
            this.eventsService = $injector.get('eventsService');
        });

        this.events = [{
            id: 'existing-event'
        }];

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
    });

    it('should resolve offline events', function() {
        this.eventsService.search.and.returnValue(this.$q.when(this.events));

        this.goToUrl('/offlineEvents');

        expect(this.getResolvedValue('offlineEvents')).toEqual(this.events);
        expect(this.eventsService.search).toHaveBeenCalledWith({
            page: 0,
            size: 10,
            eventType: undefined,
            startDate: undefined,
            endDate: undefined
        });
    });

});
