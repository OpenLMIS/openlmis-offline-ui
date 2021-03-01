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

    service.$inject = ['localStorageService', 'currentUserService', 'EVENT_TYPES', '$q',
        'programService', 'FacilityResource', 'OrderableResource', 'lotService', 'stockReasonsFactory'];

    function service(localStorageService, currentUserService, EVENT_TYPES, $q,
                     programService, FacilityResource, OrderableResource, lotService, stockReasonsFactory) {

        var STOCK_EVENTS = 'stockEvents';

        return {
            getOfflineEvents: getOfflineEvents,
            removeOfflineEvent: removeOfflineEvent,
            search: search
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
            var facilityResource = new FacilityResource();
            var orderableResource = new OrderableResource();

            return currentUserService.getUserInfo()
                .then(function(user) {
                    var offlineEvents = localStorageService.get(STOCK_EVENTS);

                    if (!offlineEvents) {
                        return [];
                    }

                    var userEvents = angular.fromJson(offlineEvents)[user.id];

                    if (!userEvents) {
                        return [];
                    }

                    var facilityIds = [];
                    var orderableIds = [];
                    var lotIds = [];
                    var reasonIds = [];

                    userEvents.forEach(function(event) {
                        if (facilityIds.indexOf(event.facilityId) === -1) {
                            facilityIds.push(event.facilityId);
                        }

                        event.lineItems.forEach(function(item) {
                            var facilityId = null;

                            if (item.sourceId) {
                                facilityId = item.sourceId;
                            }

                            if (item.destinationId) {
                                facilityId = item.destinationId;
                            }

                            if (facilityId && facilityIds.indexOf(facilityId) === -1) {
                                facilityIds.push(facilityId);
                            }

                            if (orderableIds.indexOf(item.orderableId) === -1) {
                                orderableIds.push(item.orderableId);
                            }

                            if (item.lotId && lotIds.indexOf(item.lotId) === -1) {
                                lotIds.push(item.lotId);
                            }

                            if (item.reasonId && reasonIds.indexOf(item.reasonId) === -1) {
                                reasonIds.push(item.reasonId);
                            }
                        });
                    });

                    console.log('facility ids: ', facilityIds);

                    return $q.all([
                        programService.getAll(),
                        facilityResource.query({
                            id: facilityIds
                        }),
                        orderableResource.query({
                            id: orderableIds
                        }),
                        lotService.query({
                            id: lotIds
                        }),
                        stockReasonsFactory.getReasons()
                    ]).then(function(responses) {
                        var programs = responses[0],
                            facilities = responses[1].content,
                            orderables = responses[2].content,
                            lots = responses[3].content,
                            reasons = responses[4];
                        console.log('facilities: ', facilities);

                        return combineResponses(userEvents, programs, facilities, orderables, lots, reasons);
                    });
                });
        }

        /**
         * @ngdoc method
         * @methodOf offline-events.eventsService
         * @name removeOfflineEvent
         *
         * @description
         * Removes the offline event
         *
         * @param  {Object}  event the event that should be removed
         */
        function removeOfflineEvent(event) {
            currentUserService.getUserInfo()
                .then(function(user) {
                    var offlineEvents = localStorageService.get(STOCK_EVENTS);

                    if (!offlineEvents) {
                        return;
                    }

                    offlineEvents = angular.fromJson(offlineEvents);
                    var userEvents = offlineEvents[user.id];

                    if (!userEvents) {
                        return;
                    }

                    userEvents.splice(event.ind, 1);

                    localStorageService.add(STOCK_EVENTS, angular.toJson(offlineEvents));
                });
        }

        /**
         * @ngdoc method
         * @methodOf offline-events.eventsService
         * @name search
         *
         * @description
         * Searches Offline Events using given parameters.
         *
         * @param  {Object}  params the pagination and query parameters
         * @return {Promise}  the requested page of filtered events
         */
        function search(params) {
            return getOfflineEvents()
                .then(function(events) {
                    console.log('filter patrams: ', params);
                    console.log('all events: ', events);
                    var filtredEvents = events.filter(function(event) {
                        var eventDate = event.lineItems[0].occurredDate;

                        if (params.startDate && params.startDate > eventDate) {
                            return false;
                        }

                        if (params.endDate && params.endDate < eventDate) {
                            return false;
                        }

                        if (params.eventType) {
                            return event.eventType === params.eventType;
                        }

                        return true;
                    });

                    console.log('filtred events: ', filtredEvents);
                    return filtredEvents;
                });
        }

        function combineResponses(offlineEvents, programs, facilities, orderables, lots, reasons) {
            var programsMap = programs.reduce(function(map, program) {
                map[program.id] = program;
                return map;
            }, {});
            var facilitiesMap = facilities.reduce(function(map, facility) {
                map[facility.id] = facility;
                return map;
            }, {});
            var orderablesMap = orderables.reduce(function(map, orderable) {
                map[orderable.id] = orderable;
                return map;
            }, {});
            var lotsMap = lots.reduce(function(map, lot) {
                map[lot.id] = lot;
                return map;
            }, {});
            var reasonsMap = reasons.reduce(function(map, reason) {
                map[reason.id] = reason;
                return map;
            }, {});

            return offlineEvents.map(function(event, ind) {
                event.ind = ind;
                event.program = programsMap[event.programId];
                event.facility = facilitiesMap[event.facilityId];

                var lineItem = event.lineItems[0];

                if (lineItem.sourceId) {
                    event.eventType = EVENT_TYPES.RECEIVE;
                } else if (lineItem.destinationId) {
                    event.eventType = EVENT_TYPES.ISSUE;
                } else {
                    event.eventType = EVENT_TYPES.ADJUSTMENT;
                }

                event.lineItems = event.lineItems.map(function(item) {
                    if (item.sourceId) {
                        item.source = facilitiesMap[item.sourceId];
                    }

                    if (item.destinationId) {
                        item.destination = facilitiesMap[item.destinationId];
                    }

                    item.orderable = orderablesMap[item.orderableId];
                    item.lot = lotsMap[item.lotId];
                    item.reason = reasonsMap[item.reasonId];

                    return item;
                });

                return event;
            });
        }

    }
})();
