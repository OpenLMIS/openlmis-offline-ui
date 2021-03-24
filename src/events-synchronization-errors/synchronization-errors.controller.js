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
     * @name events-synchronization-errors.controller:SynchronizationErrors
     *
     * @description
     * Controller for managing synchronization errors.
     */
    angular
        .module('events-synchronization-errors')
        .controller('SynchronizationErrorsController', controller);

    controller.$inject = [
        '$scope', '$state', '$stateParams', 'EVENT_TYPES', 'synchronizationErrors', 'eventsService'
    ];

    function controller($scope, $state, $stateParams, EVENT_TYPES, synchronizationErrors, eventsService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.getEventTypeLabel = EVENT_TYPES.getLabel;
        vm.remove = remove;
        vm.retry = retry;

        /**
         * @ngdoc property
         * @propertyOf offline-events.controller:OfflineEventsController
         * @name synchronizationErrors
         * @type {Array}
         *
         * @description
         * Contains synchronization errors.
         */
        vm.synchronizationErrors = undefined;

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
            eventsService.removeEventSynchronizationError(event);

            $state.go($state.current.name, $stateParams, {
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
        function retry(event) {
            eventsService.retryFailedSynchronizationEvent(event)
                .then(function() {
                    $state.go($state.current.name, $stateParams, {
                        reload: true
                    });
                });
        }

        function onInit() {
            vm.eventTypes = EVENT_TYPES.getEventTypes();
            vm.synchronizationErrors = synchronizationErrors;
        }
    }
})();
