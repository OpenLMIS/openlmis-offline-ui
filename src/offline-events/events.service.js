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
     * @name offline-events.eventsService
     *
     * @description
     * Responsible for retrieving pending offline events from the local storage.
     */
    angular
        .module('offline-events')
        .factory('eventsService', service);

    service.$inject = ['localStorageService', 'currentUserService'];

    function service(localStorageService, currentUserService) {

        var STOCK_EVENTS = 'stockEvents';

        return {
            getOfflineEvents: getOfflineEvents
        };

        /**
         * @ngdoc method
         * @methodOf offline-events.eventsService
         * @name getOfflineEvents
         *
         * @description
         * Retrieves pending offline events for the current user
         * 
         * @return {Promise} the Array of pending offline events
         */
        function getOfflineEvents() {
            return currentUserService.getUserInfo()
                .then(function(user) {
                    var offlineEvents = localStorageService.get(STOCK_EVENTS);
                    if (!offlineEvents) {
                        return 0;
                    }
                    var userEvents = angular.fromJson(offlineEvents)[user.id];
                    if (!userEvents) {
                        return 0;
                    }
                    return userEvents;
                });
        }

    }
})();
