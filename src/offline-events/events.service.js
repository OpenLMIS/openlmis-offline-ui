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
        'facilityFactory', 'OrderableResource', 'lotService', 'stockReasonsFactory',
        'sourceDestinationService', 'stockEventCacheService', 'StockEventResource'];

    function service(localStorageService, currentUserService, EVENT_TYPES, $q, facilityFactory,
                     OrderableResource, lotService, stockReasonsFactory, sourceDestinationService,
                     stockEventCacheService, StockEventResource) {

        var STOCK_EVENTS = 'stockEvents';
        var STOCK_EVENTS_SYNCHRONIZATION_ERRORS = 'stockEventsSynchronizationErrors';

        return {
            getUserPendingEventsFromStorage: getUserPendingEventsFromStorage,
            getUserEventsSynchronizationErrors: getUserEventsSynchronizationErrors,
            getOfflineEvents: getOfflineEvents,
            getEventsSynchronizationErrors: getEventsSynchronizationErrors,
            removeOfflineEvent: removeOfflineEvent,
            removeEventSynchronizationError: removeEventSynchronizationError,
            retryFailedSynchronizationEvent: retryFailedSynchronizationEvent,
            search: search
        };

        /**
         * @ngdoc method
         * @methodOf offline-events.eventsService
         * @name getUserPendingEventsFromStorage
         *
         * @description
         * Retrieves pending offline events from cache for current user
         *
         * @return {Promise} the Array of events created offline by current user
         */
        function getUserPendingEventsFromStorage() {
            return currentUserService.getUserInfo()
                .then(function(user) {
                    var offlineEvents = stockEventCacheService.getStockEvents();
                    return offlineEvents ? angular.fromJson(offlineEvents)[user.id] : [];
                });
        }

        /**
         * @ngdoc method
         * @methodOf offline-events.eventsService
         * @name getUserEventsSynchronizationErrors
         *
         * @description
         * Retrieves synchronization event errors from cache for current user
         *
         * @return {Promise} the Array of events which failed during synchronization
         */
        function getUserEventsSynchronizationErrors() {
            return currentUserService.getUserInfo()
                .then(function(user) {
                    var syncErrors = stockEventCacheService.getStockEventsSynchronizationErrors();
                    if (syncErrors) {
                        syncErrors = angular.fromJson(syncErrors)[user.id];
                    }
                    return syncErrors ? syncErrors : [];
                });
        }

        /**
         * @ngdoc method
         * @methodOf offline-events.eventsService
         * @name getOfflineEvents
         *
         * @description
         * Retrieves pending offline events for the current user
         * and combines them with all necessary data
         *
         * @return {Promise} the Array of pending offline events
         */
        function getOfflineEvents() {
            var orderableResource = new OrderableResource();

            return getUserPendingEventsFromStorage()
                .then(function(userEvents) {
                    return fetchAndCombineEventData(userEvents, orderableResource);
                });
        }

        /**
         * @ngdoc method
         * @methodOf offline-events.eventsService
         * @name getOfflineEvents
         *
         * @description
         * Retrieves pending offline events for the current user
         * and combines them with all necessary data
         *
         * @return {Promise} the Array of pending offline events
         */
        function getEventsSynchronizationErrors() {
            var orderableResource = new OrderableResource();

            return getUserEventsSynchronizationErrors()
                .then(function(userEvents) {
                    return fetchAndCombineEventData(userEvents, orderableResource);
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
         * @name removeEventSynchronizationError
         *
         * @description
         * Removes the event synchronization error
         *
         * @param  {Object}  event the event that should be removed
         */
        function removeEventSynchronizationError(event) {
            currentUserService.getUserInfo()
                .then(function(user) {
                    var synchronizationErrors = localStorageService.get(STOCK_EVENTS_SYNCHRONIZATION_ERRORS);

                    if (!synchronizationErrors) {
                        return;
                    }

                    synchronizationErrors = angular.fromJson(synchronizationErrors);
                    var userEvents = synchronizationErrors[user.id];

                    if (!userEvents) {
                        return;
                    }

                    userEvents.splice(event.ind, 1);

                    localStorageService.add(STOCK_EVENTS_SYNCHRONIZATION_ERRORS, angular.toJson(synchronizationErrors));
                });
        }

        /**
         * @ngdoc method
         * @methodOf offline-events.eventsService
         * @name retryFailedSynchronizationEvent
         *
         * @description
         * Tries to resend failed offline event.
         *
         * @param  {Object}  event the event that should be resend
         */
        function retryFailedSynchronizationEvent(event) {
            var resource = new StockEventResource();

            return resource.create(event)
                .then(function() {
                    removeEventSynchronizationError(event);
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

                    return filtredEvents;
                });
        }

        function fetchAndCombineEventData(userEvents, orderableResource) {
            var homeFacility,
                programs = [],
                sources = [],
                destinations = [],
                validAssignmentsList = [],
                orderableIds = [],
                lotIds = [],
                promises = [];

            if (!userEvents) {
                return [];
            }

            return facilityFactory.getUserHomeFacility().then(function(facility) {
                homeFacility = facility;
                programs = homeFacility.supportedPrograms;
                promises = getSourceDestinationPromises(programs, homeFacility, promises);

                return $q.all(promises).then(function(responses) {
                    sources = responses[0];
                    destinations = responses[1];

                    userEvents.forEach(function(event) {
                        event.lineItems.forEach(function(item) {

                            validAssignmentsList = getValidAssignments(
                                item, sources, destinations, validAssignmentsList
                            );

                            orderableIds = getIds(item.orderableId, orderableIds);
                            lotIds = getIds(item.lotId, lotIds);
                        });
                    });

                    return $q.resolve({
                        orderableIds: orderableIds,
                        lotIds: lotIds,
                        validAssignmentsList: validAssignmentsList,
                        userEvents: userEvents
                    });
                })
                    .then(function(result) {
                        return $q.all([
                            orderableResource.query({
                                id: result.orderableIds
                            }),
                            lotService.query({
                                id: result.lotIds
                            }),
                            stockReasonsFactory.getReasons(),
                            result.validAssignmentsList,
                            result.userEvents
                        ]).then(function(responses) {
                            var orderables = responses[0].content,
                                lots = responses[1].content,
                                reasons = responses[2],
                                validAssignmentsList = responses[3],
                                userEvents = responses[4];

                            return combineResponses(userEvents, programs, homeFacility, orderables,
                                lots, reasons, validAssignmentsList);
                        });
                    });
            });
        }

        function combineResponses(userEvents, programs, homeFacility, orderables, lots, reasons,
                                  validAssignmentsList) {
            var programsMap = prepareMap(programs),
                orderablesMap = prepareMap(orderables),
                lotsMap = prepareMap(lots),
                reasonsMap = prepareMap(reasons),
                validAssignmentsMap = validAssignmentsList.reduce(function(map, assignment) {
                    map[assignment.node.id] = assignment;
                    return map;
                }, {});

            return userEvents.map(function(event, ind) {
                event.ind = ind;
                event.program = programsMap[event.programId];
                event.facility = homeFacility;

                var lineItem = event.lineItems[0];

                event.eventType = adjustEventType(lineItem);

                event.lineItems = event.lineItems.map(function(item) {
                    if (item.sourceId) {
                        item.source = validAssignmentsMap[item.sourceId];
                    }

                    if (item.destinationId) {
                        item.destination = validAssignmentsMap[item.destinationId];
                    }

                    item.orderable = orderablesMap[item.orderableId];
                    item.lot = lotsMap[item.lotId];
                    item.reason = reasonsMap[item.reasonId];

                    return item;
                });

                return event;
            });
        }

        function getIds(id, idsList) {
            if (id && idsList.indexOf(id) === -1) {
                idsList.push(id);
            }
            return idsList;
        }

        function prepareMap(list) {
            return list.reduce(function(map, listItem) {
                map[listItem.id] = listItem;
                return map;
            }, {});
        }

        function getSourceDestinationPromises(programs, facility, promises) {
            programs.forEach(function(program) {
                promises.push(sourceDestinationService.getSourceAssignments(
                    program.id ? program.id : program,
                    facility.id ? facility.id : facility
                ));
                promises.push(sourceDestinationService.getDestinationAssignments(
                    program.id ? program.id : program,
                    facility.id ? facility.id : facility
                ));
            });

            return promises;
        }

        function getValidAssignments(lineItem, sources, destinations, validAssignmentsList) {
            if (lineItem.sourceId) {
                sources.forEach(function(source) {
                    if (source.node.id === lineItem.sourceId) {
                        validAssignmentsList.push(source);
                    }
                });
            }

            if (lineItem.destinationId) {
                destinations.forEach(function(destination) {
                    if (destination.node.id === lineItem.destinationId) {
                        validAssignmentsList.push(destination);
                    }
                });
            }

            return validAssignmentsList;
        }

        function adjustEventType(lineItem) {
            if (lineItem.sourceId) {
                return EVENT_TYPES.RECEIVE;
            } else if (lineItem.destinationId) {
                return EVENT_TYPES.ISSUE;
            }
            return EVENT_TYPES.ADJUSTMENT;
        }

    }
})();
