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
     * @ngdoc controller
     * @name offline-events.controller:OfflineEventsController
     *
     * @description
     * Controller for managing stock adjustment creation.
     */
    angular
        .module('offline-events')
        .controller('OfflineEventsController', controller);

    controller.$inject = [
        '$scope', '$state', '$stateParams', 'EVENT_TYPES', 'offlineEvents', 'eventsService'
    ];

    function controller($scope, $state, $stateParams, EVENT_TYPES, offlineEvents, eventsService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.getEventTypeLabel = EVENT_TYPES.getLabel;
        vm.search = search;
        vm.remove = remove;

        /**
         * @ngdoc property
         * @propertyOf offline-events.controller:OfflineEventsController
         * @name offlineEvents
         * @type {Array}
         *
         * @description
         * Contains filtered offline events.
         */
        vm.offlineEvents = undefined;

        /**
         * @ngdoc property
         * @propertyOf offline-events.controller:OfflineEventsController
         * @name eventType
         * @type {String}
         *
         * @description
         * Contains event type param for searching events.
         */
        vm.eventType = undefined;

        /**
         * @ngdoc property
         * @propertyOf offline-events.controller:OfflineEventsController
         * @name startDate
         * @type {Date}
         *
         * @description
         * Contains start date param for searching events.
         */
        vm.startDate = undefined;

        /**
         * @ngdoc property
         * @propertyOf offline-events.controller:OfflineEventsController
         * @name endDate
         * @type {Date}
         *
         * @description
         * Contains end date param for searching events.
         */
        vm.endDate = undefined;

        /**
         * @ngdoc method
         * @methodOf offline-events.controller:OfflineEventsController
         * @name search
         *
         * @description
         * Reloads page with new search parameters.
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.eventType = vm.eventType;
            stateParams.startDate = vm.startDate;
            stateParams.endDate = vm.endDate;

            $state.go($state.current.name, stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf offline-events.controller:OfflineEventsController
         * @name remove
         *
         * @description
         * Remove an offline event.
         *
         * @param {Object} event to be removed.
         */
        function remove(event) {
            eventsService.removeOfflineEvent(event);

            vm.search();
        }

        function onInit() {
            vm.eventTypes = EVENT_TYPES.getEventTypes();
            vm.offlineEvents = offlineEvents;

            vm.eventType = $stateParams.eventType;
            vm.startDate = $stateParams.startDate;
            vm.endDate = $stateParams.endDate;
        }
    }
})();
