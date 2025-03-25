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

(function() {
    'use strict';

    angular
        .module('offline-events')
        .config(routes);

    routes.$inject = ['$stateProvider'];

    function routes($stateProvider) {
        $stateProvider.state('openlmis.pendingOfflineEvents', {
            isOffline: true,
            url: '/offlineEvents?page&size&eventType&startDate&endDate',
            views: {
                '@openlmis': {
                    controller: 'OfflineEventsController',
                    templateUrl: 'offline-events/offline-events.html',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                programs: function(user, stockProgramUtilService, STOCKMANAGEMENT_RIGHTS) {
                    return stockProgramUtilService.getPrograms(user.user_id, STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST);
                },
                offlineEvents: function(paginationService, $stateParams, eventsService, programs) {
                    return paginationService.registerList(null, $stateParams, function() {
                        return eventsService.search($stateParams, programs);
                    });
                }
            }
        });
    }
})();
