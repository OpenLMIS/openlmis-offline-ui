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

    /**
     * @ngdoc service
     * @name referencedata-offline-events-indicator.offlineEventsService
     *
     * @description
     * Decorates methods to the offlineEventsService, making it so the 
     * count of events is taken from the main offline events service.
     */
    angular.module('referencedata-offline-events-indicator')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('offlineEventsService', decorator);
    }

    decorator.$inject = ['$delegate', 'eventsService'];
    function decorator($delegate, eventsService) {

        $delegate.getCountOfPendingOfflineEvents = getCountOfPendingOfflineEvents;
        $delegate.getCountOfSyncErrorEvents = getCountOfSyncErrorEvents;

        return {
            getCountOfPendingOfflineEvents: getCountOfPendingOfflineEvents,
            getCountOfSyncErrorEvents: getCountOfSyncErrorEvents
        };

        /**
         * @ngdoc method
         * @methodOf referencedata-offline-events-indicator.offlineEventsService
         * @name getCountOfPendingOfflineEvents
         *
         * @description
         * Retrieves count of pending offline events from events service
         *
         * @return {Promise} the number of pending offline events
         */
        function getCountOfPendingOfflineEvents() {
            return eventsService.getUserPendingEventsFromStorage()
                .then(function(result) {
                    return result.length;
                });
        }

        /**
         * @ngdoc method
         * @methodOf referencedata-offline-events-indicator.offlineEventsService
         * @name getCountOfSyncErrorEvents
         *
         * @description
         * Returned count of synchronized event errors from cache
         *
         * @return {Promise} the number of synchronized event errors
         */
        function getCountOfSyncErrorEvents() {
            return eventsService.getUserEventsSynchronizationErrors()
                .then(function(result) {
                    return result.length;
                });
        }
    }

})();
