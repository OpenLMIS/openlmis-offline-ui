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
