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
     * @ngdoc object
     * @name offline-events.EVENT_TYPES
     *
     * @description
     * This is constant for event types.
     */
    angular
        .module('offline-events')
        .constant('EVENT_TYPES', types());

    function types() {
        var EVENT_TYPES = {
                ISSUE: 'ISSUE',
                RECEIVE: 'RECEIVE',
                ADJUSTMENT: 'ADJUSTMENT',
                getLabel: getLabel,
                getEventTypes: getEventTypes
            },
            labels = {
                ISSUE: 'offlineEvents.issue',
                RECEIVE: 'offlineEvents.receive',
                ADJUSTMENT: 'offlineEvents.adjustment'
            };

        return EVENT_TYPES;

        /**
         * @ngdoc method
         * @methodOf offline-events.EVENT_TYPES
         * @name getLabel
         *
         * @description
         * Returns a label for the given event type. Throws an exception if the type is not recognized.
         *
         * @param  {String} type the event type
         * @return {String}      the label
         */
        function getLabel(type) {
            var label = labels[type];

            if (!label) {
                throw '"' + type + '" is not a valid event type';
            }

            return label;
        }

        /**
         * @ngdoc method
         * @methodOf offline-events.EVENT_TYPES
         * @name getTypes
         *
         * @description
         * Returns all available event types as a list.
         *
         * @return {Array} the list of available event types
         */
        function getEventTypes() {
            return [
                EVENT_TYPES.ISSUE,
                EVENT_TYPES.RECEIVE,
                EVENT_TYPES.ADJUSTMENT
            ];
        }
    }

})();
